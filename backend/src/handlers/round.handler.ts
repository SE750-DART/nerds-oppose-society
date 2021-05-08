import { Server, Socket } from "socket.io";
import {
  enterHostChoosesState,
  playerChoosePunchlines as playerChoosePunchlinesService,
  hostChooseWinner as hostChooseWinnerService,
  enterPlayersChooseState,
} from "../services/round.service";
import { ServiceError } from "../util";
import { RoundState } from "../models/round.model";
import { assignNextHost, initialiseNextRound, isHost } from "./game.handler";

export default (
  io: Server,
  socket: Socket
): {
  hostStartRound: (callback: (data: string) => void) => void;
  playerChoosePunchlines: (
    punchlines: string[],
    callback: (data: string) => void
  ) => Promise<void>;
  hostViewPunchline: (index: number, callback: (data: string) => void) => void;
  hostChooseWinner: (
    winningPunchline: string[],
    callback: (data: string) => void
  ) => Promise<void>;
  hostNextRound: (callback: (data: string) => void) => void;
} => {
  const { gameCode, playerId } = socket.data;

  const hostStartRound = async (callback: (data: string) => void) => {
    try {
      if (isHost(socket, gameCode)) {
        await enterPlayersChooseState(gameCode, playerId);

        // TODO Allocate player cards

        io.to(gameCode).emit("navigate", RoundState.playersChoose);
      }
    } catch (e) {
      if (e instanceof ServiceError) {
        callback(e.message);
      } else {
        callback("Server error");
      }
    }
  };

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

  const hostViewPunchline = (
    index: number,
    callback: (data: string) => void
  ) => {
    try {
      if (isHost(socket, gameCode)) {
        socket.to(gameCode).emit("round:host-view", index);
      }
    } catch {
      callback("Server error");
    }
  };

  const hostChooseWinner = async (
    winningPunchlines: string[],
    callback: (data: string) => void
  ) => {
    try {
      if (isHost(socket, gameCode)) {
        const winningPlayerId = await hostChooseWinnerService(
          gameCode,
          playerId,
          winningPunchlines
        );

        io.to(gameCode).emit(
          "round:winner",
          winningPlayerId,
          winningPunchlines
        );
      }
    } catch (e) {
      if (e instanceof ServiceError) {
        callback(e.message);
      } else {
        callback("Server error");
      }
    }
  };

  const hostNextRound = async (callback: (data: string) => void) => {
    try {
      if (isHost(socket, gameCode)) {
        const newHostId = await assignNextHost(io, socket);

        await initialiseNextRound(io, gameCode, newHostId);
      }
    } catch (e) {
      if (e instanceof ServiceError) {
        callback(e.message);
      } else {
        callback("Server error");
      }
    }
  };

  socket.on("round:host-begin", hostStartRound);
  socket.on("round:player-choose", playerChoosePunchlines);
  socket.on("round:host-view", hostViewPunchline);
  socket.on("round:host-choose", hostChooseWinner);
  socket.on("round:host-next", hostNextRound);

  return {
    hostStartRound: hostStartRound,
    playerChoosePunchlines: playerChoosePunchlines,
    hostViewPunchline: hostViewPunchline,
    hostChooseWinner: hostChooseWinner,
    hostNextRound: hostNextRound,
  };
};
