import { Server, Socket } from "socket.io";
import * as GameService from "../../services/game.service";
import * as PlayerService from "../../services/player.service";
import * as GameHandler from "../game.handler";
import registerPlayerHandler, { playerJoin } from "../player.handler";
import { Game, GameState, Player } from "../../models";
import { ErrorType, ServiceError } from "../../util";

describe("playerJoin handler", () => {
  let getGameSpy: jest.SpyInstance;
  let emitNavigateSpy: jest.SpyInstance;
  let emitHostSpy: jest.SpyInstance;
  let getPlayerSpy: jest.SpyInstance;
  let initialisePlayerSpy: jest.SpyInstance;
  let setHostSpy: jest.SpyInstance;

  let emitMock: jest.Mock;
  let fetchMock: jest.Mock;
  let inMock: jest.Mock;
  let joinMock: jest.Mock;
  let toEmitMock: jest.Mock;
  let toMock: jest.Mock;

  let io: Server;
  let socket: Socket;
  let game: Game;

  beforeEach(() => {
    emitMock = jest.fn();
    joinMock = jest.fn();
    toEmitMock = jest.fn();
    toMock = jest.fn(() => {
      return {
        emit: toEmitMock,
      };
    });

    fetchMock = jest.fn();
    inMock = jest.fn(() => {
      return {
        fetchSockets: fetchMock,
      };
    });
    io = {
      in: inMock,
    } as unknown as Server;

    socket = {
      data: {
        gameCode: "42069",
        playerId: "abc123",
        nickname: "Bob",
      },
      to: toMock,
      join: joinMock,
      emit: emitMock,
    } as unknown as Socket;

    game = {
      gameCode: "42069",
      players: [
        {
          id: "abc123",
          nickname: "Bob",
          score: 0,
          new: false,
        },
        {
          id: "def456",
          nickname: "Fred",
          score: 0,
          new: true,
        },
        {
          id: "ghi789",
          nickname: "James",
          score: 1,
          new: false,
        },
      ],
      settings: {
        roundLimit: 69,
        maxPlayers: 25,
      },
    } as unknown as Game;

    getGameSpy = jest
      .spyOn(GameService, "getGame")
      .mockImplementation(async () => game);
    emitNavigateSpy = jest
      .spyOn(GameHandler, "emitNavigate")
      .mockImplementation(() => null);
    emitHostSpy = jest.spyOn(GameHandler, "emitHost").mockImplementation();
    getPlayerSpy = jest.spyOn(PlayerService, "getPlayer");
    initialisePlayerSpy = jest
      .spyOn(PlayerService, "initialisePlayer")
      .mockImplementation();
    setHostSpy = jest.spyOn(GameHandler, "setHost").mockImplementation();
  });

  afterEach(() => {
    getGameSpy.mockRestore();
    emitNavigateSpy.mockRestore();
    emitHostSpy.mockRestore();
    getPlayerSpy.mockRestore();
    initialisePlayerSpy.mockRestore();
    setHostSpy.mockRestore();
  });

  it("broadcasts player to game room if player is new", async () => {
    const player: Player = {
      id: "abc123",
      nickname: "Bob",
      new: true,
    } as unknown as Player;
    getPlayerSpy.mockReturnValue(player);

    fetchMock.mockReturnValue(["1"]);

    await playerJoin(io, socket);

    expect(getGameSpy).toHaveBeenCalledTimes(1);
    expect(getGameSpy).toHaveBeenCalledWith("42069");

    expect(emitMock).toHaveBeenCalledTimes(2);
    expect(emitMock).toHaveBeenCalledWith("players:initial", [
      {
        id: "abc123",
        nickname: "Bob",
        score: 0,
      },
      {
        id: "ghi789",
        nickname: "James",
        score: 1,
      },
    ]);
    expect(emitMock).toHaveBeenCalledWith("settings:initial", {
      roundLimit: 69,
      maxPlayers: 25,
    });

    expect(emitNavigateSpy).toHaveBeenCalledTimes(1);
    expect(emitNavigateSpy).toHaveBeenCalledWith(socket, game);

    expect(getPlayerSpy).toHaveBeenCalledTimes(1);
    expect(getPlayerSpy).toHaveBeenCalledWith(game.gameCode, "abc123", game);

    expect(initialisePlayerSpy).toHaveBeenCalledTimes(1);
    expect(initialisePlayerSpy).toHaveBeenCalledWith(game, "abc123");

    expect(toMock).toHaveBeenCalledTimes(1);
    expect(toMock).toHaveBeenCalledWith(game.gameCode);

    expect(toEmitMock).toHaveBeenCalledTimes(1);
    expect(toEmitMock).toHaveBeenCalledWith("players:add", "abc123", "Bob");

    expect(joinMock).toHaveBeenCalledTimes(1);
    expect(joinMock).toHaveBeenCalledWith(game.gameCode);

    expect(emitHostSpy).toHaveBeenCalledTimes(1);
    expect(emitHostSpy).toHaveBeenCalledWith(io, socket);
  });

  it("does not broadcast to game room if player is not new", async () => {
    const player: Player = {
      new: false,
    } as unknown as Player;
    getPlayerSpy.mockReturnValue(player);

    fetchMock.mockReturnValue(["1"]);

    await playerJoin(io, socket);

    expect(getPlayerSpy).toHaveBeenCalledTimes(1);
    expect(getPlayerSpy).toHaveBeenCalledWith("42069", "abc123", game);

    expect(initialisePlayerSpy).toHaveBeenCalledTimes(0);

    expect(toMock).toHaveBeenCalledTimes(0);

    expect(emitMock).toHaveBeenCalledTimes(2);

    expect(emitHostSpy).toHaveBeenCalledTimes(1);
    expect(emitHostSpy).toHaveBeenCalledWith(io, socket);
  });

  it("sets player as host if no other players are in game room", async () => {
    const player: Player = {
      nickname: "Bob",
      new: true,
    } as unknown as Player;
    getPlayerSpy.mockReturnValue(player);

    fetchMock.mockReturnValue([]);

    await playerJoin(io, socket);

    expect(inMock).toHaveBeenCalledTimes(1);
    expect(inMock).toHaveBeenCalledWith("42069");

    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(setHostSpy).toHaveBeenCalledTimes(1);
    expect(setHostSpy).toHaveBeenCalledWith(io, socket);

    expect(emitHostSpy).toHaveBeenCalledTimes(0);
  });

  it("does not set the player as host if other players are in game room", async () => {
    const player: Player = {
      nickname: "Dave",
      new: true,
    } as unknown as Player;
    getPlayerSpy.mockReturnValue(player);

    fetchMock.mockReturnValue(["1"]);

    await playerJoin(io, socket);

    expect(inMock).toHaveBeenCalledTimes(1);
    expect(inMock).toHaveBeenCalledWith("42069");

    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(setHostSpy).toHaveBeenCalledTimes(0);

    expect(emitHostSpy).toHaveBeenCalledTimes(1);
  });

  it("adds nickname to the socket data property", async () => {
    const player: Player = {
      nickname: "Bob",
      new: true,
    } as unknown as Player;
    getPlayerSpy.mockReturnValue(player);

    fetchMock.mockReturnValue(["1"]);

    await playerJoin(io, socket);

    expect(socket.data.nickname).toBe("Bob");
  });

  it("catches error thrown by getGame and disconnects player", async () => {
    const player: Player = {
      nickname: "Bob",
      new: true,
    } as unknown as Player;
    getPlayerSpy.mockReturnValue(player);

    fetchMock.mockReturnValue(["1"]);

    getGameSpy.mockRejectedValue(
      new ServiceError(ErrorType.gameCode, "Game does not exist")
    );
    socket.disconnect = jest.fn();

    await playerJoin(io, socket);

    expect(socket.disconnect).toHaveBeenCalledTimes(1);
    expect(socket.disconnect).toHaveBeenCalledWith(true);
  });

  it("catches error thrown by getPlayer and disconnects player", async () => {
    const player: Player = {
      nickname: "Bob",
      new: true,
    } as unknown as Player;
    getPlayerSpy.mockReturnValue(player);

    fetchMock.mockReturnValue(["1"]);

    getPlayerSpy.mockRejectedValue(
      new ServiceError(ErrorType.playerId, "Player does not exist")
    );
    socket.disconnect = jest.fn();

    await playerJoin(io, socket);

    expect(socket.disconnect).toHaveBeenCalledTimes(1);
    expect(socket.disconnect).toHaveBeenCalledWith(true);
  });

  it("catches error thrown by initialisePlayer and disconnects player", async () => {
    const player: Player = {
      nickname: "Bob",
      new: true,
    } as unknown as Player;
    getPlayerSpy.mockReturnValue(player);

    fetchMock.mockReturnValue(["1"]);

    initialisePlayerSpy.mockRejectedValue(
      new ServiceError(ErrorType.playerId, "Player does not exist")
    );
    socket.disconnect = jest.fn();

    await playerJoin(io, socket);

    expect(socket.disconnect).toHaveBeenCalledTimes(1);
    expect(socket.disconnect).toHaveBeenCalledWith(true);
  });
});

describe("Player handlers", () => {
  const io = "io" as unknown as Server;
  let socket: Socket;

  let handlers: {
    playerLeave: () => Promise<void>;
    playerLeaving: () => void;
  };

  it("registers each player handler", async () => {
    socket = {
      data: {
        gameCode: "42069",
        playerId: "12345",
      },
      on: jest.fn(),
    } as unknown as Socket;

    handlers = await registerPlayerHandler(io, socket);

    expect(socket.on).toHaveBeenCalledTimes(2);
    expect(socket.on).toHaveBeenCalledWith("disconnect", handlers.playerLeave);
    expect(socket.on).toHaveBeenCalledWith(
      "disconnecting",
      handlers.playerLeaving
    );
  });

  describe("playerLeave handler", () => {
    let io: Server;

    let ioEmitMock: jest.Mock;
    let socketEmitMock: jest.Mock;

    let gameSpy: jest.SpyInstance;
    let removeSpy: jest.SpyInstance;
    let socketsSpy: jest.SpyInstance;

    beforeEach(async () => {
      gameSpy = jest.spyOn(GameService, "getGame");
      removeSpy = jest.spyOn(PlayerService, "removePlayer");
      socketsSpy = jest.spyOn(GameHandler, "getSockets");

      ioEmitMock = jest.fn();
      io = {
        to: jest.fn(() => {
          return {
            emit: ioEmitMock,
          };
        }),
      } as unknown as Server;

      socketEmitMock = jest.fn();
      socket = {
        data: {
          gameCode: "42069",
          playerId: "12345",
        },
        on: jest.fn(),
        to: jest.fn(() => {
          return {
            emit: socketEmitMock,
          };
        }),
      } as unknown as Socket;

      handlers = await registerPlayerHandler(io, socket);
    });

    afterEach(() => {
      gameSpy.mockRestore();
      removeSpy.mockRestore();
      socketsSpy.mockRestore();
    });

    it("removes player from game if game state is lobby", async () => {
      const game = {
        gameCode: "42069",
        state: GameState.lobby,
      } as unknown as Game;
      gameSpy.mockReturnValue(game);

      removeSpy.mockReturnValue({
        id: "abc123",
      });

      await handlers.playerLeave();

      expect(removeSpy).toHaveBeenCalledTimes(1);
      expect(removeSpy).toHaveBeenCalledWith(game, "12345");

      expect(socket.to).toHaveBeenCalledTimes(1);
      expect(socket.to).toHaveBeenCalledWith("42069");
      expect(socketEmitMock).toHaveBeenCalledTimes(1);
      expect(socketEmitMock).toHaveBeenCalledWith("players:remove", "abc123");
    });

    it("does not removes player from game if game state is not lobby", async () => {
      const game = {
        gameCode: "42069",
        state: GameState.finished,
      } as unknown as Game;
      gameSpy.mockReturnValue(game);

      await handlers.playerLeave();

      expect(removeSpy).toHaveBeenCalledTimes(0);

      expect(socket.to).toHaveBeenCalledTimes(0);
      expect(socketEmitMock).toHaveBeenCalledTimes(0);
    });

    it("returns players to lobby if active players drops below minimum", async () => {
      const game = {
        gameCode: "42069",
        state: GameState.active,
        save: jest.fn(),
      } as unknown as Game;
      gameSpy.mockReturnValue(game);

      socketsSpy.mockReturnValue(["1", "2"]);

      await handlers.playerLeave();

      expect(removeSpy).toHaveBeenCalledTimes(0);

      expect(game.state).toBe(GameState.lobby);
      expect(game.save).toHaveBeenCalledTimes(1);

      expect(io.to).toHaveBeenCalledTimes(1);
      expect(io.to).toHaveBeenCalledWith("42069");
      expect(ioEmitMock).toHaveBeenCalledTimes(1);
      expect(ioEmitMock).toHaveBeenCalledWith("navigate", GameState.lobby);

      expect(socket.to).toHaveBeenCalledTimes(0);
      expect(socketEmitMock).toHaveBeenCalledTimes(0);
    });

    it("does not return players to lobby if active players is at or above minimum", async () => {
      const game = {
        gameCode: "42069",
        state: GameState.active,
        save: jest.fn(),
      } as unknown as Game;
      gameSpy.mockReturnValue(game);

      socketsSpy.mockReturnValue(["1", "2", "3"]);

      await handlers.playerLeave();

      expect(removeSpy).toHaveBeenCalledTimes(0);

      expect(game.state).toBe(GameState.active);
      expect(game.save).toHaveBeenCalledTimes(0);

      expect(io.to).toHaveBeenCalledTimes(0);
      expect(ioEmitMock).toHaveBeenCalledTimes(0);

      expect(socket.to).toHaveBeenCalledTimes(0);
      expect(socketEmitMock).toHaveBeenCalledTimes(0);
    });

    it("catches error thrown by getGame", async () => {
      gameSpy.mockRejectedValue(
        new ServiceError(ErrorType.gameCode, "Game does not exist")
      );

      removeSpy.mockReturnValue({
        nickname: "Bob",
      });

      await handlers.playerLeave();

      expect(gameSpy).toHaveBeenCalledTimes(1);
    });

    it("catches error thrown by removePlayer", async () => {
      const game = {
        gameCode: "42069",
        state: GameState.lobby,
      } as unknown as Game;
      gameSpy.mockReturnValue(game);

      removeSpy.mockRejectedValue(
        new ServiceError(ErrorType.playerId, "Player does not exist")
      );

      await handlers.playerLeave();

      expect(removeSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("playerLeaving handler", () => {
    let assignSpy: jest.SpyInstance;

    let socket: Socket;

    beforeEach(async () => {
      assignSpy = jest.spyOn(GameHandler, "assignNextHost");
      assignSpy.mockImplementation();

      socket = {
        data: {
          gameCode: "42069",
          playerId: "1",
        },
        on: jest.fn(),
      } as unknown as Socket;

      handlers = await registerPlayerHandler(io, socket);
    });

    afterEach(() => {
      assignSpy.mockRestore();
    });

    it("calls assignNextHost handler", async () => {
      await handlers.playerLeaving();

      expect(assignSpy).toHaveBeenCalledTimes(1);
      expect(assignSpy).toHaveBeenCalledWith("io", socket);
    });

    it("catches error thrown by assignNextHost", async () => {
      assignSpy.mockRejectedValue(new Error());

      await expect(handlers.playerLeaving()).resolves.toBeUndefined();

      expect(assignSpy).toHaveBeenCalledTimes(1);
    });
  });
});
