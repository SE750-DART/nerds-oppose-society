import React, { useState } from "react";

export type Player = {
  nickname: string;
  score: number;
};

type Context = {
  players: Player[];
  initialisePlayers?: (arg0: Player[]) => void;
  addPlayer?: (arg0: string) => void;
  removePlayer?: (arg0: string) => void;
  incrementPlayerScore?: (arg0: string) => void;
};

const PlayersContext = React.createContext<Context>({
  players: [],
});

const PlayersContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [players, setPlayers] = useState<Player[]>([]);

  const initialisePlayers = (initialPlayers: Player[]) =>
    setPlayers(initialPlayers);

  const addPlayer = (nickname: string) =>
    setPlayers([
      ...players,
      {
        nickname,
        score: 0,
      },
    ]);

  const removePlayer = (nickname: string) =>
    setPlayers(players.filter((player) => player.nickname !== nickname));

  const incrementPlayerScore = (nickname: string) =>
    setPlayers(
      players.map((player) =>
        player.nickname === nickname
          ? {
              nickname,
              score: player.score + 1,
            }
          : player
      )
    );

  // The context value that will be supplied to any descendants of this component.
  const context = {
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
