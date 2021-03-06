import React, { useCallback, useContext, useEffect, useState } from "react";
import createPersistedState from "use-persisted-state";
import debounce from "lodash/debounce";
import Button from "../../components/Button";
import PlayerList from "../../components/PlayerList";
import styles from "./style.module.css";
import TextField from "../../components/TextField";
import Dropdown from "../../components/Dropdown";
import { Settings } from "../../GameRouter";
import socket from "../../socket";
import { PlayersContext } from "../../providers/ContextProviders/PlayersContextProvider";

const usePlayerIdState = createPersistedState("playerId");

type Props = {
  gameCode: string;
  settings?: Settings;
};

const MINIMUM_PLAYERS = 3;

const LobbyPage = ({ gameCode, settings }: Props) => {
  const [, setResponse] = useState("");

  const { host, players } = useContext(PlayersContext);
  const [playerId] = usePlayerIdState("");
  const playerIsHost = playerId === host;

  const [maxPlayers, setMaxPlayers] = useState("");
  const [roundLimit, setRoundLimit] = useState("");

  useEffect(() => {
    if (settings) {
      if (settings.maxPlayers) {
        setMaxPlayers(settings.maxPlayers.toString());
      }
      if (settings.roundLimit) {
        setRoundLimit(settings.roundLimit.toString());
      }
    }
  }, [settings]);

  // Wait until 500ms after last input before emitting setting update
  const msDebounceDelay = 500;
  const updateSettings = useCallback(
    debounce((setting: string, value: string) => {
      if (value.match(/^\d+$/)) {
        socket.emit(
          "settings:update",
          setting,
          parseInt(value, 10),
          (response: string) => setResponse(response)
        );
      }
    }, msDebounceDelay),
    []
  );

  const handleChangeMaxPlayers = (newMaxPlayers: string) => {
    setMaxPlayers(newMaxPlayers);
    updateSettings("MAX_PLAYERS", newMaxPlayers);
  };

  const handleChangeRoundLimit = (newRoundLimit: string) => {
    setRoundLimit(newRoundLimit);
    updateSettings("ROUND_LIMIT", newRoundLimit);
  };

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
            navigator.clipboard.writeText(gameCode).catch();
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
          onChangeHandler={handleChangeMaxPlayers}
          disabled={!playerIsHost}
        />
      </div>
      <div className={styles.setting}>
        <p>Round limit</p>
        <TextField
          textValue={roundLimit}
          size="small"
          onChangeHandler={handleChangeRoundLimit}
          disabled={!playerIsHost}
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
          <h2>Players ({players.length})</h2>
          <PlayerList gameState="lobby" />
        </div>

        {playerIsHost && (
          <Button
            text="Start game"
            handleOnClick={() =>
              socket.emit("start", (response: string) => setResponse(response))
            }
            disabled={players.length < MINIMUM_PLAYERS}
          />
        )}
      </div>
    </>
  );
};

export default LobbyPage;
