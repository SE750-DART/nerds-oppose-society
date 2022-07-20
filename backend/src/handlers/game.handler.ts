import { Game, GameState, Player } from "../models";
import {
  getGame,
  initialiseNextRound as initialiseNextRoundService,
} from "../services/game.service";
import {
  setMaxPlayers as setMaxPlayersService,
  setRoundLimit as setRoundLimitService,
} from "../services/game.service";
import { ServiceError } from "../util";
import { RoundState } from "../models/round.model";
import { MinPlayers } from "../models/settings.model";
import { ServerType, SocketData, SocketType } from "../types/socket";

export default (
  io: ServerType,
  socket: SocketType
): {
  startGame: (callback: (data: string) => void) => Promise<void>;
  updateSetting: (
    setting: "MAX_PLAYERS" | "ROUND_LIMIT",
    value: number | undefined,
    callback: (data: string) => void
  ) => Promise<void>;
} => {
  const { gameCode, playerId } = socket.data as SocketData;

  const startGame = async (callback: (data: string) => void): Promise<void> => {
    try {
      if (isHost(socket, gameCode)) {
        const sockets = await getSockets(io, gameCode);

        if (sockets.length < MinPlayers) {
          return callback(
            `Need a minimum of ${MinPlayers} players to start a game`
          );
        }

        await initialiseNextRound(io, gameCode, playerId);
      }
    } catch (e) {
      if (e instanceof ServiceError) {
        callback(e.message);
      } else {
        callback("Server error");
      }
    }
  };

  const updateSetting = async (
    setting: "MAX_PLAYERS" | "ROUND_LIMIT",
    value: number | undefined,
    callback: (data: string) => void
  ): Promise<void> => {
    try {
      if (isHost(socket, gameCode)) {
        const game = await getGame(gameCode);
        switch (setting) {
          case "MAX_PLAYERS":
            await setMaxPlayersService(game, value);
            break;
          case "ROUND_LIMIT":
            await setRoundLimitService(game, value);
            break;
        }
        socket.to(gameCode).emit("settings:update", setting, value);
      }
    } catch (e) {
      if (e instanceof ServiceError) {
        callback(e.message);
      } else {
        callback("Server error");
      }
    }
  };

  socket.on("start", startGame);
  socket.on("settings:update", updateSetting);

  return {
    startGame,
    updateSetting,
  };
};

export const initialiseNextRound = async (
  io: ServerType,
  gameCode: Game["gameCode"],
  hostId: Player["id"]
): Promise<void> => {
  const { roundNumber, setup } = await initialiseNextRoundService(
    gameCode,
    hostId
  );

  io.to(gameCode).emit("round:number", roundNumber);
  io.to(gameCode).emit("round:setup", setup);
  io.to(gameCode).emit("navigate", RoundState.before);
};

export const emitNavigate = (socket: SocketType, game: Game): void => {
  switch (game.state) {
    case GameState.lobby:
      socket.emit("navigate", GameState.lobby);
      break;
  }
};

export const emitHost = async (
  io: ServerType,
  socket: SocketType
): Promise<void> => {
  const { gameCode } = socket.data as SocketData;
  const host = await getHost(io, gameCode);
  socket.emit("host", host);
};

export const getHost = async (
  io: ServerType,
  gameCode: Game["gameCode"]
): Promise<Player["id"] | undefined> => {
  const sockets = await io.in(`${gameCode}:host`).fetchSockets();
  return sockets[0]?.data.playerId;
};

export const setHost = (io: ServerType, socket: SocketType): void => {
  const { gameCode, playerId } = socket.data as SocketData;
  socket.join(`${gameCode}:host`);
  io.to(gameCode).emit("host", playerId);
};

export const isHost = (
  socket: SocketType,
  gameCode: Game["gameCode"]
): boolean => {
  return socket.rooms.has(`${gameCode}:host`);
};

export const assignNextHost = async (
  io: ServerType,
  socket: SocketType
): Promise<Player["id"]> => {
  const { gameCode, playerId } = socket.data as SocketData;
  if (isHost(socket, gameCode)) {
    const { activePlayers, socketsByPlayerId } = await getActivePlayers(
      io,
      gameCode
    );

    if (activePlayers.length > 1) {
      const leavingHostIndex = activePlayers.findIndex(
        (player) => player.id === playerId
      );
      let nextHostIndex = leavingHostIndex + 1;
      if (nextHostIndex === activePlayers.length) nextHostIndex = 0;

      const newHost = activePlayers[nextHostIndex];
      const newHostSocket = socketsByPlayerId.get(newHost.id);

      if (newHostSocket !== undefined) setHost(io, newHostSocket);
      return newHost.id;
    }
  }
};

export const getActivePlayers = async (
  io: ServerType,
  gameCode: Game["gameCode"]
): Promise<{
  activePlayers: Player[];
  game: Game;
  socketsByPlayerId: Map<Player["id"], SocketType>;
}> => {
  const sockets = await getSockets(io, gameCode);

  const game = await getGame(gameCode);

  const socketByPlayerId = new Map<Player["id"], SocketType>(
    sockets.map((socket) => [socket.data.playerId, socket])
  );
  return {
    activePlayers: game.players.filter((player) =>
      socketByPlayerId.has(player.id)
    ),
    game: game,
    socketsByPlayerId: socketByPlayerId,
  };
};

export const getSockets = async (
  io: ServerType,
  gameCode: Game["gameCode"]
): Promise<SocketType[]> => {
  return (await io.in(gameCode).fetchSockets()) as unknown as SocketType[];
};
