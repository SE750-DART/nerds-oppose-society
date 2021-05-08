import { Server, Socket } from "socket.io";
import {
  enterHostChoosesState,
  playerChoosePunchlines as playerChoosePunchlinesService,
} from "../services/round.service";
import { ServiceError } from "../util";
import { RoundState } from "../models/round.model";
import { isHost } from "./game.handler";

export default (
  io: Server,
  socket: Socket
): {
  playerChoosePunchlines: (
    punchlines: string[],
    callback: (data: string) => void
  ) => Promise<void>;
  hostViewPunchline: (index: number) => void;
} => {
  const { gameCode, playerId } = socket.data;

  const playerChoosePunchlines = async (
    punchlines: string[],
    callback: (data: string) => void
  ) => {
    try {
      const chosenPlayers = await playerChoosePunchlinesService(
        gameCode,
        playerId,
        punchlines
      );

      socket.to(gameCode).emit("round:increment-players-chosen");

      const sockets = ((await io
        .in(gameCode)
        .fetchSockets()) as unknown) as Socket[];

      if (sockets.every((socket) => chosenPlayers.has(socket.data.playerId))) {
        const chosenPunchlines = await enterHostChoosesState(gameCode);

        io.to(gameCode).emit("navigate", RoundState.hostChooses);
        io.to(gameCode).emit("round:chosen-punchlines", chosenPunchlines);
      }
    } catch (e) {
      if (e instanceof ServiceError) {
        callback(e.message);
      } else {
        callback("Server error");
      }
    }
  };

  const hostViewPunchline = (index: number) => {
    if (isHost(socket, gameCode)) {
      socket.to(gameCode).emit("round:host-view", index);
    }
  };

  socket.on("round:player-choose", playerChoosePunchlines);
  socket.on("round:host-view", hostViewPunchline);

  return {
    playerChoosePunchlines: playerChoosePunchlines,
    hostViewPunchline: hostViewPunchline,
  };
};
