import React from "react";
import useCrud from "../../hooks/useCrud";

export type Punchline = {
  text: string;
  new?: boolean;
};

const equals = (punchline1: Punchline, punchline2: Punchline) =>
  punchline1.text === punchline2.text;

type Context = {
  punchlines: Punchline[];
  initialisePunchlines: (arg0: Punchline[]) => void;
  addPunchlines: (arg0: string[]) => void;
  removePunchline: (arg0: string) => void;
};

const PunchlinesContext = React.createContext<Context>({
  punchlines: [],
  initialisePunchlines: () => null,
  addPunchlines: () => null,
  removePunchline: () => null,
});

const PunchlinesContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const {
    items: punchlines,
    initialiseItems: initialisePunchlines,
    addItems,
    removeItem,
    updateItem,
  } = useCrud<Punchline>(equals);

  const addPunchlines = (newPunchlines: string[]) => {
    if (punchlines.length === 0) {
      addItems(
        newPunchlines.map((punchline) => ({
          text: punchline,
          new: false,
        }))
      );
      return;
    }

    punchlines.forEach((punchline) => {
      updateItem({
        ...punchline,
        new: false,
      });
    });

    addItems(
      newPunchlines.map((punchline) => ({
        text: punchline,
        new: true,
      }))
    );
  };

  const removePunchline = (punchline: string) => {
    const punchlineToRemove = punchlines.find(
      (p: Punchline) => p.text === punchline
    );
    if (!punchlineToRemove) {
      return;
    }

    removeItem(punchlineToRemove);
  };

  const context = {
    punchlines,
    initialisePunchlines,
    addPunchlines,
    removePunchline,
  };

  return (
    <PunchlinesContext.Provider value={context}>
      {children}
    </PunchlinesContext.Provider>
  );
};

export { PunchlinesContext, PunchlinesContextProvider };
