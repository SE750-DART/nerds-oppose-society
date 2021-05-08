import {
  getPlayer,
  initialisePlayer,
  removePlayer,
} from "../services/player.service";
import { Server, Socket } from "socket.io";
import { GameState, Player } from "../models";
import { emitHost, emitNavigate, isHost, setHost } from "./game.handler";
import { getGame } from "../services/game.service";

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
      if (isHost(socket, gameCode)) {
        const sockets = ((await io
          .in(gameCode)
          .fetchSockets()) as unknown) as Socket[];

        const game = await getGame(gameCode);

        const playerIdToSocket = new Map<Player["id"], Socket>(
          sockets.map((socket) => [socket.data.playerId, socket])
        );
        const activePlayers = game.players.filter((player) =>
          playerIdToSocket.has(player.id)
        );

        if (activePlayers.length > 1) {
          const leavingHostIndex = activePlayers.findIndex(
            (player) => player.id === playerId
          );
          let nextHostIndex = leavingHostIndex + 1;
          if (nextHostIndex === activePlayers.length) nextHostIndex = 0;

          const newHost = activePlayers[nextHostIndex];
          const newHostSocket = playerIdToSocket.get(newHost.id);

          if (newHostSocket !== undefined) setHost(io, newHostSocket);
        }
      }
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
