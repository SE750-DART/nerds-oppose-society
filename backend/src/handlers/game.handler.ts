import { Game, GameState } from "../models";
import { Socket } from "socket.io";

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
