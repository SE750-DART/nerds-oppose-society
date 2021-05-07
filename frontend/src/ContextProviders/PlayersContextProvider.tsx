import React, { useState } from "react";
import useCrud from "../hooks/useCrud";

export type Player = {
  nickname: string;
  id: string;
  score: number;
};
const equals = (player1: Player, player2: Player) => player1.id === player2.id;

type Context = {
  host: string;
  setHost: (host: string) => void;
  players: Player[];
  initialisePlayers: (players: Player[]) => void;
  addPlayer: (id: string, nickname: string) => void;
  removePlayer: (playerId: string) => void;
  incrementPlayerScore: (playerId: string) => void;
};

const PlayersContext = React.createContext<Context>({
  host: "",
  setHost: () => null,
  players: [],
  initialisePlayers: () => null,
  addPlayer: () => null,
  removePlayer: () => null,
  incrementPlayerScore: () => null,
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

  const addPlayer = (id: string, nickname: string) =>
    addItem({
      nickname,
      id,
      score: 0,
    });

  const removePlayer = (playerId: string) => {
    const playerToRemove = players.find((player) => player.id === playerId);
    if (!playerToRemove) {
      return;
    }

    removeItem(playerToRemove);
  };

  const incrementPlayerScore = (playerId: string) => {
    const playerToUpdate = players.find((player) => player.id === playerId);
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
