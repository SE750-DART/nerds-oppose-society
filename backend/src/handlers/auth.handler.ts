import { Socket } from "socket.io";
import { validatePlayerId } from "../services/player.service";

export default async (
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> => {
  const { gameCode, playerId } = socket.handshake.auth;

  socket.data.gameCode = gameCode;
  socket.data.playerId = playerId;

  if (await validatePlayerId(gameCode, playerId)) {
    return next();
  }
  next(new Error("Invalid player credentials"));
};
