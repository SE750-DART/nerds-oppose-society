import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import Button from "../../components/Button";
import TextField from "../../components/TextField";
import styles from "./style.module.css";
import validateGame from "../../api/validateGame";
import createGame from "../../api/createGame";

const HomePage = () => {
  const [gameCode, setGameCode] = useState("");
  const [gameCodeError, setGameCodeError] = useState("");
  const [newGameError, setNewGameError] = useState("");

  const browserHistory = useHistory();

  const handleJoinGame = async () => {
    const res = await validateGame({ gameCode });

    if (res.success) {
      browserHistory.push(`/${gameCode}`);
    } else {
      setGameCodeError(res.error);
    }
  };

  const handleNewGame = async () => {
    const res = await createGame();

    if (res.success) {
      if (res.data) {
        browserHistory.push(`/${res.data}`);
      } else {
        setNewGameError("Unknown Error, please try again");
      }
    } else {
      setNewGameError(res.error);
    }
  };

  return (
    <div className={styles.container}>
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
      <h5 style={{ color: "red", textAlign: "center" }}>{gameCodeError}</h5>
      <div className={styles.btnContainer}>
        <Button
          text="Join game"
          handleOnClick={handleJoinGame}
          disabled={!gameCode}
        />
      </div>
      <p className={`${styles.text} ${styles.btnSpacer}`}>OR</p>
      <Button
        variant="secondary"
        text="Start new game"
        handleOnClick={handleNewGame}
      />
      <h5 style={{ color: "red", textAlign: "center" }}>{newGameError}</h5>
      <div className={styles.footer}>
        <Link to="/">About</Link> | <Link to="/legal">Legal</Link>
      </div>
    </div>
  );
};

export default HomePage;
