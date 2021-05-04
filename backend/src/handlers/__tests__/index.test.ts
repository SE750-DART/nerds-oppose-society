import * as PlayerHandler from "../player.handler";
import { Server, Socket } from "socket.io";
import { Connection } from "../index";

describe("Connection handler", () => {
  let playerSpy: jest.SpyInstance;
  let joinSpy: jest.SpyInstance;

  beforeEach(() => {
    playerSpy = jest.spyOn(PlayerHandler, "default").mockImplementation();
    joinSpy = jest.spyOn(PlayerHandler, "playerJoin").mockImplementation();
  });

  afterEach(() => {
    joinSpy.mockRestore();
    playerSpy.mockRestore();
  });

  it("registers handlers to socket", async () => {
    const io = ("io" as unknown) as Server;
    const socket = ("socket" as unknown) as Socket;

    await Connection(io, socket);

    expect(playerSpy).toHaveBeenCalledTimes(1);
    expect(playerSpy).toHaveBeenCalledWith("io", "socket");

    expect(joinSpy).toHaveBeenCalledTimes(1);
    expect(joinSpy).toHaveBeenCalledWith(io, socket);
  });
});
