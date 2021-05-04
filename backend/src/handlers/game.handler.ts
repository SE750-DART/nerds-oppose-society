import { Game, GameState, Player } from "../models";
import { Server, Socket } from "socket.io";

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
