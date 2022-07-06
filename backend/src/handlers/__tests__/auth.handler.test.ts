import * as PlayerService from "../../services/player.service";
import Auth from "../auth.handler";
import { Socket } from "socket.io";

describe("auth Handler", () => {
  let spy: jest.SpyInstance;

  const socket = {
    handshake: {
      auth: {
        gameCode: "42069",
        playerId: "abc123",
        token: "ac99723a-66be-4ecc-ba40-14dcaa73a441",
      },
    },
    data: {},
  } as unknown as Socket;

  beforeEach(() => {
    spy = jest.spyOn(PlayerService, "authenticatePlayer");
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it("authorizes user with valid credentials", async () => {
    spy.mockReturnValue(true);

    const next = jest.fn();

    await Auth(socket, next);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      "42069",
      "abc123",
      "ac99723a-66be-4ecc-ba40-14dcaa73a441"
    );
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith();

    expect(socket.data).toMatchObject({
      gameCode: "42069",
      playerId: "abc123",
    });
  });

  it("calls next() with an error if validatePlayerId returns false", async () => {
    spy.mockReturnValue(false);

    const next = jest.fn();

    await Auth(socket, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(new Error("Invalid player credentials"));
  });

  it("calls next() with an error if validatePlayerId throws an error", async () => {
    spy.mockRejectedValue(Error());

    const next = jest.fn();

    await Auth(socket, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(Error("Invalid player credentials"));
  });
});
