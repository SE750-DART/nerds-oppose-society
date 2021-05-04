import { Server, Socket } from "socket.io";
import { Game, GameState, Settings } from "../../models";
import { isHost, navigatePlayer, setHost } from "../game.handler";
import registerGameHandler from "../game.handler";
import * as GameService from "../../services/game.service";

describe("Game handler", () => {
  const io = ("io" as unknown) as Server;
  let socket: Socket = ({
    data: {
      gameCode: "42069",
      playerId: "12345",
    },
    on: jest.fn(),
  } as unknown) as Socket;

  let handlers: {
    setMaxPlayers: (maxPlayers: Settings["maxPlayers"]) => Promise<void>;
    setRoundLimit: (roundLimit: Settings["roundLimit"]) => Promise<void>;
  };

  it("registers each game handler", async () => {
    handlers = registerGameHandler(io, socket);

    expect(socket.on).toHaveBeenCalledTimes(2);
    expect(socket.on).toHaveBeenCalledWith(
      "game:set-max-players",
      handlers.setMaxPlayers
    );
    expect(socket.on).toHaveBeenCalledWith(
      "game:set-round-limit",
      handlers.setRoundLimit
    );
  });

  describe("setMaxPlayers handler", () => {
    let gameSpy: jest.SpyInstance;
    let settingSpy: jest.SpyInstance;

    beforeEach(() => {
      gameSpy = jest
        .spyOn(GameService, "getGame")
        .mockResolvedValue(({ settings: {} } as unknown) as Game);
      settingSpy = jest
        .spyOn(GameService, "setMaxPlayers")
        .mockImplementation();
    });

    afterEach(() => {
      gameSpy.mockRestore();
      settingSpy.mockRestore();
    });

    it("sets max players if player is host", async () => {
      socket = ({
        data: { gameCode: "42069" },
        rooms: new Set(["<socket-1>", "42069", "42069:host"]),
        on: jest.fn(),
      } as unknown) as Socket;

      handlers = registerGameHandler(io, socket);

      await handlers.setMaxPlayers(30);

      expect(settingSpy).toHaveBeenCalledTimes(1);
      expect(settingSpy).toHaveBeenCalledWith({ settings: {} }, 30);
    });

    it("does nothing if player is not host", async () => {
      socket = ({
        data: { gameCode: "42069" },
        rooms: new Set(["<socket-1>", "42069"]),
        on: jest.fn(),
      } as unknown) as Socket;

      handlers = registerGameHandler(io, socket);

      await handlers.setMaxPlayers(100);

      expect(settingSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe("setRoundLimit handler", () => {
    let gameSpy: jest.SpyInstance;
    let settingSpy: jest.SpyInstance;

    beforeEach(() => {
      gameSpy = jest
        .spyOn(GameService, "getGame")
        .mockResolvedValue(({ settings: {} } as unknown) as Game);
      settingSpy = jest
        .spyOn(GameService, "setRoundLimit")
        .mockImplementation();
    });

    afterEach(() => {
      gameSpy.mockRestore();
      settingSpy.mockRestore();
    });

    it("sets round limit if player is host", async () => {
      socket = ({
        data: { gameCode: "42069" },
        rooms: new Set(["<socket-1>", "42069", "42069:host"]),
        on: jest.fn(),
      } as unknown) as Socket;

      handlers = registerGameHandler(io, socket);

      await handlers.setRoundLimit(100);

      expect(settingSpy).toHaveBeenCalledTimes(1);
      expect(settingSpy).toHaveBeenCalledWith({ settings: {} }, 100);
    });

    it("does nothing if player is not host", async () => {
      socket = ({
        data: { gameCode: "42069" },
        rooms: new Set(["<socket-1>", "42069"]),
        on: jest.fn(),
      } as unknown) as Socket;

      handlers = registerGameHandler(io, socket);

      await handlers.setRoundLimit(100);

      expect(settingSpy).toHaveBeenCalledTimes(0);
    });
  });
});

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

describe("isHost handler", () => {
  it("returns true if player is the host", () => {
    const socket = ({
      rooms: new Set(["<socket-1>", "42069", "42069:host"]),
    } as unknown) as Socket;

    expect(isHost(socket, "42069")).toBeTruthy();
  });

  it("returns false if player is not the host", () => {
    const socket = ({
      rooms: new Set(["<socket-1>", "42069"]),
    } as unknown) as Socket;

    expect(isHost(socket, "42069")).toBeFalsy();
  });
});
