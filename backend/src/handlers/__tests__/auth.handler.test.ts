import * as PlayerService from "../../services/player.service";
import Auth from "../auth.handler";
import { Socket } from "socket.io";

describe("auth Handler", () => {
  let spy: jest.SpyInstance;

  beforeEach(() => {
    spy = jest.spyOn(PlayerService, "validatePlayerId");
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it("authorizes user with valid credentials", async () => {
    spy.mockReturnValue(true);

    const socket = ({
      handshake: {
        auth: { gameCode: "42069", playerId: "abc123" },
      },
    } as unknown) as Socket;

    const next = jest.fn();

    await Auth(socket, next);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("42069", "abc123");
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();
  });

  it("calls next() with an error with invalid credentials", async () => {
    spy.mockReturnValue(false);

    const socket = ({
      handshake: {
        auth: { gameCode: "42069", playerId: "abc123" },
      },
    } as unknown) as Socket;

    const next = jest.fn();

    await Auth(socket, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(new Error("Invalid player credentials"));
  });
});
