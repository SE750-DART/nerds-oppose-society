import React, { useState } from "react";
import createPersistedState from "use-persisted-state";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import styles from "./style.module.css";
import { getRequestErrorMessage, usePost } from "../../hooks/axios";

const usePlayerIdState = createPersistedState("playerId");
const useTokenState = createPersistedState("token");

type Props = {
  gameCode: string;
};

const NicknamePage = ({ gameCode }: Props) => {
  const [nickname, setNickname] = useState("");
  const [, setPlayerId] = usePlayerIdState("");
  const [, setToken] = useTokenState("");

  const [{ error: createPlayerError }, createPlayer] = usePost<{
    playerId: string;
    token: string;
  }>("/api/player/create", undefined, { params: { gameCode, nickname } });

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
