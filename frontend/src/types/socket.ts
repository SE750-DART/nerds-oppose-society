import { Socket } from "socket.io-client";
import {
  ServerToClientEvents,
  ClientToServerEvents,
} from "@nos/backend/src/types/socket";

export type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;
