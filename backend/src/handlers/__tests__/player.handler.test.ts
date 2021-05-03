import { Game } from "../../models";
import { Socket } from "socket.io";
import * as PlayerService from "../../services/player.service";
import { playerJoin } from "../player.handler";

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
    expect(emitMock).toHaveBeenCalledWith("players:new", "Bob");
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
