import { Server, Socket } from "socket.io";
import { Game, GameState } from "../../models";
import { navigatePlayer, setHost } from "../game.handler";

describe("navigatePlayer handler", () => {
  let socket: Socket;
  let game: Game;

  beforeEach(() => {
    socket = ({
      emit: jest.fn(),
    } as unknown) as Socket;

    game = ({
      state: GameState.lobby,
      players: [
        { nickname: "Bob", new: true },
        { nickname: "Fred", new: false },
      ],
      settings: {
        roundLimit: 69,
        maxPlayers: 25,
      },
    } as unknown) as Game;
  });

  it("navigates player to lobby", () => {
    navigatePlayer(socket, game);

    expect(socket.emit).toHaveBeenCalledTimes(1);
    expect(socket.emit).toHaveBeenCalledWith(
      "navigate",
      GameState.lobby,
      [{ nickname: "Fred", new: false }],
      { roundLimit: 69, maxPlayers: 25 }
    );
  });

  it("throws error for invalid game state", () => {
    game = ({
      state: "INVALID",
    } as unknown) as Game;

    expect(() => navigatePlayer(socket, game)).toThrow("Invalid game state");
  });
});

describe("setHost handler", () => {
  let joinMock: jest.Mock;
  let emitMock: jest.Mock;
  let toMock: jest.Mock;

  let io: Server;
  let socket: Socket;

  beforeEach(() => {
    joinMock = jest.fn();
    emitMock = jest.fn();
    toMock = jest.fn(() => {
      return {
        emit: emitMock,
      };
    });

    io = ({
      to: toMock,
    } as unknown) as Server;

    socket = ({
      data: {
        gameCode: "42069",
      },
      join: joinMock,
    } as unknown) as Socket;
  });

  it("adds socket to game:host room and broadcasts to all players", () => {
    setHost(io, socket, "Bob");

    expect(joinMock).toHaveBeenCalledTimes(1);
    expect(joinMock).toHaveBeenCalledWith("42069:host");

    expect(toMock).toHaveBeenCalledTimes(1);
    expect(toMock).toHaveBeenCalledWith("42069");

    expect(emitMock).toHaveBeenCalledTimes(1);
    expect(emitMock).toHaveBeenCalledWith("host:new", "Bob");
  });
});
