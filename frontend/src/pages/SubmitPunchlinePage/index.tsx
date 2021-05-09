import React, { useContext, useState } from "react";
import createPersistedState from "use-persisted-state";
import styles from "./style.module.css";
import Dropdown from "../../components/Dropdown";
import PlayerList from "../../components/PlayerList";
import ProgressBar from "../../components/ProgressBar";
import PunchlineCard from "../../components/PunchlineCard";
import Button from "../../components/Button";
import Setup from "../../components/Setup";
import { PlayersContext } from "../../providers/ContextProviders/PlayersContextProvider";
import { PunchlinesContext } from "../../providers/ContextProviders/PunchlinesContextProvider";
import { RoundContext } from "../../providers/ContextProviders/RoundContextProvider";
import socket from "../../socket";

const usePlayerIdState = createPersistedState("playerId");

const SubmitPunchlinePage = ({ roundLimit }: { roundLimit: number }) => {
  const [, setResponse] = useState("");

  const { host, players } = useContext(PlayersContext);
  const { punchlines, removePunchline } = useContext(PunchlinesContext);
  const {
    roundNumber,
    setup,
    numPlayersChosen,
    incrementPlayersChosen,
  } = useContext(RoundContext);

  const [playerId] = usePlayerIdState("");
  const playerIsHost = playerId === host;

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
        <Setup setupText={setup.setup} />

        <ProgressBar
          playersChosen={numPlayersChosen}
          playersTotal={players.length - 1}
        />

        <h5 style={{ margin: `18px 0` }}>
          {punchlineSubmitted ? `Punchline sent!` : `Choose a Punchline:`}
        </h5>
        {!playerIsHost &&
          punchlines.map((punchline) => {
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
                removePunchline(punchlineSelected);
                setPunchlineSelected("");

                incrementPlayersChosen();
                socket.emit(
                  "round:player-choose",
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

export default SubmitPunchlinePage;
