import React from "react";
import styles from "./style.module.css";

interface ProgressBarProps {
  playersChosen: number;
  playersTotal: number;
}

const ProgressBar = (ProgressBarProps: ProgressBarProps) => {
  let { playersChosen } = ProgressBarProps;
  const { playersTotal } = ProgressBarProps;

  if (playersChosen > playersTotal) {
    playersChosen = playersTotal;
  }

  const percentageComplete = (playersChosen / playersTotal) * 100;
  const message = `${playersChosen}/${playersTotal} players have chosen`;

  return (
    <>
      <div className={styles.barContainer}>
        <div
          className={styles.barComplete}
          style={{ width: `${percentageComplete}%` }}
        />
      </div>

      <h5>{message}</h5>
    </>
  );
};

export default ProgressBar;
