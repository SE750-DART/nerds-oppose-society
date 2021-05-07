import { Game, GameState, Player } from "../models";
import { Server, Socket } from "socket.io";
import { getGame } from "../services/game.service";
import {
  setMaxPlayers as setMaxPlayersService,
  setRoundLimit as setRoundLimitService,
} from "../services/game.service";
import { ServiceError } from "../util";

export default (
  io: Server,
  socket: Socket
): {
  updateSetting: (
    setting: "MAX_PLAYERS" | "ROUND_LIMIT",
    value: number | undefined,
    callback: (data: string) => void
  ) => Promise<void>;
} => {
  const { gameCode } = socket.data;

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

  socket.on("settings:update", updateSetting);

  return {
    updateSetting,
  };
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
): Promise<Player["nickname"] | undefined> => {
  const sockets = await io.in(`${gameCode}:host`).fetchSockets();
  return sockets[0]?.data.nickname;
};

export const setHost = (io: Server, socket: Socket): void => {
  const { gameCode } = socket.data;
  socket.join(`${gameCode}:host`);
  io.to(gameCode).emit("host", socket.data.nickname);
};

export const isHost = (socket: Socket, gameCode: Game["gameCode"]): boolean => {
  return socket.rooms.has(`${gameCode}:host`);
};
