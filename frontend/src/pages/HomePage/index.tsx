import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import Button from "../../components/Button";
import InputField from "../../components/InputField";
import styles from "./style.module.css";
import { getRequestErrorMessage, useGet, usePost } from "../../hooks/axios";

const HomePage = () => {
  const [gameCode, setGameCode] = useState("");

  const [{ error: validateGameCodeError }, validateGameCode] = useGet(
    "/api/game/validate",
    { params: { gameCode } }
  );

  const [{ error: createGameError }, createGame] =
    usePost<number>("/api/game/create");

  const browserHistory = useHistory();

  const handleJoinGame = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const response = await validateGameCode();
    if (response?.status === 204) {
      browserHistory.push(`/${gameCode}`);
    }
  };

  const handleNewGame = async () => {
    const response = await createGame();
    if (response?.status === 201) {
      browserHistory.push(`/${response.data}`);
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
          {getRequestErrorMessage(validateGameCodeError)}
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
      <h5 style={{ color: "red", textAlign: "center" }}>{createGameError}</h5>
      <div className={styles.footer}>
        <Link to="/about">About</Link> | <Link to="/legal">Legal</Link>
      </div>
    </div>
  );
};

export default HomePage;
