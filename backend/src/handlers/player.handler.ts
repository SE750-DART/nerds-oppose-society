import { getPlayer, initialisePlayer } from "../services/player.service";
import { Socket } from "socket.io";
import { Game } from "../models";

export const playerJoin = async (
  socket: Socket,
  game: Game,
  playerId: string
): Promise<void> => {
  const player = await getPlayer(game.gameCode, playerId, game);
  if (player.new) {
    await initialisePlayer(game, playerId);
    socket.to(game.gameCode).emit("players:new", player.nickname);
  }
};
