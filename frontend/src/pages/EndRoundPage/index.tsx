import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import styles from "./style.module.css";
import PlayerList from "../../components/PlayerList";
import PunchlineCard from "../../components/PunchlineCard";

const EndRoundPage = () => {
  const memoryHistory = useHistory();

  const [setup] = useState("Daddy, why is Mommy crying?");
  const [winningPunchline] = useState(
    "Looking in the mirror, applying lipstick, and whispering “tonight, you will have sex with Tom Cruise.”"
  );
  const [nextRoundIn, setNextRoundIn] = useState(5);

  useEffect(() => {
    const nextRoundTimer = setTimeout(
      () => setNextRoundIn(nextRoundIn - 1),
      1000
    );
    return () => clearTimeout(nextRoundTimer);
  });

  useEffect(() => {
    if (nextRoundIn === 0) {
      memoryHistory.push("/scoreboard");
    }
  }, [nextRoundIn]);

  return (
    <div className={styles.container}>
      <h4 className={styles.round}>Round X of X</h4>
      <div className={styles.endOfRound}>
        <div style={{ margin: `24px 0` }}>
          <h5>The Setup:</h5>
          <h2>{setup}</h2>
        </div>

        <h5 style={{ marginBottom: `12px` }}>Winning Punchline:</h5>
        <PunchlineCard text={winningPunchline} handleOnClick={() => {}} />

        <h2>Scoreboard</h2>
        <PlayerList gameState="endround" />
      </div>

      <p className={styles.waitingMsg}>Next round in {nextRoundIn}...</p>
    </div>
  );
};

export default EndRoundPage;
