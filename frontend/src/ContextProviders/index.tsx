import React from "react";
import { PlayersContextProvider } from "./PlayersContextProvider";

const ContextProviders = ({ children }: { children: React.ReactNode }) => (
  <PlayersContextProvider>{children}</PlayersContextProvider>
);

export default ContextProviders;
