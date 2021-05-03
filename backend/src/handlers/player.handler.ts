import {
  getPlayer,
  initialisePlayer,
  removePlayer,
} from "../services/player.service";
import { Socket } from "socket.io";
import { Game, GameState, Player } from "../models";

export const playerJoin = async (
  socket: Socket,
  game: Game,
  playerId: Player["id"]
): Promise<void> => {
  const player = await getPlayer(game.gameCode, playerId, game);
  if (player.new) {
    await initialisePlayer(game, playerId);
    socket.to(game.gameCode).emit("players:add", player.nickname);
  }
};

export const playerLeave = async (
  socket: Socket,
  game: Game,
  playerId: Player["id"]
): Promise<void> => {
  if (game.state === GameState.lobby) {
    const player = await removePlayer(game, playerId);
    socket.to(game.gameCode).emit("players:remove", player.nickname);
  }
};
