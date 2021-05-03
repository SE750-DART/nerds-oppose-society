import React from "react";
import useCrud from "../hooks/useCrud";

export type Punchline = string;
const equals = (punchline1: Punchline, punchline2: Punchline) =>
  punchline1 === punchline2;

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
  } = useCrud<Punchline>({ equals });

  const removePunchline = (punchline: string) => {
    const punchlineToRemove = punchlines.find(
      (p: Punchline) => p === punchline
    );
    if (!punchlineToRemove) {
      return;
    }

    removeItem(punchlineToRemove);
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
