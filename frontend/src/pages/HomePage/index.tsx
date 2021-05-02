import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Button from "../../components/Button";
import TextField from "../../components/TextField";
import styles from "./style.module.css";

const HomePage = () => {
  const [gameCode, setGameCode] = useState("");

  const browserHistory = useHistory();

  return (
    <>
      <h1>Nerds Oppose Society</h1>
      <p className={styles.text}>
        Your favourite online game that coincidentally uses the writing from
        Cards Against Humanity®.
      </p>
      <TextField
        label="Game code"
        textValue={gameCode}
        onChangeHandler={setGameCode}
      />
      <div className={styles.btnContainer}>
        <Button
          text="Join game"
          handleOnClick={() => browserHistory.push(`/${gameCode}`)}
        />
      </div>
      <p className={`${styles.text} ${styles.btnSpacer}`}>OR</p>
      <Button
        variant="secondary"
        text="Start new game"
        handleOnClick={() => browserHistory.push(`/${gameCode}`)}
      />
      <div className={styles.footer}>
        <a href="/">About</a> | <a href="/">Legal</a>
      </div>
    </>
  );
};

export default HomePage;
