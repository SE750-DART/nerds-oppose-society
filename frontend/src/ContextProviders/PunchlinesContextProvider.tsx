import React, { useState } from "react";

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
  const [punchlines, setPunchlines] = useState<Punchline[]>([]);

  const initialisePunchlines = (initialPunchlines: Punchline[]) =>
    setPunchlines(initialPunchlines);

  const addPunchline = (punchline: string) =>
    setPunchlines([...punchlines, punchline]);

  const removePunchline = (punchlineToRemove: string) =>
    setPunchlines(
      punchlines.filter((punchline) => punchline !== punchlineToRemove)
    );

  // The context value that will be supplied to any descendants of this component.
  const context = {
    punchlines,
    initialisePunchlines,
    addPunchline,
    removePunchline,
  };

  // Wraps the given child components in a Provider for the above context.
  return (
    <PunchlinesContext.Provider value={context}>
      {children}
    </PunchlinesContext.Provider>
  );
};

export { PunchlinesContext, PunchlinesContextProvider };
