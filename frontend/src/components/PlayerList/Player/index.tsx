import React from "react";
import styles from "./style.module.css";

interface PlayerProps {
  nickname: string;
  score?: number;
  highlight?: boolean;
  divider: boolean;
  isHost?: boolean;
}

const Player = ({
  nickname,
  score,
  highlight = false,
  divider,
  isHost,
}: PlayerProps) => {
  let highlightStyle = "";
  if (highlight) {
    highlightStyle = styles.playerMe;
  }

  return (
    <div className={`${styles.player} ${highlightStyle}`}>
      <div className={styles.playerText}>{nickname}</div>
      {isHost && <div className={styles.playerIndicator}>HOST</div>}
      <div className={styles.playerScore}>{score}</div>
      {divider && <div className={styles.playerDivider} />}
    </div>
  );
};

export default Player;
