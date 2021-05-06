import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Button from "../../components/Button";
import PlayerList from "../../components/PlayerList";
import styles from "./style.module.css";
import TextField from "../../components/TextField";
import Dropdown from "../../components/Dropdown";
import { Settings } from "../../../../backend/src/models";

type Props = {
  gameCode: string;
  settings?: Settings;
};

const LobbyPage = ({ gameCode, settings }: Props) => {
  const memoryHistory = useHistory();

  const [maxPlayers, setMaxPlayers] = useState("");
  const [roundLimit, setRoundLimit] = useState("");

  useEffect(() => {
    if (settings) {
      if (settings.maxPlayers) {
        setRoundLimit(settings.maxPlayers.toString());
      }
      if (settings.roundLimit) {
        setRoundLimit(settings.roundLimit.toString());
      }
    }
  }, [settings]);

  const gameCodeNodes: React.ReactNode = (
    <>
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
    </>
  );

  const gameSettingsNodes: React.ReactNode = (
    <>
      <div className={styles.setting}>
        <p>Max players</p>
        <TextField
          textValue={maxPlayers}
          size="small"
          onChangeHandler={setMaxPlayers}
        />
      </div>
      <div className={styles.setting}>
        <p>Round limit</p>
        <TextField
          textValue={roundLimit}
          size="small"
          onChangeHandler={setRoundLimit}
        />
      </div>
    </>
  );

  return (
    <>
      <Dropdown
        aboveDrop={gameCodeNodes}
        belowDrop={gameSettingsNodes}
        header="Game settings"
      />
      <div className={styles.container}>
        <div className={styles.main}>
          <h2>Players (X)</h2>
          <PlayerList gameState="lobby" />
        </div>

        <Button
          text="Start game"
          handleOnClick={() => memoryHistory.push("/preRound")}
        />
      </div>
    </>
  );
};

export default LobbyPage;
