import {
  getPlayer,
  initialisePlayer,
  removePlayer,
} from "../services/player.service";
import { Server, Socket } from "socket.io";
import { GameState } from "../models";
import {
  assignNextHost,
  emitHost,
  emitNavigate,
  getSockets,
  setHost,
} from "./game.handler";
import { getGame } from "../services/game.service";
import { MinPlayers } from "../models/settings.model";

export default (
  io: Server,
  socket: Socket
): {
  playerLeave: () => Promise<void>;
  playerLeaving: () => void;
} => {
  const { gameCode, playerId } = socket.data;

  const playerLeaving = async (): Promise<void> => {
    try {
      await assignNextHost(io, socket);
      /* Empty catch block to keep console clean during testing.
       * Could use proper logging here such as winston
       * https://github.com/winstonjs/winston */
      // eslint-disable-next-line no-empty
    } catch {}
  };

  const playerLeave = async (): Promise<void> => {
    try {
      const game = await getGame(gameCode);

      if (game.state === GameState.lobby) {
        const player = await removePlayer(game, playerId);
        socket.to(game.gameCode).emit("players:remove", player.id);
      }

      if (game.state === GameState.active) {
        const sockets = await getSockets(io, gameCode);

        if (sockets.length < MinPlayers) {
          game.state = GameState.lobby;
          await game.save();

          io.to(gameCode).emit("navigate", GameState.lobby);
        }
      }
      /* Empty catch block to keep console clean during testing.
       * Could use proper logging here such as winston
       * https://github.com/winstonjs/winston */
      // eslint-disable-next-line no-empty
    } catch (e) {}
  };

  socket.on("disconnect", playerLeave);
  socket.on("disconnecting", playerLeaving);

  return {
    playerLeave,
    playerLeaving,
  };
};

export const playerJoin = async (io: Server, socket: Socket): Promise<void> => {
  try {
    const { gameCode, playerId } = socket.data;

    const game = await getGame(gameCode);

    const player = await getPlayer(game.gameCode, playerId, game);
    if (player.new) {
      await initialisePlayer(game, playerId);
      socket.to(game.gameCode).emit("players:add", player.id, player.nickname);
    }
    socket.data.nickname = player.nickname;

    socket.emit(
      "players:initial",
      game.players
        .filter((player) => !player.new)
        .map((player) => {
          return {
            id: player.id,
            nickname: player.nickname,
            score: player.score,
          };
        })
    );
    socket.emit("settings:initial", {
      roundLimit: game.settings.roundLimit,
      maxPlayers: game.settings.maxPlayers,
    });
    emitNavigate(socket, game);

    const sockets = await io.in(gameCode).fetchSockets();
    await socket.join(game.gameCode);
    if (sockets.length === 0) {
      setHost(io, socket);
    } else {
      await emitHost(io, socket);
    }
  } catch (e) {
    socket.disconnect(true);
  }
};
