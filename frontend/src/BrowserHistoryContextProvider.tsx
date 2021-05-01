import React, { useState } from "react";

type Context = {
  browserHistory: any;
  // eslint-disable-next-line no-unused-vars
  setBrowserHistory: (history: any) => void;
};

const BrowserHistoryContext = React.createContext<Context>({
  browserHistory: null,
  setBrowserHistory: () => null,
});

const BrowserHistoryContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [browserHistory, setBrowserHistoryState] = useState(null);

  const setBrowserHistory = (history: any) => {
    if (!browserHistory) {
      setBrowserHistoryState(history);
    }
  };

  const context = {
    browserHistory,
    setBrowserHistory,
  };

  return (
    <BrowserHistoryContext.Provider value={context}>
      {children}
    </BrowserHistoryContext.Provider>
  );
};

export { BrowserHistoryContext, BrowserHistoryContextProvider };
