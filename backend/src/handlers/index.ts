import { Socket } from "socket.io";
import { navigatePlayer } from "./game.handler";
import { getGame } from "../services/game.service";
import { playerJoin, playerLeave } from "./player.handler";

export { default as Auth } from "./auth.handler";

export const Connection = async (socket: Socket): Promise<void> => {
  const { gameCode, playerId } = socket.handshake.auth;

  socket.on("disconnect", async () => {
    const game = await getGame(gameCode);
    await playerLeave(socket, game, playerId);
  });

  const game = await getGame(gameCode);

  navigatePlayer(socket, game);

  socket.join(gameCode);

  await playerJoin(socket, game, playerId);
};
