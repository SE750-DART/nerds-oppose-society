import {
  getPlayer,
  initialisePlayer,
  removePlayer,
} from "../services/player.service";
import { Server, Socket } from "socket.io";
import { GameState } from "../models";
import { navigatePlayer, setHost } from "./game.handler";
import { getGame } from "../services/game.service";

export const playerJoin = async (io: Server, socket: Socket): Promise<void> => {
  const { gameCode, playerId } = socket.handshake.auth;

  const game = await getGame(gameCode);

  navigatePlayer(socket, game);

  const player = await getPlayer(game.gameCode, playerId, game);
  if (player.new) {
    await initialisePlayer(game, playerId);
    socket.to(game.gameCode).emit("players:add", player.nickname);
  }

  const sockets = await io.in(gameCode).fetchSockets();
  await socket.join(game.gameCode);
  if (sockets.length === 0) setHost(io, socket, player.nickname);
};

export default (
  io: Server,
  socket: Socket
): {
  playerLeave: () => Promise<void>;
} => {
  const { gameCode, playerId } = socket.handshake.auth;

  const playerLeave = async (): Promise<void> => {
    const game = await getGame(gameCode);

    if (game.state === GameState.lobby) {
      const player = await removePlayer(game, playerId);
      socket.to(game.gameCode).emit("players:remove", player.nickname);
    }
  };

  socket.on("disconnect", playerLeave);

  return {
    playerLeave,
  };
};
