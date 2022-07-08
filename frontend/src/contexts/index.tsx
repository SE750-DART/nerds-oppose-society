import React from "react";
import { PlayersContextProvider } from "./players";
import { PunchlinesContextProvider } from "./punchlines";
import { RoundContextProvider } from "./round";

const ContextProviders = ({ children }: { children: React.ReactNode }) => (
  <PlayersContextProvider>
    <PunchlinesContextProvider>
      <RoundContextProvider>{children}</RoundContextProvider>
    </PunchlinesContextProvider>
  </PlayersContextProvider>
);

export default ContextProviders;
