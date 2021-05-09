import React, { useContext } from "react";
import createPersistedState from "use-persisted-state";
import Button from "../../components/Button";
import styles from "./style.module.css";
import socket from "../../socket";
import { RoundContext } from "../../providers/ContextProviders/RoundContextProvider";
import { PlayersContext } from "../../providers/ContextProviders/PlayersContextProvider";

const usePlayerIdState = createPersistedState("playerId");

const StartRoundPage = ({ roundLimit }: { roundLimit: number }) => {
  const { host, players } = useContext(PlayersContext);
  const [playerId] = usePlayerIdState("");
  const playerIsHost = playerId === host;
  const { roundNumber } = useContext(RoundContext);

  return (
    <div className={styles.container}>
      <h4 className={styles.round}>
        Round {roundNumber} of {roundLimit}
      </h4>
      <div className={styles.theMan}>
        <p className={styles.theManText}>
          {playerIsHost
            ? "You are The Man™."
            : `${players.find((p) => p.id === host)?.nickname} is The Man™.`}
        </p>
      </div>

      {playerIsHost ? (
        <Button
          text="Leshgo!"
          handleOnClick={() => socket.emit("round:host-begin")}
        />
      ) : (
        <p className={styles.waitingMsg}>Waiting on X to start the round...</p>
      )}
    </div>
  );
};

export default StartRoundPage;
