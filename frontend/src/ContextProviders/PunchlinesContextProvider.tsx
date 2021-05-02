import React from "react";
import useCrud from "../hooks/useCrud";

export type Punchline = string;

type Context = {
  punchlines: Punchline[];
  initialisePunchlines?: (arg0: Punchline[]) => void;
  addPunchline?: (arg0: string) => void;
  removePunchline?: (arg0: string) => void;
};

const PunchlinesContext = React.createContext<Context>({
  punchlines: [],
});

const PunchlinesContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {
    items: punchlines,
    initialiseItems: initialisePunchlines,
    addItem: addPunchline,
    removeItem,
  } = useCrud<Punchline>();

  const removePunchline = (punchline: string) => {
    const punchlineToRemove = punchlines.find(
      (p: Punchline) => p === punchline
    );
    if (!punchlineToRemove) {
      return;
    }

    const equals = (punchline1: Punchline, punchline2: Punchline) =>
      punchline1 === punchline2;

    removeItem(punchlineToRemove, equals);
  };

  const context = {
    punchlines,
    initialisePunchlines,
    addPunchline,
    removePunchline,
  };

  return (
    <PunchlinesContext.Provider value={context}>
      {children}
    </PunchlinesContext.Provider>
  );
};

export { PunchlinesContext, PunchlinesContextProvider };
