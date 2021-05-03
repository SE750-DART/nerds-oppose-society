import { Game, GameState } from "../../models";
import { Socket } from "socket.io";
import * as PlayerService from "../../services/player.service";
import { playerJoin, playerLeave } from "../player.handler";

describe("playerJoin handler", () => {
  let getSpy: jest.SpyInstance;
  let initialiseSpy: jest.SpyInstance;

  let toMock: jest.Mock;
  let emitMock: jest.Mock;

  let socket: Socket;
  let game: Game;

  beforeEach(() => {
    getSpy = jest.spyOn(PlayerService, "getPlayer");
    initialiseSpy = jest.spyOn(PlayerService, "initialisePlayer");

    toMock = jest.fn();
    emitMock = jest.fn();
    toMock.mockImplementation(() => {
      return {
        emit: emitMock,
      };
    });

    socket = ({
      to: toMock,
    } as unknown) as Socket;
    game = ({
      gameCode: "42069420",
    } as unknown) as Game;
  });

  afterEach(() => {
    getSpy.mockRestore();
    initialiseSpy.mockRestore();

    toMock.mockRestore();
    emitMock.mockRestore();
  });

  it("broadcasts to game room if player is new", async () => {
    getSpy.mockReturnValue({
      nickname: "Bob",
      new: true,
    });
    initialiseSpy.mockImplementation(() => null);

    await playerJoin(socket, game, "abc123");

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(game.gameCode, "abc123", game);

    expect(initialiseSpy).toHaveBeenCalledTimes(1);
    expect(initialiseSpy).toHaveBeenCalledWith(game, "abc123");

    expect(toMock).toHaveBeenCalledTimes(1);
    expect(toMock).toHaveBeenCalledWith(game.gameCode);

    expect(emitMock).toHaveBeenCalledTimes(1);
    expect(emitMock).toHaveBeenCalledWith("players:add", "Bob");
  });

  it("does not broadcast to game room if player is not new", async () => {
    getSpy.mockReturnValue({
      new: false,
    });
    initialiseSpy.mockImplementation(() => null);

    await playerJoin(socket, game, "abc123");

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith(game.gameCode, "abc123", game);

    expect(initialiseSpy).toHaveBeenCalledTimes(0);

    expect(toMock).toHaveBeenCalledTimes(0);

    expect(emitMock).toHaveBeenCalledTimes(0);
  });
});

describe("playerLeave handler", () => {
  let removeSpy: jest.SpyInstance;

  let toMock: jest.Mock;
  let emitMock: jest.Mock;

  let socket: Socket;

  beforeEach(() => {
    removeSpy = jest.spyOn(PlayerService, "removePlayer");

    toMock = jest.fn();
    emitMock = jest.fn();
    toMock.mockImplementation(() => {
      return {
        emit: emitMock,
      };
    });

    socket = ({
      to: toMock,
    } as unknown) as Socket;
  });

  afterEach(() => {
    removeSpy.mockRestore();

    toMock.mockRestore();
    emitMock.mockRestore();
  });

  it("removes player from game if game state is lobby", async () => {
    removeSpy.mockReturnValue({
      nickname: "Bob",
    });

    const game = ({
      gameCode: "42069",
      state: GameState.lobby,
    } as unknown) as Game;

    await playerLeave(socket, game, "12345");

    expect(removeSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledWith(game, "12345");

    expect(toMock).toHaveBeenCalledTimes(1);
    expect(toMock).toHaveBeenCalledWith("42069");

    expect(emitMock).toHaveBeenCalledTimes(1);
    expect(emitMock).toHaveBeenCalledWith("players:remove", "Bob");
  });

  it("does not removes player from game if game state is not lobby", async () => {
    removeSpy.mockReturnValue({
      nickname: "Bob",
    });

    const game = ({
      gameCode: "42069",
      state: GameState.finished,
    } as unknown) as Game;

    await playerLeave(socket, game, "12345");

    expect(removeSpy).toHaveBeenCalledTimes(0);

    expect(toMock).toHaveBeenCalledTimes(0);

    expect(emitMock).toHaveBeenCalledTimes(0);
  });
});
