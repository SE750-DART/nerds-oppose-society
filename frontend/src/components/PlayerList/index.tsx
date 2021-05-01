import React from "react";
import styles from "./style.module.css";

interface PlayerListProps {
  gameState: "lobby" | "midround" | "endround" | "endgame";
}

const PlayerList = ({ gameState }: PlayerListProps) => {
  // let showScores: boolean = false;
  // let showIndicators: boolean = false;
  //
  // if (gameState === "midround") {
  //   showScores = true;
  // } else if (gameState === "endround") {
  //   showScores: true;
  //   showIndicators: true;
  // }

  // TODO: Retrieve players from backend
  const dummyPlayers: { id: string; nickname: string; score: number }[] = [
    {
      id: "94fb6b63-754d-4674-952a-014e6ac95803",
      nickname: "DonkeyKong",
      score: 3,
    },
    {
      id: "db3c8cc7-9b01-4490-b5ad-9a5a9c8b6955",
      nickname: "AlexVerkerk",
      score: 2,
    },
    {
      id: "f4eeab06-37d9-46ce-afc4-cfedbe327a2c",
      nickname: "RawiriHohepa",
      score: 2,
    },
    {
      id: "85d22d4c-3fff-49f3-bdbf-480f08cdab5a",
      nickname: "TaitFuller",
      score: 0,
    },
  ];

  console.log(gameState);

  return (
    <div className={styles.playerlist}>
      {dummyPlayers.map((player) => (
        <div key={player.id}>{player.nickname}</div>
      ))}
    </div>
  );
};

export default PlayerList;
