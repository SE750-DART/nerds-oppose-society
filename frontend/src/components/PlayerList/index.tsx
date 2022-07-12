import React from "react";
import createPersistedState from "use-persisted-state";
import Player from "./Player";
import styles from "./style.module.css";
import { usePlayers } from "../../contexts/players";
import { Player as PlayerType } from "../../types";

const usePlayerIdState = createPersistedState("playerId");

interface PlayerListProps {
  gameState: "lobby" | "midround" | "endround" | "endgame";
}

const PlayerList = ({ gameState }: PlayerListProps) => {
  const [{ host, players, count }] = usePlayers();
  const [playerId] = usePlayerIdState("");

  const isHost = (player: PlayerType) => player.id === host;
  const isMe = (player: PlayerType) => player.id === playerId;

  let showScores = true;
  let showHost = false;

  if (gameState === "lobby") {
    showScores = false;
    showHost = true;
  }

  const playersList = Object.values(players);

  return (
    <div className={styles.playerlist}>
      {playersList.map((player, index) => (
        <Player
          key={player.id}
          nickname={player.nickname}
          score={showScores ? player.score : undefined}
          highlight={isMe(player)}
          divider={
            index + 1 < count && // player not last
            !isMe(player) && // player not me
            !isMe(playersList[index + 1]) // next player not me
          }
          isHost={showHost ? isHost(player) : undefined}
        />
      ))}
    </div>
  );
};

export default PlayerList;
