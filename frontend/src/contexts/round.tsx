import React, {
  Dispatch,
  PropsWithChildren,
  useContext,
  useReducer,
} from "react";
import { Punchline, Setup, Winner } from "../types";

export enum RoundAction {
  NEW_ROUND = "new_round",
  SET_SETUP = "set_setup",
  INCREMENT_PLAYERS_CHOSEN = "increment_players_chosen",
  SET_CHOSEN_PUNCHLINES = "set_chosen_punchlines",
  MARK_PUNCHLINE_READ = "mark_punchline_read",
  SET_WINNER = "set_winner",
}

type RoundActionType =
  | { type: RoundAction.NEW_ROUND; roundNumber: number }
  | { type: RoundAction.SET_SETUP; setup: Setup }
  // TODO: Combine NEW_ROUND & SET_SETUP
  | { type: RoundAction.INCREMENT_PLAYERS_CHOSEN }
  | { type: RoundAction.SET_CHOSEN_PUNCHLINES; punchlines: string[][] }
  | { type: RoundAction.MARK_PUNCHLINE_READ; index: number }
  | {
      type: RoundAction.SET_WINNER;
      winningPlayerId: string;
      winningPunchlines: string[];
    };

type RoundState = {
  roundNumber: number;
  setup: Setup | undefined;
  numPlayersChosen: number;
  chosenPunchlines: Punchline[];
  winner: Winner | undefined;
};

const reducer = (state: RoundState, action: RoundActionType): RoundState => {
  switch (action.type) {
    case RoundAction.NEW_ROUND: {
      const { roundNumber } = action;
      return {
        roundNumber,
        setup: undefined,
        numPlayersChosen: 0,
        chosenPunchlines: [],
        winner: undefined,
      };
    }

    case RoundAction.SET_SETUP: {
      const { setup } = action;
      return { ...state, setup };
    }

    case RoundAction.INCREMENT_PLAYERS_CHOSEN: {
      return { ...state, numPlayersChosen: state.numPlayersChosen + 1 };
    }

    case RoundAction.SET_CHOSEN_PUNCHLINES: {
      const { punchlines } = action;
      const chosenPunchlines = punchlines.map((playerPunchlines) => ({
        text: playerPunchlines[0],
        viewed: false,
      }));
      return { ...state, chosenPunchlines };
    }

    case RoundAction.MARK_PUNCHLINE_READ: {
      const { index } = action;
      const chosenPunchlines = [...state.chosenPunchlines];
      if (0 <= index && index < chosenPunchlines.length) {
        chosenPunchlines[index].viewed = true;
        return { ...state, chosenPunchlines };
      }
      return state;
    }

    case RoundAction.SET_WINNER: {
      const { winningPlayerId, winningPunchlines } = action;
      return { ...state, winner: { winningPlayerId, winningPunchlines } };
    }
  }
};

type RoundContextType = [RoundState, Dispatch<RoundActionType>];

const RoundContext = React.createContext<RoundContextType | undefined>(
  undefined
);

export const RoundProvider = ({ children }: PropsWithChildren<unknown>) => {
  const context = useReducer(reducer, {
    roundNumber: 0,
    setup: undefined,
    numPlayersChosen: 0,
    chosenPunchlines: [],
    winner: undefined,
  });

  return (
    <RoundContext.Provider value={context}>{children}</RoundContext.Provider>
  );
};

export const useRound = (): RoundContextType => {
  const context = useContext(RoundContext);

  if (context === undefined) {
    throw new Error("useRound() must be used within a RoundProvider");
  }

  return context;
};
