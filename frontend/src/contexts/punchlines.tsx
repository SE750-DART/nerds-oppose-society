import React, {
  Dispatch,
  PropsWithChildren,
  useContext,
  useReducer,
} from "react";
import { Punchline } from "../types";

export enum PunchlinesAction {
  ADD = "add",
  REMOVE = "remove",
}

type PunchlinesActionType = { type: PunchlinesAction; punchlines: string[] };

type PunchlinesState = Punchline[];

const reducer = (
  state: PunchlinesState,
  action: PunchlinesActionType
): PunchlinesState => {
  switch (action.type) {
    case PunchlinesAction.ADD: {
      if (action.punchlines.length > 0) {
        return [
          ...state,
          ...action.punchlines.map<Punchline>((punchline) => ({
            text: punchline,
          })),
        ];
      }
      return state;
    }
    case PunchlinesAction.REMOVE: {
      if (action.punchlines.length > 0) {
        const remove = new Set(action.punchlines);
        return state.filter((punchline) => !remove.has(punchline.text));
      }
      return state;
    }
  }
};

type PunchlinesContextType = [PunchlinesState, Dispatch<PunchlinesActionType>];

const PunchlinesContext = React.createContext<
  PunchlinesContextType | undefined
>(undefined);

export const PunchlinesProvider = ({
  children,
}: PropsWithChildren<unknown>) => {
  const context = useReducer(reducer, []);

  return (
    <PunchlinesContext.Provider value={context}>
      {children}
    </PunchlinesContext.Provider>
  );
};

export const usePunchlines = (): PunchlinesContextType => {
  const context = useContext(PunchlinesContext);

  if (context === undefined) {
    throw new Error("usePunchlines() must be used within a PunchlinesProvider");
  }

  return context;
};
