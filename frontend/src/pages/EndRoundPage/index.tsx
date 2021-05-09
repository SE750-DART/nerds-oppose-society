import React, { useContext, useState } from "react";
import createPersistedState from "use-persisted-state";
import styles from "./style.module.css";
import PlayerList from "../../components/PlayerList";
import PunchlineCard from "../../components/PunchlineCard";
import { RoundContext } from "../../providers/ContextProviders/RoundContextProvider";
import { PlayersContext } from "../../providers/ContextProviders/PlayersContextProvider";
import Button from "../../components/Button";
import socket from "../../socket";

const usePlayerIdState = createPersistedState("playerId");

const EndRoundPage = ({ roundLimit }: { roundLimit: number }) => {
  const [, setResponse] = useState("");

  const { host } = useContext(PlayersContext);
  const [playerId] = usePlayerIdState("");
  const playerIsHost = playerId === host;

  const { roundNumber, setup, winner } = useContext(RoundContext);

  return (
    <div className={styles.container}>
      <h4 className={styles.round}>
        Round {roundNumber} of {roundLimit}
      </h4>
      <div className={styles.endOfRound}>
        <div style={{ margin: `24px 0` }}>
          <h5>The Setup:</h5>
          <h2>{setup.setup}</h2>
        </div>

        <h5 style={{ marginBottom: `12px` }}>Winning Punchline:</h5>
        {winner.winningPunchlines.map((punchline) => (
          <PunchlineCard key={punchline} text={punchline} />
        ))}

        <h2>Scoreboard</h2>
        <PlayerList gameState="endround" />
      </div>

      {playerIsHost ? (
        <Button
          text="Let's go again!"
          handleOnClick={() =>
            socket.emit("round:host-next", (response: string) =>
              setResponse(response)
            )
          }
        />
      ) : (
        <p className={styles.waitingMsg}>Waiting for next round...</p>
      )}
    </div>
  );
};
export default EndRoundPage;
