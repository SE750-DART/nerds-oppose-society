import React, {
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import useCrud from "../hooks/useCrud";
import { Player } from "../types";

type PlayersContextType = {
  host: string;
  setHost: (host: string) => void;
  players: Player[];
  initialisePlayers: (players: Player[]) => void;
  addPlayer: (id: string, nickname: string) => void;
  removePlayer: (playerId: string) => void;
  incrementPlayerScore: (playerId: string) => void;
};

const PlayersContext = React.createContext<PlayersContextType | undefined>(
  undefined
);

const equals = (player1: Player, player2: Player) => player1.id === player2.id;

export const PlayersProvider = ({ children }: PropsWithChildren<unknown>) => {
  const [host, setHost] = useState("");

  const {
    items: players,
    initialiseItems: initialisePlayers,
    addItem,
    removeItem,
    updateItem,
  } = useCrud<Player>(equals);

  const addPlayer = useCallback(
    (id: string, nickname: string) =>
      addItem({
        nickname,
        id,
        score: 0,
      }),
    [addItem]
  );

  const removePlayer = useCallback(
    (playerId: string) => {
      const playerToRemove = players.find((player) => player.id === playerId);
      if (!playerToRemove) {
        return;
      }

      removeItem(playerToRemove);
    },
    [players, removeItem]
  );

  const incrementPlayerScore = useCallback(
    (playerId: string) => {
      const playerToUpdate = players.find((player) => player.id === playerId);
      if (!playerToUpdate) {
        return;
      }

      updateItem({
        ...playerToUpdate,
        score: playerToUpdate.score + 1,
      });
    },
    [players, updateItem]
  );

  // The context value that will be supplied to any descendants of this component.
  const context = useMemo(
    () => ({
      host,
      setHost: (newHost: string) => setHost(newHost),
      players,
      initialisePlayers,
      addPlayer,
      removePlayer,
      incrementPlayerScore,
    }),
    [
      addPlayer,
      host,
      incrementPlayerScore,
      initialisePlayers,
      players,
      removePlayer,
    ]
  );

  // Wraps the given child components in a Provider for the above context.
  return (
    <PlayersContext.Provider value={context}>
      {children}
    </PlayersContext.Provider>
  );
};

export const usePlayers = (): PlayersContextType => {
  const players = useContext(PlayersContext);

  if (players === undefined) {
    throw new Error("usePlayers() must be used within a PlayersProvider");
  }

  return players;
};
