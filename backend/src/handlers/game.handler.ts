import { Game, GameState } from "../models";
import { Server, Socket } from "socket.io";

export const navigatePlayer = (socket: Socket, game: Game) => {
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

export const setHost = (io: Server, socket: Socket, nickname: string) => {
  const { gameCode } = socket.handshake.auth;
  socket.join(`${gameCode}:host`);
  io.to(gameCode).emit("host:new", nickname);
};
