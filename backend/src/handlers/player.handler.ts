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
    if (isHost(socket, gameCode)) {
      const game = await getGame(gameCode);

      const sockets = ((await io
        .in(gameCode)
        .fetchSockets()) as unknown) as Socket[];

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

        const newHost = game.players[nextHostIndex];
        const newHostSocket = playerIdToSocket.get(newHost.id);

        if (newHostSocket !== undefined) setHost(io, newHostSocket);
      }
    }
  };

  const playerLeave = async (): Promise<void> => {
    const game = await getGame(gameCode);

    if (game.state === GameState.lobby) {
      const player = await removePlayer(game, playerId);
      socket.to(game.gameCode).emit("players:remove", player.nickname);
    }
  };

  socket.on("disconnect", playerLeave);
  socket.on("disconnecting", playerLeaving);

  return {
    playerLeave,
    playerLeaving,
  };
};

export const playerJoin = async (io: Server, socket: Socket): Promise<void> => {
  const { gameCode, playerId } = socket.data;

  const game = await getGame(gameCode);

  const player = await getPlayer(game.gameCode, playerId, game);
  if (player.new) {
    await initialisePlayer(game, playerId);
    socket.to(game.gameCode).emit("players:add", player.nickname);
  }
  socket.data.nickname = player.nickname;

  socket.emit(
    "players:initial",
    game.players.filter((v) => !v.new)
  );
  socket.emit("settings:initial", game.settings);
  emitNavigate(socket, game);

  const sockets = await io.in(gameCode).fetchSockets();
  await socket.join(game.gameCode);
  if (sockets.length === 0) {
    setHost(io, socket);
  } else {
    await emitHost(io, socket);
  }
};
