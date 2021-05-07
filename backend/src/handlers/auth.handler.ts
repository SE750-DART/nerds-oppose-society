import { Socket } from "socket.io";
import { validatePlayerId } from "../services/player.service";

export default async (
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> => {
  const { gameCode, playerId } = socket.handshake.auth;

  socket.data.gameCode = gameCode;
  socket.data.playerId = playerId;

  const error = new Error("Invalid player credentials");
  try {
    if (await validatePlayerId(gameCode, playerId)) {
      return next();
    }
  } catch {
    return next(error);
  }
  next(error);
};
