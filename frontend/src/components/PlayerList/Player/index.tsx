import React from "react";
import styles from "./style.module.css";

interface PlayerProps {
  nickname: string;
  score?: number;
  highlight?: boolean;
  last: boolean;
}

const Player = ({ nickname, score, highlight = false, last }: PlayerProps) => {
  let highlightStyle = "";
  if (highlight) {
    highlightStyle = styles.playerMe;
  }

  return (
    <div className={`${styles.player} ${highlightStyle}`}>
      <div className={styles.playerText}>{nickname}</div>
      <div className={styles.playerScore}>{score}</div>
      {last && !highlight && <div className={styles.playerDivider} />}
    </div>
  );
};

export default Player;
