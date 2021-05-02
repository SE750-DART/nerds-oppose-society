import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Button from "../../components/Button";
import PlayerList from "../../components/PlayerList";
import styles from "./style.module.css";
import TextField from "../../components/TextField";

type Props = {
  gameCode: string;
};

const LobbyPage = ({ gameCode }: Props) => {
  const memoryHistory = useHistory();

  const [scoreToWin, setScoreToWin] = useState("");
  const [roundLimit, setRoundLimit] = useState("");

  return (
    <>
      <div className={styles.main}>
        <h5>Game code:</h5>
        <div className={styles.codeContainer}>
          <h2>{gameCode}</h2>
          <Button
            variant="secondary"
            size="small"
            text="Copy"
            handleOnClick={() => {
              navigator.clipboard.writeText(gameCode);
            }}
          />
        </div>

        {/* TODO: Add dropdown for game settings */}

        <h4>Game settings</h4>
        <div className={styles.setting}>
          <p>Score to win</p>
          <TextField
            label=""
            textValue={scoreToWin}
            size="small"
            onChangeHandler={setScoreToWin}
          />
        </div>
        <div className={styles.setting}>
          <p>Round limit</p>
          <TextField
            label=""
            textValue={roundLimit}
            size="small"
            onChangeHandler={setRoundLimit}
          />
        </div>

        <h2>Players (X)</h2>
        <PlayerList gameState="lobby" />
      </div>

      <Button
        text="Start game"
        handleOnClick={() => memoryHistory.push("/preRound")}
      />
    </>
  );
};

export default LobbyPage;
