import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import createPersistedState from "use-persisted-state";
import TextField from "../../components/TextField";
import Button from "../../components/Button";
import styles from "./style.module.css";
import { BrowserHistoryContext } from "../../App";
import validateGame from "../../api/validateGame";
import createPlayer from "../../api/createPlayer";

const useUserIdState = createPersistedState("userId");

type Props = {
  gameCode: string;
};

const NicknamePage = ({ gameCode }: Props) => {
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [userId, setUserId] = useUserIdState("");

  const memoryHistory = useHistory();
  const browserHistory = useContext(BrowserHistoryContext);

  useEffect(() => {
    (async () => {
      const res = await validateGame({ gameCode });

      const gameCodeIsValid = res.success;
      if (gameCodeIsValid) {
        if (userId) {
          // TODO try connect to socket.io
          // No way to check whether userId is for the current gameCode
        } else {
          // Stay on this page
        }
      } else {
        browserHistory.push("/");
      }
    })();
  }, []);

  const handleSubmit = async () => {
    const res = await createPlayer({ gameCode, nickname });

    if (res.success) {
      if (res.data) {
        setUserId(res.data);
        // TODO connect to socket.io, remove memoryHistory.push
        memoryHistory.push("/lobby");
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
      <div className={styles.spacer}>
        <TextField
          label="Nickname"
          textValue={nickname}
          onChangeHandler={setNickname}
        />
      </div>
      <h5 style={{ color: "red", textAlign: "center" }}>{error}</h5>
      <Button text="Submit" handleOnClick={handleSubmit} disabled={!nickname} />
    </div>
  );
};

export default NicknamePage;
