import { authenticatePlayer } from "../services/player.service";
import { SocketType } from "../types/socket";

export default async (
  socket: SocketType,
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
