import { Socket } from "socket.io";
import { authenticatePlayer } from "../services/player.service";

export default async (
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> => {
  const { gameCode, playerId, token } = socket.handshake.auth;

  socket.data.gameCode = gameCode;
  socket.data.playerId = playerId;

  const error = new Error("Invalid player credentials");
  try {
    if (await authenticatePlayer(gameCode, playerId, token)) {
      return next();
    }
  } catch {
    return next(error);
  }
  next(error);
};
