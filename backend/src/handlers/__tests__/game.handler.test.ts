import { Server, Socket } from "socket.io";
import { Game, SetupType } from "../../models";
import * as GameService from "../../services/game.service";
import registerGameHandler, {
  assignNextHost,
  emitHost,
  getActivePlayers,
  getHost,
  getSockets,
  initialiseNextRound,
  isHost,
  setHost,
} from "../game.handler";
import { ErrorType, ServiceError } from "../../util";
import { RoundState } from "../../models/round.model";

describe("Game handler", () => {
  const io = ("io" as unknown) as Server;
  const socket: Socket = ({
    data: {
      gameCode: "42069",
      playerId: "12345",
    },
    on: jest.fn(),
  } as unknown) as Socket;

  let handlers: {
    startGame: (callback: (data: string) => void) => Promise<void>;
    updateSetting: (
      setting: "MAX_PLAYERS" | "ROUND_LIMIT",
      value: number | undefined,
      callback: (data: string) => void
    ) => Promise<void>;
  };

  it("registers each game handler", async () => {
    handlers = registerGameHandler(io, socket);

    expect(socket.on).toHaveBeenCalledTimes(2);
    expect(socket.on).toHaveBeenCalledWith("start", handlers.startGame);
    expect(socket.on).toHaveBeenCalledWith(
      "settings:update",
      handlers.updateSetting
    );
  });

  describe("startGame handler", () => {
    let initialiseSpy: jest.SpyInstance;

    let callback: jest.Mock;
    let fetchMock: jest.Mock;
    let emitMock: jest.Mock;

    let io: Server;
    let socket: Socket;

    beforeEach(() => {
      initialiseSpy = jest.spyOn(GameService, "initialiseNextRound");
      initialiseSpy.mockReturnValue({
        roundNumber: 69,
        setup: {
          setup: "Why did the chicken cross the road?",
          type: SetupType.pickOne,
        },
      });

      callback = jest.fn();

      fetchMock = jest.fn();
      emitMock = jest.fn();
      io = ({
        in: jest.fn(() => {
          return {
            fetchSockets: fetchMock,
          };
        }),
        to: jest.fn(() => {
          return {
            emit: emitMock,
          };
        }),
      } as unknown) as Server;

      socket = ({
        data: {
          gameCode: "42069",
          playerId: "12345",
        },
        rooms: new Set(["<socket asdadas>", "42069", "42069:host"]),
        on: jest.fn(),
      } as unknown) as Socket;

      handlers = registerGameHandler(io, socket);
    });

    afterEach(() => {
      initialiseSpy.mockRestore();
    });

    it("non-host calls handler and nothing happens", async () => {
      socket.rooms.delete("42069:host");

      await handlers.startGame(callback);

      expect(callback).toHaveBeenCalledTimes(0);
      expect(initialiseSpy).toHaveBeenCalledTimes(0);

      expect(io.in).toHaveBeenCalledTimes(0);
      expect(fetchMock).toHaveBeenCalledTimes(0);

      expect(io.to).toHaveBeenCalledTimes(0);
      expect(emitMock).toHaveBeenCalledTimes(0);
    });

    it("assigns new host and initialises next round", async () => {
      fetchMock.mockReturnValue(["1", "2", "3", "4"]);

      await handlers.startGame(callback);

      expect(callback).toHaveBeenCalledTimes(0);

      expect(io.in).toHaveBeenCalledTimes(1);
      expect(io.in).toHaveBeenCalledWith("42069");
      expect(fetchMock).toHaveBeenCalledTimes(1);

      expect(initialiseSpy).toHaveBeenCalledTimes(1);

      expect(io.to).toHaveBeenCalledTimes(3);
      expect(io.to).toHaveBeenNthCalledWith(1, "42069");
      expect(io.to).toHaveBeenNthCalledWith(2, "42069");
      expect(io.to).toHaveBeenNthCalledWith(3, "42069");

      expect(emitMock).toHaveBeenCalledTimes(3);
      expect(emitMock).toHaveBeenNthCalledWith(1, "round:number", 69);
      expect(emitMock).toHaveBeenNthCalledWith(2, "round:setup", {
        setup: "Why did the chicken cross the road?",
        type: SetupType.pickOne,
      });
      expect(emitMock).toHaveBeenNthCalledWith(
        3,
        "navigate",
        RoundState.before
      );
    });

    it("does not start round if not min active players", async () => {
      fetchMock.mockReturnValue(["1", "2"]);

      await handlers.startGame(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        `Need a minimum of 3 players to start a game`
      );

      expect(io.in).toHaveBeenCalledTimes(1);
      expect(io.in).toHaveBeenCalledWith("42069");
      expect(fetchMock).toHaveBeenCalledTimes(1);

      expect(initialiseSpy).toHaveBeenCalledTimes(0);

      expect(io.to).toHaveBeenCalledTimes(0);
      expect(emitMock).toHaveBeenCalledTimes(0);
    });

    it("catches ServiceError thrown by initialiseNextRound", async () => {
      fetchMock.mockReturnValue(["1", "2", "3"]);

      initialiseSpy.mockRejectedValue(
        new ServiceError(ErrorType.gameCode, "Game does not exist")
      );

      await handlers.startGame(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("Game does not exist");

      expect(io.to).toHaveBeenCalledTimes(0);
      expect(emitMock).toHaveBeenCalledTimes(0);
    });

    it("catches Error thrown by initialiseNextRound", async () => {
      fetchMock.mockReturnValue(["1", "2", "3", "4"]);

      initialiseSpy.mockRejectedValue(Error());

      await handlers.startGame(callback);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("Server error");

      expect(io.to).toHaveBeenCalledTimes(0);
      expect(emitMock).toHaveBeenCalledTimes(0);
    });
  });

  describe("updateSetting handler", () => {
    let gameSpy: jest.SpyInstance;
    let maxPlayerSpy: jest.SpyInstance;
    let roundLimitSpy: jest.SpyInstance;

    let emitMock: jest.Mock;

    let socket: Socket;

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

      emitMock = jest.fn();
      socket = ({
        data: { gameCode: "42069" },
        rooms: new Set(["<socket-1>", "42069", "42069:host"]),
        on: jest.fn(),
        to: jest.fn(() => {
          return {
            emit: emitMock,
          };
        }),
      } as unknown) as Socket;

      handlers = registerGameHandler(io, socket);
    });

    afterEach(() => {
      gameSpy.mockRestore();
      maxPlayerSpy.mockRestore();
      roundLimitSpy.mockRestore();
    });

    it("does nothing if player is not host", async () => {
      socket.rooms.delete("42069:host");

      await handlers.updateSetting("MAX_PLAYERS", 100, jest.fn());

      expect(maxPlayerSpy).toHaveBeenCalledTimes(0);
      expect(roundLimitSpy).toHaveBeenCalledTimes(0);

      expect(socket.to).toHaveBeenCalledTimes(0);
      expect(emitMock).toHaveBeenCalledTimes(0);
    });

    it("sets max players if player is host", async () => {
      await handlers.updateSetting("MAX_PLAYERS", 30, jest.fn());

      expect(maxPlayerSpy).toHaveBeenCalledTimes(1);
      expect(maxPlayerSpy).toHaveBeenCalledWith({ settings: {} }, 30);

      expect(roundLimitSpy).toHaveBeenCalledTimes(0);

      expect(socket.to).toHaveBeenCalledTimes(1);
      expect(socket.to).toHaveBeenCalledWith("42069");
      expect(emitMock).toHaveBeenCalledTimes(1);
      expect(emitMock).toHaveBeenCalledWith(
        "settings:update",
        "MAX_PLAYERS",
        30
      );
    });

    it("sets round limit if player is host", async () => {
      await handlers.updateSetting("ROUND_LIMIT", 100, jest.fn());

      expect(roundLimitSpy).toHaveBeenCalledTimes(1);
      expect(roundLimitSpy).toHaveBeenCalledWith({ settings: {} }, 100);

      expect(maxPlayerSpy).toHaveBeenCalledTimes(0);

      expect(socket.to).toHaveBeenCalledTimes(1);
      expect(socket.to).toHaveBeenCalledWith("42069");
      expect(emitMock).toHaveBeenCalledTimes(1);
      expect(emitMock).toHaveBeenCalledWith(
        "settings:update",
        "ROUND_LIMIT",
        100
      );
    });

    it("calls back with error message if getGame throws ServiceError", async () => {
      gameSpy.mockRejectedValue(
        new ServiceError(ErrorType.gameCode, "Game does not exist")
      );

      const callback = jest.fn();
      await handlers.updateSetting("MAX_PLAYERS", 100, callback);

      expect(socket.to).toHaveBeenCalledTimes(0);
      expect(emitMock).toHaveBeenCalledTimes(0);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("Game does not exist");
    });

    it("calls back with error message if getGame throws Error", async () => {
      gameSpy.mockRejectedValue(new Error("Server error"));

      const callback = jest.fn();
      await handlers.updateSetting("ROUND_LIMIT", 100, callback);

      expect(socket.to).toHaveBeenCalledTimes(0);
      expect(emitMock).toHaveBeenCalledTimes(0);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("Server error");
    });

    it("calls back with error message if setMaxPlayersService throws Error", async () => {
      maxPlayerSpy.mockRejectedValue(new Error("Server error"));

      const callback = jest.fn();
      await handlers.updateSetting("MAX_PLAYERS", 100, callback);

      expect(socket.to).toHaveBeenCalledTimes(0);
      expect(emitMock).toHaveBeenCalledTimes(0);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("Server error");
    });

    it("calls back with error message if setRoundLimitService throws Error", async () => {
      roundLimitSpy.mockRejectedValue(new Error("Server error"));

      const callback = jest.fn();
      await handlers.updateSetting("ROUND_LIMIT", 100, callback);

      expect(socket.to).toHaveBeenCalledTimes(0);
      expect(emitMock).toHaveBeenCalledTimes(0);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("Server error");
    });
  });
});

describe("intialiseNextRound handler", () => {
  let initialiseSpy: jest.SpyInstance;

  let emitMock: jest.Mock;

  let io: Server;

  beforeEach(() => {
    initialiseSpy = jest.spyOn(GameService, "initialiseNextRound");

    emitMock = jest.fn();
    io = ({
      to: jest.fn(() => {
        return {
          emit: emitMock,
        };
      }),
    } as unknown) as Server;
  });

  afterEach(() => {
    initialiseSpy.mockRestore();
  });

  it("assigns new host and initialises next round", async () => {
    initialiseSpy.mockReturnValue({
      roundNumber: 69,
      setup: {
        setup: "Why did the chicken cross the road?",
        type: SetupType.pickOne,
      },
    });

    await initialiseNextRound(io, "42069", "def456");

    expect(io.to).toHaveBeenCalledTimes(3);
    expect(io.to).toHaveBeenNthCalledWith(1, "42069");
    expect(io.to).toHaveBeenNthCalledWith(2, "42069");
    expect(io.to).toHaveBeenNthCalledWith(3, "42069");

    expect(emitMock).toHaveBeenCalledTimes(3);
    expect(emitMock).toHaveBeenNthCalledWith(1, "round:number", 69);
    expect(emitMock).toHaveBeenNthCalledWith(2, "round:setup", {
      setup: "Why did the chicken cross the road?",
      type: SetupType.pickOne,
    });
    expect(emitMock).toHaveBeenNthCalledWith(3, "navigate", RoundState.before);
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
    fetchMock.mockReturnValue([{ data: { playerId: "abc123" } }]);

    await emitHost(io, socket);

    expect(socket.emit).toHaveBeenCalledTimes(1);
    expect(socket.emit).toHaveBeenCalledWith("host", "abc123");
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

  it("gets the id of the current host", async () => {
    fetchMock.mockReturnValue([{ data: { playerId: "abc123" } }]);

    const host = await getHost(io, "69420");

    expect(host).toBe("abc123");

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
        playerId: "abc123",
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
    expect(emitMock).toHaveBeenCalledWith("host", "abc123");
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

describe("assignNextHost handler", () => {
  let io: Server;
  let socket: Socket;

  let fetchMock: jest.Mock;
  let joinMock: jest.Mock;
  let emitMock: jest.Mock;

  let gameSpy: jest.SpyInstance;
  let mapSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchMock = jest.fn();
    joinMock = jest.fn();
    emitMock = jest.fn();
    io = ({
      in: jest.fn(() => {
        return {
          fetchSockets: fetchMock,
        };
      }),
      to: jest.fn(() => {
        return {
          emit: emitMock,
        };
      }),
    } as unknown) as Server;

    gameSpy = jest.spyOn(GameService, "getGame");
    gameSpy.mockReturnValue({
      players: [
        { id: "1", nickname: "Bob" },
        { id: "2", nickname: "Fred" },
        { id: "3", nickname: "Dave" },
        { id: "4", nickname: "Jim" },
        { id: "5", nickname: "Steve" },
      ],
    });
    mapSpy = jest.spyOn(Map.prototype, "get");
  });

  afterEach(() => {
    gameSpy.mockRestore();
    mapSpy.mockRestore();
  });

  it("does nothing if player is not host", async () => {
    const socket = ({
      data: {
        gameCode: "42069",
        playerId: "1",
      },
      rooms: new Set(["<socket fosirghidhfs>", "42069"]),
      on: jest.fn(),
    } as unknown) as Socket;

    await assignNextHost(io, socket);

    expect(gameSpy).toHaveBeenCalledTimes(0);

    expect(joinMock).toHaveBeenCalledTimes(0);
    expect(io.in).toHaveBeenCalledTimes(0);
    expect(fetchMock).toHaveBeenCalledTimes(0);
  });

  it("does not assign new host if player is host but the only player", async () => {
    socket = ({
      data: {
        gameCode: "42069",
        playerId: "1",
      },
      rooms: new Set(["<socket fosirghidhfs>", "42069", "42069:host"]),
    } as unknown) as Socket;

    fetchMock.mockReturnValue([{ data: { playerId: "1" } }]);

    await assignNextHost(io, socket);

    expect(gameSpy).toHaveBeenCalledTimes(1);

    expect(io.in).toHaveBeenCalledTimes(1);
    expect(io.in).toHaveBeenCalledWith("42069");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(joinMock).toHaveBeenCalledTimes(0);

    expect(io.to).toHaveBeenCalledTimes(0);
    expect(emitMock).toHaveBeenCalledTimes(0);
  });

  it("assigns new host", async () => {
    socket = ({
      data: {
        gameCode: "42069",
        playerId: "1",
      },
      rooms: new Set(["<socket fosirghidhfs>", "42069", "42069:host"]),
    } as unknown) as Socket;

    fetchMock.mockReturnValue([
      { data: { playerId: "1" } },
      { data: { gameCode: "42069", playerId: "2" }, join: joinMock },
    ]);

    await assignNextHost(io, socket);

    expect(joinMock).toHaveBeenCalledTimes(1);
    expect(joinMock).toHaveBeenCalledWith("42069:host");

    expect(io.to).toHaveBeenCalledTimes(1);
    expect(io.to).toHaveBeenCalledWith("42069");
    expect(emitMock).toHaveBeenCalledTimes(1);
    expect(emitMock).toHaveBeenCalledWith("host", "2");
  });

  it("assigns new host looping to start of active players array", async () => {
    socket = ({
      data: {
        gameCode: "42069",
        playerId: "5",
        nickname: "Steve",
      },
      rooms: new Set(["<socket fosirghidhfs>", "42069", "42069:host"]),
    } as unknown) as Socket;

    fetchMock.mockReturnValue([
      { data: { gameCode: "42069", playerId: "1" }, join: joinMock },
      { data: { playerId: "5" } },
    ]);

    await assignNextHost(io, socket);

    expect(joinMock).toHaveBeenCalledTimes(1);
    expect(joinMock).toHaveBeenCalledWith("42069:host");

    expect(io.to).toHaveBeenCalledTimes(1);
    expect(io.to).toHaveBeenCalledWith("42069");
    expect(emitMock).toHaveBeenCalledTimes(1);
    expect(emitMock).toHaveBeenCalledWith("host", "1");
  });

  it("assigns new host skipping non-active players", async () => {
    socket = ({
      data: {
        gameCode: "42069",
        playerId: "1",
        nickname: "Steve",
      },
      rooms: new Set(["<socket fosirghidhfs>", "42069", "42069:host"]),
    } as unknown) as Socket;

    fetchMock.mockReturnValue([
      { data: { playerId: "1" } },
      { data: { gameCode: "42069", playerId: "3" }, join: joinMock },
    ]);

    await assignNextHost(io, socket);

    expect(joinMock).toHaveBeenCalledTimes(1);
    expect(joinMock).toHaveBeenCalledWith("42069:host");

    expect(io.to).toHaveBeenCalledTimes(1);
    expect(io.to).toHaveBeenCalledWith("42069");
    expect(emitMock).toHaveBeenCalledTimes(1);
    expect(emitMock).toHaveBeenCalledWith("host", "3");
  });

  it("does not set host if new host socket is somehow undefined", async () => {
    socket = ({
      data: {
        gameCode: "42069",
        playerId: "5",
      },
      rooms: new Set(["<socket fosirghidhfs>", "42069", "42069:host"]),
    } as unknown) as Socket;

    fetchMock.mockReturnValue([
      { data: { playerId: "1" } },
      { data: { playerId: "5" } },
    ]);

    mapSpy.mockReturnValue(undefined);

    await assignNextHost(io, socket);

    expect(joinMock).toHaveBeenCalledTimes(0);

    expect(io.to).toHaveBeenCalledTimes(0);
    expect(emitMock).toHaveBeenCalledTimes(0);
  });
});

describe("getActivePlayers handler", () => {
  let io: Server;

  let fetchMock: jest.Mock;

  let gameSpy: jest.SpyInstance;

  beforeEach(() => {
    fetchMock = jest.fn();
    io = ({
      in: jest.fn(() => {
        return {
          fetchSockets: fetchMock,
        };
      }),
    } as unknown) as Server;

    gameSpy = jest.spyOn(GameService, "getGame");
    gameSpy.mockReturnValue({
      players: [
        { id: "1", nickname: "Bob" },
        { id: "2", nickname: "Fred" },
        { id: "3", nickname: "Dave" },
        { id: "4", nickname: "Jim" },
        { id: "5", nickname: "Steve" },
      ],
    });
  });

  afterEach(() => {
    gameSpy.mockRestore();
  });

  it("returns activePlayers, game and socketsByPlayerId", async () => {
    fetchMock.mockReturnValue([
      { data: { playerId: "1" } },
      { data: { playerId: "2" } },
      { data: { playerId: "4" } },
    ]);

    const { activePlayers, game, socketsByPlayerId } = await getActivePlayers(
      io,
      "42069"
    );

    expect(gameSpy).toHaveBeenCalledTimes(1);

    expect(io.in).toHaveBeenCalledTimes(1);
    expect(io.in).toHaveBeenCalledWith("42069");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(activePlayers).toEqual(
      expect.arrayContaining([
        { id: "1", nickname: "Bob" },
        {
          id: "2",
          nickname: "Fred",
        },
        { id: "4", nickname: "Jim" },
      ])
    );
    expect(game).toBe(gameSpy.mock.results[0].value);
    expect(socketsByPlayerId).toEqual(
      new Map([
        ["1", { data: { playerId: "1" } }],
        ["2", { data: { playerId: "2" } }],
        ["4", { data: { playerId: "4" } }],
      ])
    );
  });
});

describe("getSockets handler", () => {
  let io: Server;

  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    io = ({
      in: jest.fn(() => {
        return {
          fetchSockets: fetchMock,
        };
      }),
    } as unknown) as Server;
  });

  it("returns sockets", async () => {
    fetchMock.mockReturnValue([
      { data: { playerId: "1" } },
      { data: { playerId: "2" } },
      { data: { playerId: "4" } },
    ]);

    const sockets = await getSockets(io, "42069");

    expect(io.in).toHaveBeenCalledTimes(1);
    expect(io.in).toHaveBeenCalledWith("42069");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(sockets).toEqual(
      expect.arrayContaining([
        { data: { playerId: "1" } },
        { data: { playerId: "2" } },
        { data: { playerId: "4" } },
      ])
    );
  });
});
