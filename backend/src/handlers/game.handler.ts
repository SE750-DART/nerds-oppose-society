import { Game, GameState, Player, Settings } from "../models";
import { Server, Socket } from "socket.io";
import { getGame } from "../services/game.service";
import {
  setMaxPlayers as setMaxPlayersService,
  setRoundLimit as setRoundLimitService,
} from "../services/game.service";

export default (
  io: Server,
  socket: Socket
): {
  setMaxPlayers: (maxPlayers: Settings["maxPlayers"]) => Promise<void>;
  setRoundLimit: (roundLimit: Settings["roundLimit"]) => Promise<void>;
} => {
  const { gameCode } = socket.data;

  const setMaxPlayers = async (
    maxPlayers: Settings["maxPlayers"]
  ): Promise<void> => {
    if (isHost(socket, gameCode)) {
      const game = await getGame(gameCode);
      await setMaxPlayersService(game, maxPlayers);
    }
  };

  const setRoundLimit = async (
    roundLimit: Settings["roundLimit"]
  ): Promise<void> => {
    if (isHost(socket, gameCode)) {
      const game = await getGame(gameCode);
      await setRoundLimitService(game, roundLimit);
    }
  };

  socket.on("game:set-max-players", setMaxPlayers);
  socket.on("game:set-round-limit", setRoundLimit);

  return {
    setMaxPlayers,
    setRoundLimit,
  };
};

export const navigatePlayer = (socket: Socket, game: Game): void => {
  switch (game.state) {
    case GameState.lobby:
      socket.emit(
        "navigate",
        GameState.lobby,
        game.players.filter((v) => !v.new),
        game.settings
      );
      break;
    default:
      throw Error("Invalid game state");
  }
};

export const setHost = (
  io: Server,
  socket: Socket,
  nickname: Player["nickname"]
): void => {
  const { gameCode } = socket.data;
  socket.join(`${gameCode}:host`);
  io.to(gameCode).emit("host:new", nickname);
};

export const isHost = (socket: Socket, gameCode: Game["gameCode"]): boolean => {
  return socket.rooms.has(`${gameCode}:host`);
};
