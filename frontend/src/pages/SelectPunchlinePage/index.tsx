import React, { useEffect, useState } from "react";
import createPersistedState from "use-persisted-state";
import styles from "./style.module.css";
import Dropdown from "../../components/Dropdown";
import PlayerList from "../../components/PlayerList";
import ProgressBar from "../../components/ProgressBar";
import PunchlineCard from "../../components/PunchlineCard";
import Button from "../../components/Button";
import Setup from "../../components/Setup";
import { usePlayers } from "../../contexts/players";
import { useRound } from "../../contexts/round";
import { useSocket } from "../../contexts/socket";

const usePlayerIdState = createPersistedState("playerId");

const SelectPunchlinePage = ({ roundLimit }: { roundLimit: number }) => {
  const socket = useSocket();
  const [, setResponse] = useState("");

  const [{ host, count }] = usePlayers();
  const [playerId] = usePlayerIdState("");
  const playerIsHost = playerId === host;

  const {
    roundNumber,
    setup,
    numPlayersChosen,
    punchlinesChosen: punchlines,
    markPunchlineRead,
  } = useRound();

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
        {playerIsHost && (
          <>
            <p className={styles.theManText}>You are The Man™.</p>
            <p style={{ fontStyle: `italic` }}>{promptMessage}</p>
          </>
        )}

        <Setup setupText={setup.setup} />

        {waiting && (
          <ProgressBar playersChosen={numPlayersChosen} playersTotal={count} />
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
              onClick={() => setPunchlineSelected("")}
              variant="secondary"
            >
              Nah
            </Button>
          </div>
          <div className={styles.btnSend}>
            <Button
              onClick={() => {
                socket.emit(
                  "round:host-choose",
                  [punchlineSelected],
                  (response: string) => {
                    setResponse(response);
                  }
                );
              }}
            >
              Send it
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default SelectPunchlinePage;
