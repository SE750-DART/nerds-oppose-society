import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import TextField from "../../components/TextField";
import Button from "../../components/Button";
import styles from "./style.module.css";

const NicknamePage = () => {
  const memoryHistory = useHistory();

  const [nickname, setNickname] = useState("");

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
      <Button
        text="Submit"
        handleOnClick={() => memoryHistory.push("/lobby")}
      />
    </div>
  );
};

export default NicknamePage;
