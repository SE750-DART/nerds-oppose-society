import React, { useContext, useState } from "react";
import Button from "../../components/Button";
import styles from "./style.module.css";
import socket from "../../socket";
import { RoundContext } from "../../providers/ContextProviders/RoundContextProvider";

const StartRoundPage = ({ roundLimit }: { roundLimit: number }) => {
  const [isTheMan] = useState(true);

  const { roundNumber } = useContext(RoundContext);

  return (
    <div className={styles.container}>
      <h4 className={styles.round}>
        Round {roundNumber} of {roundLimit}
      </h4>
      <div className={styles.theMan}>
        <p className={styles.theManText}>
          {isTheMan ? "You are The Man™." : "USERNAME is The Man™."}
        </p>
      </div>

      {isTheMan ? (
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
