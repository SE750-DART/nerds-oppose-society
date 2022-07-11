import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import createPersistedState from "use-persisted-state";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import styles from "./style.module.css";
import { BrowserHistoryContext } from "../../App";
import { getRequestErrorMessage, useGet, usePost } from "../../hooks/axios";
import { useSocket } from "../../contexts/socket";

const usePlayerIdState = createPersistedState("playerId");
const useTokenState = createPersistedState("token");

type Props = {
  gameCode: string;
};

const NicknamePage = ({ gameCode }: Props) => {
  const [nickname, setNickname] = useState("");
  const [playerId, setPlayerId] = usePlayerIdState("");
  const [token, setToken] = useTokenState("");
  const browserHistory = useContext(BrowserHistoryContext);
  const socket = useSocket();

  const [, validateGameCode] = useGet(
    "/api/game/validate",
    /*
    As `validateGameCode` runs inside a `useEffect()` we need to create the
    config object with `useMemo()` to prevent unnecessary re-renders.
     */
    useMemo(
      () => ({
        params: { gameCode },
      }),
      [gameCode]
    )
  );

  const [{ error: createPlayerError }, createPlayer] = usePost<{
    playerId: string;
    token: string;
  }>("/api/player/create", undefined, { params: { gameCode, nickname } });

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      const response = await validateGameCode(controller);
      if (response === null) {
        browserHistory.push("/");
      }
    })();
    return () => controller.abort();
  }, [browserHistory, validateGameCode]);

  const tryConnect = useCallback(async () => {
    if (playerId && token) {
      socket.auth = { gameCode, playerId, token };
      // If the connection fails here, playerId and token are cleared by event handler in GameRouter
      // This reruns this useEffect since playerId and token changed,
      // but it does not connect again because playerId and token are falsy
      socket.connect();
    }
  }, [gameCode, playerId, socket, token]);

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      tryConnect();
    }
    return () => {
      mounted = false;
    };
  }, [gameCode, token, tryConnect]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const response = await createPlayer();
    if (response?.status === 201) {
      const { playerId, token } = response.data;
      setPlayerId(playerId);
      setToken(token);
    }
  };

  return (
    <div className={styles.container}>
      <h4>Nickname:</h4>
      <form onSubmit={handleSubmit} action="">
        <div className={styles.spacer}>
          <InputField
            label="Nickname"
            textValue={nickname}
            onChange={setNickname}
          />
        </div>
        <h5 style={{ color: "red", textAlign: "center" }}>
          {getRequestErrorMessage(createPlayerError)}
        </h5>
        <Button type="submit" disabled={!nickname}>
          Submit
        </Button>
      </form>
    </div>
  );
};

export default NicknamePage;
