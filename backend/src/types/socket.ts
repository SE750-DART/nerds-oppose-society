import { Game, GameState, Player, Setup } from "../models";
import { Server, Socket } from "socket.io";
import { RoundState } from "../models/round.model";

export interface ServerToClientEvents {
  navigate: (state: GameState | RoundState) => void;
  host: (host: string) => void;
  "settings:initial": (settings: {
    roundLimit: number | undefined;
    maxPlayers: number | undefined;
  }) => void;
  "settings:update": (
    setting: "MAX_PLAYERS" | "ROUND_LIMIT",
    value: number | undefined
  ) => void;

  "players:initial": (
    players: { id: string; nickname: Player["nickname"]; score: number }[]
  ) => void;
  "players:add": (playerId: string, nickname: Player["nickname"]) => void;
  "players:remove": (playerId: string) => void;

  "round:number": (roundNumber: number) => void;
  "round:setup": (setup: Setup) => void;
  "round:increment-players-chosen": () => void;
  "round:chosen-punchlines": (chosenPunchlines: string[][]) => void;
  "round:host-view": (index: number) => void;
  "round:winner": (
    winningPlayerId: string,
    winningPunchlines: string[]
  ) => void;

  "punchlines:add": (addedPunchlines: string[]) => void;
  "punchlines:remove": (removedPunchlines: string[]) => void;
}

export interface ClientToServerEvents {
  start: (callback: (data: string) => void) => void;
  "settings:update": (
    setting: "MAX_PLAYERS" | "ROUND_LIMIT",
    value: number | undefined,
    callback: (data: string) => void
  ) => void;

  "round:host-begin": (callback: (data: string) => void) => void;
  "round:player-choose": (
    punchlines: string[],
    callback: (data: string) => void
  ) => void;
  "round:host-view": (index: number, callback: (data: string) => void) => void;
  "round:host-choose": (
    winningPunchlines: string[],
    callback: (data: string) => void
  ) => void;
  "round:host-next": (callback: (data: string) => void) => void;
}

export interface InterServerEvents {
  [event: string]: never;
}

export interface SocketData {
  gameCode: Game["gameCode"];
  playerId: string;
  nickname: Player["nickname"];
}

export type ServerType = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type SocketType = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
