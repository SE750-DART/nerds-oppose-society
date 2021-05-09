import { Game, GameState, Player } from "../models";
import { Server, Socket } from "socket.io";
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

export default (
  io: Server,
  socket: Socket
): {
  startGame: (callback: (data: string) => void) => Promise<void>;
  updateSetting: (
    setting: "MAX_PLAYERS" | "ROUND_LIMIT",
    value: number | undefined,
    callback: (data: string) => void
  ) => Promise<void>;
} => {
  const { gameCode, playerId } = socket.data;

  const startGame = async (callback: (data: string) => void): Promise<void> => {
    try {
      if (isHost(socket, gameCode)) {
        await initialiseNextRound(io, gameCode, playerId);
      }
    } catch (e) {
      console.log(e);
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
  io: Server,
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

export const emitNavigate = (socket: Socket, game: Game): void => {
  switch (game.state) {
    case GameState.lobby:
      socket.emit("navigate", GameState.lobby);
      break;
  }
};

export const emitHost = async (io: Server, socket: Socket): Promise<void> => {
  const host = await getHost(io, socket.data.gameCode);
  socket.emit("host", host);
};

export const getHost = async (
  io: Server,
  gameCode: Game["gameCode"]
): Promise<Player["id"] | undefined> => {
  const sockets = await io.in(`${gameCode}:host`).fetchSockets();
  return sockets[0]?.data.playerId;
};

export const setHost = (io: Server, socket: Socket): void => {
  const { gameCode } = socket.data;
  socket.join(`${gameCode}:host`);
  io.to(gameCode).emit("host", socket.data.playerId);
};

export const isHost = (socket: Socket, gameCode: Game["gameCode"]): boolean => {
  return socket.rooms.has(`${gameCode}:host`);
};

export const assignNextHost = async (
  io: Server,
  socket: Socket
): Promise<Player["id"]> => {
  const { gameCode, playerId } = socket.data;
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
  io: Server,
  gameCode: Game["gameCode"]
): Promise<{
  activePlayers: Player[];
  game: Game;
  socketsByPlayerId: Map<Player["id"], Socket>;
}> => {
  const sockets = await getSockets(io, gameCode);

  const game = await getGame(gameCode);

  const socketByPlayerId = new Map<Player["id"], Socket>(
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
  io: Server,
  gameCode: Game["gameCode"]
): Promise<Socket[]> => {
  return ((await io.in(gameCode).fetchSockets()) as unknown) as Socket[];
};
