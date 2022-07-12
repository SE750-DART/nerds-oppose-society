import React, { useCallback, useState } from "react";
import createPersistedState from "use-persisted-state";
import styles from "./style.module.css";
import Dropdown from "../../components/Dropdown";
import PlayerList from "../../components/PlayerList";
import ProgressBar from "../../components/ProgressBar";
import PunchlineCard from "../../components/PunchlineCard";
import Button from "../../components/Button";
import Setup from "../../components/Setup";
import { RoundAction, useRound } from "../../contexts/round";
import { usePlayers } from "../../contexts/players";
import { PunchlinesAction, usePunchlines } from "../../contexts/punchlines";
import { Punchline } from "../../types";
import { useSocket } from "../../contexts/socket";

const usePlayerIdState = createPersistedState("playerId");

const SubmitPunchlinePage = ({ roundLimit }: { roundLimit: number }) => {
  const [, setResponse] = useState("");
  const socket = useSocket();

  const [{ host, count }] = usePlayers();
  const [punchlines, dispatchPunchlines] = usePunchlines();
  const [{ roundNumber, setup, numPlayersChosen }, dispatchRound] = useRound();

  const [playerId] = usePlayerIdState("");
  const playerIsHost = playerId === host;

  const [punchlineSelected, setPunchlineSelected] = useState<Punchline>();
  const [punchlineSubmitted, setPunchlineSubmitted] = useState<Punchline>();

  const handleSelect = (punchline: Punchline) => {
    if (punchlineSubmitted) return;

    if (punchline.text === punchlineSelected?.text) {
      setPunchlineSelected(undefined);
    } else {
      setPunchlineSelected(punchline);
    }
  };

  const handleSubmit = useCallback(() => {
    if (punchlineSelected) {
      // TODO: Remove this to rely on "punchlines:remove" event
      dispatchPunchlines({
        type: PunchlinesAction.REMOVE,
        punchlines: [punchlineSelected.text],
      });

      setPunchlineSubmitted(punchlineSelected);
      setPunchlineSelected(undefined);

      dispatchRound({ type: RoundAction.INCREMENT_PLAYERS_CHOSEN });
      socket.emit(
        "round:player-choose",
        [punchlineSelected.text],
        (response: string) => {
          setResponse(response);
        }
      );
    }
  }, [dispatchPunchlines, dispatchRound, punchlineSelected, socket]);

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
        <Setup setupText={setup?.setup ?? ""} />

        <ProgressBar
          playersChosen={numPlayersChosen}
          playersTotal={count - 1}
        />

        <h5 style={{ margin: `18px 0` }}>
          {punchlineSubmitted ? `Punchline sent!` : `Choose a Punchline:`}
        </h5>
        {!playerIsHost &&
          punchlines.map((punchline) => {
            let punchlineStatus: "available" | "selected" | "submitted";
            if (punchline.text === punchlineSubmitted?.text) {
              punchlineStatus = "submitted";
            } else if (punchline.text === punchlineSelected?.text) {
              punchlineStatus = "selected";
            } else {
              punchlineStatus = "available";
            }

            return (
              <PunchlineCard
                key={punchline.text}
                text={punchline.text}
                handleOnClick={() => handleSelect(punchline)}
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
              onClick={() => setPunchlineSelected(undefined)}
              variant="secondary"
            >
              Nah
            </Button>
          </div>
          <div className={styles.btnSend}>
            <Button onClick={handleSubmit}>Send it</Button>
          </div>
        </div>
      )}
    </>
  );
};

export default SubmitPunchlinePage;
