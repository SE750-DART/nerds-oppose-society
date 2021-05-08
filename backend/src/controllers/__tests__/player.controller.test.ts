import * as PlayerService from "../../services/player.service";
import { createPlayer } from "../player.controller";
import { ErrorType, ServiceError } from "../../util";

/*eslint-disable @typescript-eslint/no-explicit-any*/
describe("Player controller", () => {
  let createSpy: jest.SpyInstance;

  beforeEach(() => {
    createSpy = jest.spyOn(PlayerService, "createPlayer");
  });

  afterEach(() => {
    createSpy.mockRestore();
  });

  it("Responds with a 201 on successful player creation", async () => {
    const req: any = {
      query: {
        gameCode: "6942069",
        nickname: "DonkeyKong",
      },
    };

    const send = jest.fn();

    const status = jest.fn(() => {
      return {
        send,
      };
    });

    const res: any = {
      status,
    };

    const next: any = jest.fn();

    createSpy.mockReturnValue({
      playerId: "69eb420cg69",
      token: "62410075-a9f8-4557-acd5-41c6b8bb039e",
    });

    await createPlayer(req, res, next);

    expect(createSpy).toHaveBeenCalledTimes(1);

    expect(status).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledWith(201);

    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith({
      playerId: "69eb420cg69",
      token: "62410075-a9f8-4557-acd5-41c6b8bb039e",
    });
  });

  it("Responds with a 400 if the game code is invalid", async () => {
    const req: any = {
      query: {
        gameCode: "6942069",
        nickname: "DonkeyKong",
      },
    };

    const send = jest.fn();

    const status = jest.fn(() => {
      return {
        send,
      };
    });

    const res: any = {
      status,
    };

    const next: any = jest.fn();

    createSpy.mockImplementation(() => {
      throw new ServiceError(ErrorType.gameCode, "Could not get game");
    });

    await createPlayer(req, res, next);

    expect(createSpy).toHaveBeenCalledTimes(1);

    expect(status).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledWith(400);

    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith("Could not get game");
  });

  it("Responds with a 400 if the nickname is duplicated", async () => {
    const req: any = {
      query: {
        gameCode: "6942069",
        nickname: "DonkeyKong",
      },
    };

    const send = jest.fn();

    const status = jest.fn(() => {
      return {
        send,
      };
    });

    const res: any = {
      status,
    };

    const next: any = jest.fn();

    createSpy.mockImplementation(() => {
      throw new ServiceError(ErrorType.playerId, "Nickname taken");
    });

    await createPlayer(req, res, next);

    expect(createSpy).toHaveBeenCalledTimes(1);

    expect(status).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledWith(400);

    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith("Nickname taken");
  });

  it("should respond with a 400 if the game code is not a string", async () => {
    const req: any = {
      query: {
        gameCode: 6942069,
        nickname: "DonkeyKong",
      },
    };

    const send = jest.fn();

    const status = jest.fn(() => {
      return {
        send,
      };
    });

    const res: any = {
      status,
    };

    const next: any = jest.fn();

    await createPlayer(req, res, next);

    expect(status).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledWith(400);

    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith("Code not of type string");
  });

  it("should respond with a 400 if the nickname is not a string", async () => {
    const req: any = {
      query: {
        gameCode: "6942069",
        nickname: 100,
      },
    };

    const send = jest.fn();

    const status = jest.fn(() => {
      return {
        send,
      };
    });

    const res: any = {
      status,
    };

    const next: any = jest.fn();

    await createPlayer(req, res, next);

    expect(status).toHaveBeenCalledTimes(1);
    expect(status).toHaveBeenCalledWith(400);

    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith("Nickname not of type string");
  });

  it("throws a server error", async () => {
    const req: any = {
      query: {
        gameCode: "6942069",
        nickname: "DonkeyKong",
      },
    };

    const res: any = {};

    const next: any = jest.fn();

    createSpy.mockRejectedValue(new Error("Server error"));

    await createPlayer(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(new Error("Server error"));
  });
});
