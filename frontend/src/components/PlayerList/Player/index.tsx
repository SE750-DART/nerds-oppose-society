import React from "react";
import styles from "./style.module.css";

interface PlayerProps {
  nickname: string;
  score?: number;
  highlight?: boolean;
}

const Player = ({ nickname, score, highlight = false }: PlayerProps) => {
  let highlightStyle = "";
  if (highlight) {
    highlightStyle = "test";
  }
  console.log(highlightStyle);

  return (
    <div className={styles.player}>
      <div className={styles.playerText}>{nickname}</div>
      <div className={styles.playerScore}>{score}</div>
      <div className={styles.playerDivider} />
    </div>
  );
};

export default Player;
