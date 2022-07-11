import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import styles from "./style.module.css";
import PlayerList from "../../components/PlayerList";
import Button from "../../components/Button";
import { BrowserHistoryContext } from "../../App";

const EndGamePage = () => {
  const browserHistory = useContext(BrowserHistoryContext);
  const memoryHistory = useHistory();

  return (
    <div className={styles.container}>
      <h4 className={styles.round}>Game over!</h4>

      <div className={styles.endOfRound}>
        <h2>Results</h2>
        <PlayerList gameState="endgame" />
      </div>

      <div className={styles.bottomBtn}>
        <Button onClick={() => memoryHistory.push("/lobby")}>Play again</Button>
      </div>
      <div className={styles.bottomBtn}>
        <Button onClick={() => browserHistory.push("/")} variant="secondary">
          Never mind
        </Button>
      </div>
    </div>
  );
};

export default EndGamePage;
