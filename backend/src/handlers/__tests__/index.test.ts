import * as GameService from "../../services/game.service";
import * as GameHandler from "../game.handler";
import * as PlayerHandler from "../player.handler";
import { Socket } from "socket.io";
import { Connection } from "../index";

describe("Connection handler", () => {
  let getSpy: jest.SpyInstance;
  let navigateSpy: jest.SpyInstance;
  let joinSpy: jest.SpyInstance;
  let leaveSpy: jest.SpyInstance;

  beforeEach(() => {
    getSpy = jest.spyOn(GameService, "getGame");
    navigateSpy = jest.spyOn(GameHandler, "navigatePlayer");
    joinSpy = jest.spyOn(PlayerHandler, "playerJoin");
    leaveSpy = jest.spyOn(PlayerHandler, "playerLeave");
  });

  afterEach(() => {
    getSpy.mockRestore();
    navigateSpy.mockRestore();
    joinSpy.mockRestore();
    leaveSpy.mockRestore();
  });

  it("connects socket.io client", async () => {
    const socket = ({
      handshake: {
        auth: {
          gameCode: "42069",
          playerId: "abc123",
        },
      },
      join: jest.fn(),
      on: jest.fn(),
    } as unknown) as Socket;

    getSpy.mockReturnValue("game");
    navigateSpy.mockImplementation(() => null);
    joinSpy.mockImplementation(() => null);
    leaveSpy.mockImplementation(() => null);

    await Connection(socket);

    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(getSpy).toHaveBeenCalledWith("42069");

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(socket, "game");

    expect(socket.join).toHaveBeenCalledTimes(1);
    expect(socket.join).toHaveBeenCalledWith("42069");

    expect(joinSpy).toHaveBeenCalledTimes(1);
    expect(joinSpy).toHaveBeenCalledWith(socket, "game", "abc123");

    expect(socket.on).toHaveBeenCalledTimes(1);
  });
});
