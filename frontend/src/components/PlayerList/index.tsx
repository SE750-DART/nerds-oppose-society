import React, { useContext } from "react";
import createPersistedState from "use-persisted-state";
import Player from "./Player";
import styles from "./style.module.css";
import {
  Player as PlayerType,
  PlayersContext,
} from "../../ContextProviders/PlayersContextProvider";

const usePlayerIdState = createPersistedState("playerId");

interface PlayerListProps {
  gameState: "lobby" | "midround" | "endround" | "endgame";
}

const PlayerList = ({ gameState }: PlayerListProps) => {
  const { host, players } = useContext(PlayersContext);
  const [playerId] = usePlayerIdState("");

  const isHost = (player: PlayerType) => player.id === host;
  const isMe = (player: PlayerType) => player.id === playerId;

  let showScores: boolean = true;

  if (gameState === "lobby") {
    showScores = false;
  }

  return (
    <div className={styles.playerlist}>
      {players.map((player, index) => (
        <Player
          key={player.id}
          nickname={player.nickname}
          score={showScores ? player.score : undefined}
          highlight={isMe(player)}
          divider={
            index + 1 < players.length && // player not last
            !isMe(player) && // player not me
            !isMe(players[index + 1]) // next player not me
          }
          isHost={isHost(player)}
        />
      ))}
    </div>
  );
};

export default PlayerList;
