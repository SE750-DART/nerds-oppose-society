import React, { useState } from "react";
import createPersistedState from "use-persisted-state";
import Button from "../../components/Button";
import styles from "./style.module.css";
import { useRound } from "../../contexts/round";
import { usePlayers } from "../../contexts/players";
import { useSocket } from "../../contexts/socket";

const usePlayerIdState = createPersistedState("playerId");

const StartRoundPage = ({ roundLimit }: { roundLimit: number }) => {
  const [{ host, players }] = usePlayers();
  const [playerId] = usePlayerIdState("");
  const playerIsHost = playerId === host;
  const [, setResponse] = useState("");
  const [{ roundNumber }] = useRound();
  const socket = useSocket();

  return (
    <div className={styles.container}>
      <h4 className={styles.round}>
        Round {roundNumber} of {roundLimit}
      </h4>
      <div className={styles.theMan}>
        <p className={styles.theManText}>
          {playerIsHost
            ? "You are The Man™."
            : `${
                host && players[host] ? players[host].nickname : "No-one"
              } is The Man™.`}
        </p>
      </div>

      {playerIsHost ? (
        <Button
          onClick={() =>
            socket.emit("round:host-begin", (response: string) =>
              setResponse(response)
            )
          }
        >
          Leshgo!
        </Button>
      ) : (
        <p className={styles.waitingMsg}>
          Waiting on {host && players[host] ? players[host].nickname : "No-one"}{" "}
          to start the round...
        </p>
      )}
    </div>
  );
};

export default StartRoundPage;
