import { Server, Socket } from "socket.io";
import { Game, GameState } from "../../models";
import * as GameService from "../../services/game.service";
import {
  emitHost,
  emitNavigate,
  getHost,
  isHost,
  setHost,
} from "../game.handler";
import registerGameHandler from "../game.handler";

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
    updateSetting: (
      setting: "MAX_PLAYERS" | "ROUND_LIMIT",
      value: number | undefined
    ) => Promise<void>;
  };

  it("registers each game handler", async () => {
    handlers = registerGameHandler(io, socket);

    expect(socket.on).toHaveBeenCalledTimes(1);
    expect(socket.on).toHaveBeenCalledWith(
      "settings:update",
      handlers.updateSetting
    );
  });

  describe("updateSetting handler", () => {
    let gameSpy: jest.SpyInstance;
    let maxPlayerSpy: jest.SpyInstance;
    let roundLimitSpy: jest.SpyInstance;

    beforeEach(() => {
      gameSpy = jest
        .spyOn(GameService, "getGame")
        .mockResolvedValue(({ settings: {} } as unknown) as Game);
      maxPlayerSpy = jest
        .spyOn(GameService, "setMaxPlayers")
        .mockImplementation();
      roundLimitSpy = jest
        .spyOn(GameService, "setRoundLimit")
        .mockImplementation();
    });

    afterEach(() => {
      gameSpy.mockRestore();
      maxPlayerSpy.mockRestore();
      roundLimitSpy.mockRestore();
    });

    it("does nothing if player is not host", async () => {
      socket = ({
        data: { gameCode: "42069" },
        rooms: new Set(["<socket-1>", "42069"]),
        on: jest.fn(),
        emit: jest.fn(),
      } as unknown) as Socket;

      handlers = registerGameHandler(io, socket);

      await handlers.updateSetting("MAX_PLAYERS", 100);

      expect(maxPlayerSpy).toHaveBeenCalledTimes(0);
      expect(roundLimitSpy).toHaveBeenCalledTimes(0);

      expect(socket.emit).toHaveBeenCalledTimes(0);
    });

    it("sets max players if player is host", async () => {
      socket = ({
        data: { gameCode: "42069" },
        rooms: new Set(["<socket-1>", "42069", "42069:host"]),
        on: jest.fn(),
        emit: jest.fn(),
      } as unknown) as Socket;

      handlers = registerGameHandler(io, socket);

      await handlers.updateSetting("MAX_PLAYERS", 30);

      expect(maxPlayerSpy).toHaveBeenCalledTimes(1);
      expect(maxPlayerSpy).toHaveBeenCalledWith({ settings: {} }, 30);

      expect(roundLimitSpy).toHaveBeenCalledTimes(0);

      expect(socket.emit).toHaveBeenCalledTimes(1);
      expect(socket.emit).toHaveBeenCalledWith(
        "settings:update",
        "MAX_PLAYERS",
        30
      );
    });

    it("sets round limit if player is host", async () => {
      socket = ({
        data: { gameCode: "42069" },
        rooms: new Set(["<socket-1>", "42069", "42069:host"]),
        on: jest.fn(),
        emit: jest.fn(),
      } as unknown) as Socket;

      handlers = registerGameHandler(io, socket);

      await handlers.updateSetting("ROUND_LIMIT", 100);

      expect(roundLimitSpy).toHaveBeenCalledTimes(1);
      expect(roundLimitSpy).toHaveBeenCalledWith({ settings: {} }, 100);

      expect(maxPlayerSpy).toHaveBeenCalledTimes(0);

      expect(socket.emit).toHaveBeenCalledTimes(1);
      expect(socket.emit).toHaveBeenCalledWith(
        "settings:update",
        "ROUND_LIMIT",
        100
      );
    });
  });
});

describe("emitNavigate handler", () => {
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
    emitNavigate(socket, game);

    expect(socket.emit).toHaveBeenCalledTimes(1);
    expect(socket.emit).toHaveBeenCalledWith("navigate", GameState.lobby);
  });
});

describe("emitHost handler", () => {
  let fetchMock: jest.Mock;
  let inMock: jest.Mock;

  let io: Server;
  let socket: Socket;

  beforeEach(() => {
    fetchMock = jest.fn();
    inMock = jest.fn(() => {
      return {
        fetchSockets: fetchMock,
      };
    });

    io = ({
      in: inMock,
    } as unknown) as Server;

    socket = ({
      data: {
        gameCode: "42069",
      },
      emit: jest.fn(),
    } as unknown) as Socket;
  });

  it("emits the current host", async () => {
    fetchMock.mockReturnValue([{ data: { nickname: "Bob" } }]);

    await emitHost(io, socket);

    expect(socket.emit).toHaveBeenCalledTimes(1);
    expect(socket.emit).toHaveBeenCalledWith("host", "Bob");
  });
});

describe("getHost handler", () => {
  let fetchMock: jest.Mock;
  let inMock: jest.Mock;

  let io: Server;

  beforeEach(() => {
    fetchMock = jest.fn();
    inMock = jest.fn(() => {
      return {
        fetchSockets: fetchMock,
      };
    });

    io = ({
      in: inMock,
    } as unknown) as Server;
  });

  it("gets the nickname of the current host", async () => {
    fetchMock.mockReturnValue([{ data: { nickname: "Jim" } }]);

    const host = await getHost(io, "69420");

    expect(host).toBe("Jim");

    expect(inMock).toHaveBeenCalledTimes(1);
    expect(inMock).toHaveBeenCalledWith("69420:host");

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns undefined if no host exists", async () => {
    fetchMock.mockReturnValue([]);

    const host = await getHost(io, "69420");

    expect(host).toBe(undefined);

    expect(inMock).toHaveBeenCalledTimes(1);
    expect(inMock).toHaveBeenCalledWith("69420:host");

    expect(fetchMock).toHaveBeenCalledTimes(1);
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
        nickname: "Bob",
      },
      join: joinMock,
    } as unknown) as Socket;
  });

  it("adds socket to game:host room and broadcasts to all players", () => {
    setHost(io, socket);

    expect(joinMock).toHaveBeenCalledTimes(1);
    expect(joinMock).toHaveBeenCalledWith("42069:host");

    expect(toMock).toHaveBeenCalledTimes(1);
    expect(toMock).toHaveBeenCalledWith("42069");

    expect(emitMock).toHaveBeenCalledTimes(1);
    expect(emitMock).toHaveBeenCalledWith("host", "Bob");
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
