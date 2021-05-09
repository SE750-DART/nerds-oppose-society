import React, { useContext, useEffect, useState } from "react";
import createPersistedState from "use-persisted-state";
import styles from "./style.module.css";
import Dropdown from "../../components/Dropdown";
import PlayerList from "../../components/PlayerList";
import ProgressBar from "../../components/ProgressBar";
import PunchlineCard from "../../components/PunchlineCard";
import Button from "../../components/Button";
import { PlayersContext } from "../../providers/ContextProviders/PlayersContextProvider";
import { RoundContext } from "../../providers/ContextProviders/RoundContextProvider";
import socket from "../../socket";

const usePlayerIdState = createPersistedState("playerId");

const SelectPunchlinePage = ({ roundLimit }: { roundLimit: number }) => {
  const [, setResponse] = useState("");

  const { host } = useContext(PlayersContext);
  const [playerId] = usePlayerIdState("");
  const playerIsHost = playerId === host;

  const { players } = useContext(PlayersContext);
  const {
    roundNumber,
    setup,
    numPlayersChosen,
    punchlinesChosen: punchlines,
    markPunchlineRead,
  } = useContext(RoundContext);

  const [punchlineSelected, setPunchlineSelected] = useState("");
  const [waiting, setWaiting] = useState(true);
  const [finishedReading, setFinishedReading] = useState(false);

  useEffect(() => {
    if (punchlines.length !== 0) {
      setWaiting(false);

      if (punchlines.every((value) => value.viewed)) {
        setFinishedReading(true);
      }
    }
  }, [punchlines]);

  let promptMessage: string;
  if (waiting) {
    promptMessage = "Waiting on players to choose punchlines...";
  } else if (!finishedReading) {
    promptMessage = "Tap to reveal each punchline!";
  } else {
    promptMessage = "Choose the best punchline!";
  }

  const selectPunchline = (text: string, index: number) => {
    if (!playerIsHost) return;

    if (finishedReading) {
      if (text === punchlineSelected) {
        setPunchlineSelected("");
      } else {
        setPunchlineSelected(text);
      }
    } else {
      markPunchlineRead(index);
      socket.emit("round:host-view", index, (response: string) => {
        setResponse(response);
      });
    }
  };

  useEffect(() => {
    if (!playerIsHost) {
      socket.on("round:host-view", (index: number) => {
        markPunchlineRead(index);
      });
    }
    return () => {
      socket.off("round:host-view");
    };
  });

  return (
    <>
      <Dropdown
        aboveDrop={
          <h4 style={{ textAlign: `center` }}>
            Round {roundNumber} of {roundLimit}
          </h4>
        }
        belowDrop={<PlayerList gameState="midround" />}
        header="Scoreboard"
      />

      <div className={styles.container}>
        <p className={styles.theManText}>You are The Man™.</p>
        <p style={{ fontStyle: `italic` }}>{promptMessage}</p>

        <div
          className={`${styles.setup} ${
            waiting ? styles.setupNoGradient : undefined
          }`}
        >
          <h5>The Setup:</h5>
          <h2>{setup.setup}</h2>
        </div>

        {waiting && (
          <ProgressBar
            playersChosen={numPlayersChosen}
            playersTotal={players.length}
          />
        )}

        {punchlines &&
          punchlines.map((punchline, index) => (
            <PunchlineCard
              key={punchline.text}
              text={punchline.text}
              handleOnClick={() => selectPunchline(punchline.text, index)}
              status={
                finishedReading && punchline.text === punchlineSelected
                  ? "selected"
                  : "available"
              }
              blurred={!punchline.viewed}
            />
          ))}
      </div>

      {punchlineSelected && (
        <div className={styles.bottomBtns}>
          <div className={styles.btnNah}>
            <Button
              text="Nah"
              handleOnClick={() => setPunchlineSelected("")}
              variant="secondary"
            />
          </div>
          <div className={styles.btnSend}>
            <Button
              text="Send it"
              handleOnClick={() => {
                socket.emit(
                  "round:host-choose",
                  [punchlineSelected],
                  (response: string) => {
                    setResponse(response);
                  }
                );
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default SelectPunchlinePage;
