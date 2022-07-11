import React, {
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
} from "react";
import useCrud from "../hooks/useCrud";
import { Punchline } from "../types";

type PunchlinesContextType = {
  punchlines: Punchline[];
  initialisePunchlines: (arg0: Punchline[]) => void;
  addPunchlines: (arg0: string[]) => void;
  removePunchline: (arg0: string) => void;
};

const PunchlinesContext = React.createContext<
  PunchlinesContextType | undefined
>(undefined);

const equals = (punchline1: Punchline, punchline2: Punchline) =>
  punchline1.text === punchline2.text;

export const PunchlinesProvider = ({
  children,
}: PropsWithChildren<unknown>) => {
  const {
    items: punchlines,
    initialiseItems: initialisePunchlines,
    addItems,
    removeItem,
    updateItem,
  } = useCrud<Punchline>(equals);

  const addPunchlines = useCallback(
    (newPunchlines: string[]) => {
      if (punchlines.length === 0) {
        addItems(
          newPunchlines.map((punchline) => ({
            text: punchline,
            new: false,
            viewed: false,
          }))
        );
        return;
      }

      punchlines.forEach((punchline) => {
        updateItem({
          ...punchline,
          new: false,
          viewed: false,
        });
      });

      addItems(
        newPunchlines.map((punchline) => ({
          text: punchline,
          new: true,
          viewed: false,
        }))
      );
    },
    [addItems, punchlines, updateItem]
  );

  const removePunchline = useCallback(
    (punchline: string) => {
      const punchlineToRemove = punchlines.find(
        (p: Punchline) => p.text === punchline
      );
      if (!punchlineToRemove) {
        return;
      }

      removeItem(punchlineToRemove);
    },
    [punchlines, removeItem]
  );

  const context = useMemo(
    () => ({
      punchlines,
      initialisePunchlines,
      addPunchlines,
      removePunchline,
    }),
    [addPunchlines, initialisePunchlines, punchlines, removePunchline]
  );

  return (
    <PunchlinesContext.Provider value={context}>
      {children}
    </PunchlinesContext.Provider>
  );
};

export const usePunchlines = (): PunchlinesContextType => {
  const punchlines = useContext(PunchlinesContext);

  if (punchlines === undefined) {
    throw new Error("usePunchlines() must be used within a PunchlinesProvider");
  }

  return punchlines;
};
