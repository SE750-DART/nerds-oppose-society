import React, { useState } from "react";

type Setup = {
  setup: string;
  type: "PICK_ONE" | "PICK_TWO" | "DRAW_TWO_PICK_THREE";
};

type Winner = {
  winningPlayerId: string;
  winningPunchlines: string[];
};

type Context = {
  // round:host-begin
  reset: () => void;

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
  punchlinesChosen: string[][];
  setPunchlinesChosen: (punchlines: string[][]) => void;

  // round:host-view
  hostViewIndex: number;
  setHostViewIndex: (index: number) => void;

  // round:winner
  winner: Winner;
  setWinner: (winningPlayerId: string, winningPunchlines: string[]) => void;
};

const RoundContext = React.createContext<Context>({
  // round:host-begin
  reset: () => null,

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
  // round:number
  const [roundNumberState, setRoundNumber] = useState(0);

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
  const [punchlinesChosenState, setPunchlinesChosen] = useState<string[][]>([]);

  // round:host-view
  const [hostViewIndexState, setHostViewIndex] = useState(0);

  // round:winner
  const [winnerState, setWinner] = useState<Winner>({
    winningPlayerId: "",
    winningPunchlines: [],
  });

  // round:host-begin
  const reset = () => {
    setRoundNumber(0);
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

  // The context value that will be supplied to any descendants of this component.
  const context = {
    // round:host-begin
    reset,

    // round:number
    roundNumber: roundNumberState,
    setRoundNumber: (roundNumber: number) => setRoundNumber(roundNumber),

    // round:setup
    setup: setupState,
    setSetup: (setup: Setup) => setSetup(setup),

    // round:increment-players-chosen
    numPlayersChosen: numPlayersChosenState,
    incrementPlayersChosen,

    // round:chosen-punchlines
    punchlinesChosen: punchlinesChosenState,
    setPunchlinesChosen: (punchlines: string[][]) =>
      setPunchlinesChosen(punchlines),

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
