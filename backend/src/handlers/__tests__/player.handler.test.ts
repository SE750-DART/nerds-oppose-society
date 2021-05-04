import { Server, Socket } from "socket.io";
import * as GameService from "../../services/game.service";
import * as PlayerService from "../../services/player.service";
import * as GameHandler from "../game.handler";
import registerPlayerHandler, { playerJoin } from "../player.handler";
import { Game, GameState, Player } from "../../models";

describe("playerJoin handler", () => {
  let gameSpy: jest.SpyInstance;
  let navigateSpy: jest.SpyInstance;
  let playerSpy: jest.SpyInstance;
  let initialiseSpy: jest.SpyInstance;
  let hostSpy: jest.SpyInstance;

  let fetchMock: jest.Mock;
  let inMock: jest.Mock;
  let joinMock: jest.Mock;
  let emitMock: jest.Mock;
  let toMock: jest.Mock;

  let io: Server;
  let socket: Socket;
  let game: Game;

  beforeEach(() => {
    fetchMock = jest.fn();
    inMock = jest.fn(() => {
      return {
        fetchSockets: fetchMock,
      };
    });
    joinMock = jest.fn();
    emitMock = jest.fn();
    toMock = jest.fn(() => {
      return {
        emit: emitMock,
      };
    });

    io = ({
      in: inMock,
    } as unknown) as Server;
    socket = ({
      handshake: {
        auth: {
          gameCode: "42069",
          playerId: "abc123",
        },
      },
      to: toMock,
      join: joinMock,
    } as unknown) as Socket;
    game = ({
      gameCode: "42069",
    } as unknown) as Game;

    gameSpy = jest
      .spyOn(GameService, "getGame")
      .mockImplementation(async () => game);
    navigateSpy = jest
      .spyOn(GameHandler, "navigatePlayer")
      .mockImplementation();
    playerSpy = jest.spyOn(PlayerService, "getPlayer");
    initialiseSpy = jest
      .spyOn(PlayerService, "initialisePlayer")
      .mockImplementation();
    hostSpy = jest.spyOn(GameHandler, "setHost").mockImplementation();
  });

  afterEach(() => {
    gameSpy.mockRestore();
    navigateSpy.mockRestore();
    playerSpy.mockRestore();
    initialiseSpy.mockRestore();
    hostSpy.mockRestore();
  });

  it("broadcasts to game room if player is new", async () => {
    const player: Player = ({
      nickname: "Bob",
      new: true,
    } as unknown) as Player;
    playerSpy.mockReturnValue(player);

    fetchMock.mockReturnValue(["1"]);

    await playerJoin(io, socket);

    expect(gameSpy).toHaveBeenCalledTimes(1);
    expect(gameSpy).toHaveBeenCalledWith("42069");

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(socket, game);

    expect(playerSpy).toHaveBeenCalledTimes(1);
    expect(playerSpy).toHaveBeenCalledWith(game.gameCode, "abc123", game);

    expect(initialiseSpy).toHaveBeenCalledTimes(1);
    expect(initialiseSpy).toHaveBeenCalledWith(game, "abc123");

    expect(toMock).toHaveBeenCalledTimes(1);
    expect(toMock).toHaveBeenCalledWith(game.gameCode);

    expect(emitMock).toHaveBeenCalledTimes(1);
    expect(emitMock).toHaveBeenCalledWith("players:add", "Bob");

    expect(joinMock).toHaveBeenCalledTimes(1);
    expect(joinMock).toHaveBeenCalledWith(game.gameCode);
  });

  it("does not broadcast to game room if player is not new", async () => {
    const player: Player = ({
      new: false,
    } as unknown) as Player;
    playerSpy.mockReturnValue(player);

    fetchMock.mockReturnValue(["1"]);

    await playerJoin(io, socket);

    expect(playerSpy).toHaveBeenCalledTimes(1);
    expect(playerSpy).toHaveBeenCalledWith("42069", "abc123", game);

    expect(initialiseSpy).toHaveBeenCalledTimes(0);

    expect(toMock).toHaveBeenCalledTimes(0);

    expect(emitMock).toHaveBeenCalledTimes(0);
  });

  it("sets player as host if no other players are in game room", async () => {
    const player: Player = ({
      nickname: "Bob",
      new: true,
    } as unknown) as Player;
    playerSpy.mockReturnValue(player);

    fetchMock.mockReturnValue([]);

    await playerJoin(io, socket);

    expect(inMock).toHaveBeenCalledTimes(1);
    expect(inMock).toHaveBeenCalledWith("42069");

    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(hostSpy).toHaveBeenCalledTimes(1);
    expect(hostSpy).toHaveBeenCalledWith(io, socket, "Bob");
  });

  it("does not set the player as host if other players are in game room", async () => {
    const player: Player = ({
      nickname: "Dave",
      new: true,
    } as unknown) as Player;
    playerSpy.mockReturnValue(player);

    fetchMock.mockReturnValue(["1"]);

    await playerJoin(io, socket);

    expect(inMock).toHaveBeenCalledTimes(1);
    expect(inMock).toHaveBeenCalledWith("42069");

    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(hostSpy).toHaveBeenCalledTimes(0);
  });
});

describe("Player handlers", () => {
  let toMock: jest.Mock;
  let emitMock: jest.Mock;

  const io = ("io" as unknown) as Server;
  let socket: Socket;

  let handlers: {
    playerLeave: () => Promise<void>;
  };

  beforeEach(async () => {
    toMock = jest.fn();
    emitMock = jest.fn();
    toMock.mockImplementation(() => {
      return {
        emit: emitMock,
      };
    });

    socket = ({
      handshake: {
        auth: {
          gameCode: "42069",
          playerId: "12345",
        },
      },
      on: jest.fn(),
      to: toMock,
    } as unknown) as Socket;

    handlers = await registerPlayerHandler(io, socket);
  });

  it("registers each player handler", async () => {
    expect(socket.on).toHaveBeenCalledTimes(1);
    expect(socket.on).toHaveBeenCalledWith("disconnect", handlers.playerLeave);
  });

  describe("playerLeave handler", () => {
    let gameSpy: jest.SpyInstance;
    let removeSpy: jest.SpyInstance;

    beforeEach(() => {
      gameSpy = jest.spyOn(GameService, "getGame");
      removeSpy = jest.spyOn(PlayerService, "removePlayer");
    });

    afterEach(() => {
      gameSpy.mockRestore();
      removeSpy.mockRestore();
    });

    it("removes player from game if game state is lobby", async () => {
      const game = ({
        gameCode: "42069",
        state: GameState.lobby,
      } as unknown) as Game;
      gameSpy.mockReturnValue(game);

      removeSpy.mockReturnValue({
        nickname: "Bob",
      });

      await handlers.playerLeave();

      expect(removeSpy).toHaveBeenCalledTimes(1);
      expect(removeSpy).toHaveBeenCalledWith(game, "12345");

      expect(toMock).toHaveBeenCalledTimes(1);
      expect(toMock).toHaveBeenCalledWith("42069");

      expect(emitMock).toHaveBeenCalledTimes(1);
      expect(emitMock).toHaveBeenCalledWith("players:remove", "Bob");
    });

    it("does not removes player from game if game state is not lobby", async () => {
      const game = ({
        gameCode: "42069",
        state: GameState.finished,
      } as unknown) as Game;
      gameSpy.mockReturnValue(game);

      removeSpy.mockReturnValue({
        nickname: "Bob",
      });

      await handlers.playerLeave();

      expect(removeSpy).toHaveBeenCalledTimes(0);

      expect(toMock).toHaveBeenCalledTimes(0);

      expect(emitMock).toHaveBeenCalledTimes(0);
    });
  });
});
