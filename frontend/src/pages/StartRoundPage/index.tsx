import React, { useContext, useState } from "react";
import createPersistedState from "use-persisted-state";
import Button from "../../components/Button";
import styles from "./style.module.css";
import socket from "../../socket";
import { RoundContext } from "../../contexts/round";
import { usePlayers } from "../../contexts/players";

const usePlayerIdState = createPersistedState("playerId");

const StartRoundPage = ({ roundLimit }: { roundLimit: number }) => {
  const { host, players } = usePlayers();
  const [playerId] = usePlayerIdState("");
  const playerIsHost = playerId === host;
  const [, setResponse] = useState("");
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
          handleOnClick={() =>
            socket.emit("round:host-begin", (response: string) =>
              setResponse(response)
            )
          }
        />
      ) : (
        <p className={styles.waitingMsg}>Waiting on X to start the round...</p>
      )}
    </div>
  );
};

export default StartRoundPage;
