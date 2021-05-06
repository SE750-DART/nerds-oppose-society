import React, { useState } from "react";
import useCrud from "../hooks/useCrud";

export type Player = {
  nickname: string;
  score: number;
};
const equals = (player1: Player, player2: Player) =>
  player1.nickname === player2.nickname;

type Context = {
  host: string;
  setHost: (host: string) => void;
  players: Player[];
  initialisePlayers?: (arg0: Player[]) => void;
  addPlayer?: (arg0: string) => void;
  removePlayer?: (arg0: string) => void;
  incrementPlayerScore?: (arg0: string) => void;
};

const PlayersContext = React.createContext<Context>({
  host: "",
  setHost: () => null,
  players: [],
});

const PlayersContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [host, setHost] = useState("");

  const {
    items: players,
    initialiseItems: initialisePlayers,
    addItem,
    removeItem,
    updateItem,
  } = useCrud<Player>(equals);

  const addPlayer = (nickname: string) =>
    addItem({
      nickname,
      score: 0,
    });

  const removePlayer = (nickname: string) => {
    const playerToRemove = players.find(
      (player) => player.nickname === nickname
    );
    if (!playerToRemove) {
      return;
    }

    removeItem(playerToRemove);
  };

  const incrementPlayerScore = (nickname: string) => {
    const playerToUpdate = players.find(
      (player) => player.nickname === nickname
    );
    if (!playerToUpdate) {
      return;
    }

    updateItem({
      ...playerToUpdate,
      score: playerToUpdate.score + 1,
    });
  };

  // The context value that will be supplied to any descendants of this component.
  const context = {
    host,
    setHost: (newHost: string) => setHost(newHost),
    players,
    initialisePlayers,
    addPlayer,
    removePlayer,
    incrementPlayerScore,
  };

  // Wraps the given child components in a Provider for the above context.
  return (
    <PlayersContext.Provider value={context}>
      {children}
    </PlayersContext.Provider>
  );
};

export { PlayersContext, PlayersContextProvider };
