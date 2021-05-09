import React from "react";
import { PlayersContextProvider } from "./PlayersContextProvider";
import { PunchlinesContextProvider } from "./PunchlinesContextProvider";
import { RoundContextProvider } from "./RoundContextProvider";

const ContextProviders = ({ children }: { children: React.ReactNode }) => (
  <PlayersContextProvider>
    <PunchlinesContextProvider>
      <RoundContextProvider>{children}</RoundContextProvider>
    </PunchlinesContextProvider>
  </PlayersContextProvider>
);

export default ContextProviders;
