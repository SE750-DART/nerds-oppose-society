import React, {
  Dispatch,
  PropsWithChildren,
  useContext,
  useReducer,
} from "react";
import { Player } from "../types";

export enum PlayersActions {
  INITIALISE = "initialise",
  ADD = "add",
  REMOVE = "remove",
  INCREMENT_SCORE = "increment_score",
  SET_HOST = "set_host",
}

type PlayersActionType =
  | { type: PlayersActions.INITIALISE; players: Player[] }
  | { type: PlayersActions.ADD; id: Player["id"]; nickname: Player["nickname"] }
  | { type: PlayersActions.REMOVE; id: Player["id"] }
  | { type: PlayersActions.INCREMENT_SCORE; id: Player["id"] }
  | { type: PlayersActions.SET_HOST; id: Player["id"] };

type PlayersState = {
  players: {
    [id: Player["id"]]: Player;
  };
  host: Player["id"] | undefined;
  count: number;
};

const reducer = (
  state: PlayersState,
  action: PlayersActionType
): PlayersState => {
  switch (action.type) {
    case PlayersActions.INITIALISE: {
      const { players } = action;
      return {
        ...state,
        players: Object.fromEntries(
          players.map((player) => [player.id, player])
        ),
        count: players.length,
      };
    }

    case PlayersActions.ADD: {
      const { id, nickname } = action;
      const playerExists = id in state.players;
      return {
        ...state,
        players: {
          ...state.players,
          [id]: { id, nickname, score: 0 },
        },
        count: playerExists ? state.count : state.count + 1,
      };
    }

    case PlayersActions.REMOVE: {
      const { id } = action;
      const players = { ...state.players };
      if (id in players) {
        delete players[id];
        return {
          ...state,
          players,
          count: state.count - 1,
        };
      }
      return state;
    }

    case PlayersActions.INCREMENT_SCORE: {
      const { id } = action;
      const players = state.players;
      if (id in players) {
        const player = players[id];
        return {
          ...state,
          players: { ...players, [id]: { ...player, score: player.score + 1 } },
        };
      }
      return state;
    }

    case PlayersActions.SET_HOST: {
      return { ...state, host: action.id };
    }
  }
};

type PlayersContextType = [PlayersState, Dispatch<PlayersActionType>];

const PlayersContext = React.createContext<PlayersContextType | undefined>(
  undefined
);

export const PlayersProvider = ({ children }: PropsWithChildren<unknown>) => {
  const context = useReducer(reducer, {
    players: {},
    host: undefined,
    count: 0,
  });

  return (
    <PlayersContext.Provider value={context}>
      {children}
    </PlayersContext.Provider>
  );
};

export const usePlayers = (): PlayersContextType => {
  const context = useContext(PlayersContext);

  if (context === undefined) {
    throw new Error("usePlayers() must be used within a PlayersProvider");
  }

  return context;
};
