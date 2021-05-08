import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Button from "../../components/Button";
import styles from "./style.module.css";

const LobbyPage = () => {
  const memoryHistory = useHistory();

  const [isTheMan] = useState(true);

  return (
    <div className={styles.container}>
      <h4 className={styles.round}>Round X of X</h4>
      <div className={styles.theMan}>
        <p className={styles.theManText}>
          {isTheMan ? "You are The Man™." : "USERNAME is The Man™."}
        </p>
      </div>

      {isTheMan ? (
        <Button
          text="Leshgo!"
          handleOnClick={() => memoryHistory.push("/selectPunchline")}
        />
      ) : (
        <p className={styles.waitingMsg}>Waiting on X to start the round...</p>
      )}
    </div>
  );
};

export default LobbyPage;
