import { createGame, validateGame } from "../game.controller";
import * as GameService from "../../services/game.service";

/*eslint-disable @typescript-eslint/no-explicit-any*/
describe("Game controller", () => {
  describe("Create Game", () => {
    let createSpy: jest.SpyInstance;

    beforeEach(() => {
      createSpy = jest.spyOn(GameService, "createGame");
    });

    afterEach(() => {
      createSpy.mockRestore();
    });

    it("should respond with a 201 on endpoint hit", async () => {
      createSpy.mockReturnValue("42069");

      const req: any = {};

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

      createSpy.mockReturnValue("6942069");

      await createGame(req, res, next);

      expect(createSpy).toHaveBeenCalledTimes(1);

      expect(status).toHaveBeenCalledTimes(1);
      expect(status).toHaveBeenCalledWith(201);

      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith("6942069");
    });

    it("throws server error", async () => {
      createSpy.mockReturnValue("42069");

      const req: any = {};

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

      createSpy.mockRejectedValue(new Error("Server error"));

      await createGame(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(new Error("Server error"));
    });
  });

  describe("Validate Game", () => {
    let validateSpy: jest.SpyInstance;

    beforeEach(() => {
      validateSpy = jest.spyOn(GameService, "validateGameCode");
    });

    afterEach(() => {
      validateSpy.mockRestore();
    });

    it("should respond with a 204 if the game code is valid", async () => {
      const req: any = {
        query: {
          gameCode: "6942069",
        },
      };

      const res: any = {
        sendStatus: jest.fn(),
      };

      const next: any = jest.fn();

      validateSpy.mockReturnValue(true);

      await validateGame(req, res, next);

      expect(validateSpy).toHaveBeenCalledTimes(1);
      expect(validateSpy).toHaveBeenCalledWith("6942069");

      expect(res.sendStatus).toHaveBeenCalledTimes(1);
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    it("should respond with a 404 if the game code is invalid", async () => {
      const req: any = {
        query: {
          gameCode: "6942069",
        },
      };

      const res: any = {
        sendStatus: jest.fn(),
      };

      const next: any = jest.fn();

      validateSpy.mockReturnValue(false);

      await validateGame(req, res, next);

      expect(validateSpy).toHaveBeenCalledTimes(1);
      expect(validateSpy).toHaveBeenCalledWith("6942069");

      expect(res.sendStatus).toHaveBeenCalledTimes(1);
      expect(res.sendStatus).toHaveBeenCalledWith(404);
    });

    it("should respond with a 400 if the game code is not a string", async () => {
      const req: any = {
        query: {
          gameCode: 6942069,
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

      await validateGame(req, res, next);

      expect(status).toHaveBeenCalledTimes(1);
      expect(status).toHaveBeenCalledWith(400);

      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith("Code not of type string");
    });

    it("throws a server error", async () => {
      const req: any = {
        query: {
          gameCode: "6942069",
        },
      };

      const res: any = {};

      const next: any = jest.fn();

      validateSpy.mockRejectedValue(new Error("Server error"));

      await validateGame(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(new Error("Server error"));
    });
  });
});
