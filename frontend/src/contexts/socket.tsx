import React, { PropsWithChildren, useContext } from "react";
import { SocketType } from "../types/socket";

const SocketContext = React.createContext<SocketType | undefined>(undefined);

interface SocketProviderProps {
  socket: SocketType;
}

export const SocketProvider = ({
  children,
  socket,
}: PropsWithChildren<SocketProviderProps>) => {
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = (): SocketType => {
  const socket = useContext(SocketContext);

  if (socket === undefined) {
    throw new Error("useSocket() must be used within a SocketProvider");
  }

  return socket;
};
