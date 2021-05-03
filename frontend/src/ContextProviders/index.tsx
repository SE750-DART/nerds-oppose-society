import React from "react";
import { PlayersContextProvider } from "./PlayersContextProvider";
import { PunchlinesContextProvider } from "./PunchlinesContextProvider";

const ContextProviders = ({ children }: { children: React.ReactNode }) => (
  <PlayersContextProvider>
    <PunchlinesContextProvider>{children}</PunchlinesContextProvider>
  </PlayersContextProvider>
);

export default ContextProviders;
