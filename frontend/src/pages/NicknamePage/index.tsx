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
import createPlayer from "../../api/createPlayer";
import socket from "../../socket";
import { useGet } from "../../hooks/axios";

const usePlayerIdState = createPersistedState("playerId");
const useTokenState = createPersistedState("token");

type Props = {
  gameCode: string;
};

const NicknamePage = ({ gameCode }: Props) => {
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [playerId, setPlayerId] = usePlayerIdState("");
  const [token, setToken] = useTokenState("");
  const browserHistory = useContext(BrowserHistoryContext);

  const [, validateGameCode] = useGet(
    "/api/game/validate",
    /*
    As `validateGameCode` runs inside a `useEffect()` we need to create the
    config object with `useMemo()` to prevent necessary re-renders.
     */
    useMemo(
      () => ({
        params: { gameCode },
      }),
      [gameCode]
    )
  );

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
  }, [gameCode, playerId, token]);

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

    const res = await createPlayer({ gameCode, nickname });

    if (res.success) {
      if (res.data) {
        // This triggers the useEffect to connect to socket.io
        setPlayerId(res.data.playerId);
        setToken(res.data.token);
      } else {
        setError("Unknown Error, please try again");
      }
    } else {
      setError(res.error);
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
        <h5 style={{ color: "red", textAlign: "center" }}>{error}</h5>
        <Button type="submit" disabled={!nickname}>
          Submit
        </Button>
      </form>
    </div>
  );
};

export default NicknamePage;
