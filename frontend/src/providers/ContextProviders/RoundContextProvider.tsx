import React, { useState } from "react";
import { Punchline } from "./PunchlinesContextProvider";

type Setup = {
  setup: string;
  type: "PICK_ONE" | "PICK_TWO" | "DRAW_TWO_PICK_THREE";
};

type Winner = {
  winningPlayerId: string;
  winningPunchlines: string[];
};

type Context = {
  // round:number
  roundNumber: number;
  setRoundNumber: (roundNumber: number) => void;

  // round:setup
  setup: Setup;
  setSetup: (setup: Setup) => void;

  // round:increment-players-chosen
  numPlayersChosen: number;
  incrementPlayersChosen: () => void;

  // round:chosen-punchlines
  punchlinesChosen: Punchline[];
  setPunchlinesChosen: (punchlines: string[][]) => void;
  markPunchlineRead: (index: number) => void;

  // round:host-view
  hostViewIndex: number;
  setHostViewIndex: (index: number) => void;

  // round:winner
  winner: Winner;
  setWinner: (winningPlayerId: string, winningPunchlines: string[]) => void;
};

const RoundContext = React.createContext<Context>({
  // round:number
  roundNumber: 0,
  setRoundNumber: () => null,

  // round:setup
  setup: {
    setup: "",
    type: "PICK_ONE",
  },
  setSetup: () => null,

  // round:increment-players-chosen
  numPlayersChosen: 0,
  incrementPlayersChosen: () => null,

  // round:chosen-punchlines
  punchlinesChosen: [],
  setPunchlinesChosen: () => null,
  markPunchlineRead: () => null,

  // round:host-view
  hostViewIndex: 0,
  setHostViewIndex: () => null,

  // round:winner
  winner: {
    winningPlayerId: "",
    winningPunchlines: [],
  },
  setWinner: () => null,
});

const RoundContextProvider = ({ children }: { children: React.ReactNode }) => {
  // round:setup
  const [setupState, setSetup] = useState<Setup>({
    setup: "",
    type: "PICK_ONE",
  });

  // round:increment-players-chosen
  const [numPlayersChosenState, setNumPlayersChosen] = useState(0);
  const incrementPlayersChosen = () =>
    setNumPlayersChosen(numPlayersChosenState + 1);

  // round:chosen-punchlines
  const [punchlinesChosenState, setPunchlinesChosenState] = useState<
    Punchline[]
  >([]);
  const setPunchlinesChosen = (punchlines: string[][]) => {
    const punchlineObjs = punchlines.map((punchlinesOnePlayer) => ({
      text: punchlinesOnePlayer[0],
      viewed: false,
    }));
    setPunchlinesChosenState(punchlineObjs);
  };
  const markPunchlineRead = (index: number) => {
    const newPunchlines = [...punchlinesChosenState];
    newPunchlines[index] = {
      ...punchlinesChosenState[index],
      viewed: true,
    };
    setPunchlinesChosenState(newPunchlines);
  };

  // round:host-view
  const [hostViewIndexState, setHostViewIndex] = useState(0);

  // round:winner
  const [winnerState, setWinner] = useState<Winner>({
    winningPlayerId: "",
    winningPunchlines: [],
  });

  // round:number
  const [roundNumberState, setRoundNumberState] = useState(0);
  const reset = () => {
    setRoundNumberState(0);
    setSetup({
      setup: "",
      type: "PICK_ONE",
    });
    setNumPlayersChosen(0);
    setPunchlinesChosen([]);
    setHostViewIndex(0);
    setWinner({
      winningPlayerId: "",
      winningPunchlines: [],
    });
  };
  const setRoundNumber = (roundNumber: number) => {
    if (roundNumber !== roundNumberState) {
      reset();
      setRoundNumberState(roundNumber);
    }
  };

  // The context value that will be supplied to any descendants of this component.
  const context = {
    // round:number
    roundNumber: roundNumberState,
    setRoundNumber,

    // round:setup
    setup: setupState,
    setSetup: (setup: Setup) => setSetup(setup),

    // round:increment-players-chosen
    numPlayersChosen: numPlayersChosenState,
    incrementPlayersChosen,

    // round:chosen-punchlines
    punchlinesChosen: punchlinesChosenState,
    setPunchlinesChosen,
    markPunchlineRead,

    // round:host-view
    hostViewIndex: hostViewIndexState,
    setHostViewIndex: (index: number) => setHostViewIndex(index),

    // round:winner
    winner: winnerState,
    setWinner: (winningPlayerId: string, winningPunchlines: string[]) =>
      setWinner({ winningPlayerId, winningPunchlines }),
  };

  // Wraps the given child components in a Provider for the above context.
  return (
    <RoundContext.Provider value={context}>{children}</RoundContext.Provider>
  );
};

export { RoundContext, RoundContextProvider };
