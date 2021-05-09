import React, { useContext, useState } from "react";
import styles from "./style.module.css";
import Dropdown from "../../components/Dropdown";
import PlayerList from "../../components/PlayerList";
import ProgressBar from "../../components/ProgressBar";
import PunchlineCard from "../../components/PunchlineCard";
import Button from "../../components/Button";
import { PlayersContext } from "../../providers/ContextProviders/PlayersContextProvider";
import { PunchlinesContext } from "../../providers/ContextProviders/PunchlinesContextProvider";
import { RoundContext } from "../../providers/ContextProviders/RoundContextProvider";
import socket from "../../socket";

const SubmitPunchlinePage = ({ roundLimit }: { roundLimit: number }) => {
  const { players } = useContext(PlayersContext);
  const { punchlines } = useContext(PunchlinesContext);
  const {
    roundNumber,
    setup,
    numPlayersChosen,
    incrementPlayersChosen,
  } = useContext(RoundContext);

  const [punchlineSelected, setPunchlineSelected] = useState("");
  const [punchlineSubmitted, setPunchlineSubmitted] = useState("");

  const selectPunchline = (text: string) => {
    if (punchlineSubmitted) return;

    if (text === punchlineSelected) {
      setPunchlineSelected("");
    } else {
      setPunchlineSelected(text);
    }
  };

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
        <div className={styles.spacer}>
          <h5>The Setup:</h5>
          <h2>{setup.setup}</h2>
        </div>
        <div className={styles.spacer}>
          <ProgressBar
            playersChosen={numPlayersChosen}
            playersTotal={players.length}
          />
        </div>

        <h5 style={{ marginBottom: `18px` }}>
          {punchlineSubmitted ? `Punchline sent!` : `Choose a Punchline:`}
        </h5>
        {punchlines.map((punchline) => {
          let punchlineStatus: "available" | "selected" | "submitted";
          if (punchline.text === punchlineSubmitted) {
            punchlineStatus = "submitted";
          } else if (punchline.text === punchlineSelected) {
            punchlineStatus = "selected";
          } else {
            punchlineStatus = "available";
          }

          return (
            <PunchlineCard
              key={punchline.text}
              text={punchline.text}
              handleOnClick={() => selectPunchline(punchline.text)}
              status={punchlineStatus}
              newCard={punchline.new}
            />
          );
        })}
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
                setPunchlineSubmitted(punchlineSelected);
                setPunchlineSelected("");

                incrementPlayersChosen();
                socket.emit(
                  "round:player-choose",
                  [punchlineSelected],
                  (res: any) => console.log(res)
                );
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default SubmitPunchlinePage;
