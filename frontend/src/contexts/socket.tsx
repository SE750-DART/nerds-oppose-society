import React, { PropsWithChildren, useContext } from "react";
import { Socket } from "socket.io-client";

const SocketContext = React.createContext<Socket | undefined>(undefined);

interface SocketProviderProps {
  socket: Socket;
}

export const SocketProvider = ({
  children,
  socket,
}: PropsWithChildren<SocketProviderProps>) => {
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = (): Socket => {
  const socket = useContext(SocketContext);

  if (socket === undefined) {
    throw new Error("useSocket() must be used within a SocketProvider");
  }

  return socket;
};
