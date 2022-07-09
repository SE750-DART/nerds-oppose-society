import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import Button from "../../components/Button";
import InputField from "../../components/InputField";
import styles from "./style.module.css";
import createGame from "../../api/createGame";
import { getRequestErrorMessage, useGet } from "../../hooks/axios";

const HomePage = () => {
  const [gameCode, setGameCode] = useState("");
  const [newGameError, setNewGameError] = useState("");

  const [{ error: gameCodeError }, validateGameCode] = useGet(
    "/api/game/validate",
    { params: { gameCode } }
  );

  const browserHistory = useHistory();

  const handleJoinGame = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const response = await validateGameCode();
    if (response?.status === 204) {
      browserHistory.push(`/${gameCode}`);
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
      <form onSubmit={handleJoinGame} action="">
        <InputField
          type="number"
          inputMode="decimal"
          label="Game code"
          textValue={gameCode}
          onChange={setGameCode}
        />
        <h5 style={{ color: "red", textAlign: "center" }}>
          {getRequestErrorMessage(gameCodeError)}
        </h5>
        <div className={styles.btnContainer}>
          <Button
            type="submit"
            disabled={!gameCode || !Number.isInteger(Number(gameCode))}
          >
            Join game
          </Button>
        </div>
      </form>
      <p className={`${styles.text} ${styles.btnSpacer}`}>OR</p>
      <Button variant="secondary" onClick={handleNewGame}>
        Start new game
      </Button>
      <h5 style={{ color: "red", textAlign: "center" }}>{newGameError}</h5>
      <div className={styles.footer}>
        <Link to="/about">About</Link> | <Link to="/legal">Legal</Link>
      </div>
    </div>
  );
};

export default HomePage;
