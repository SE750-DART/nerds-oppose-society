import { createGame, getGame, validateGameCode } from "../game.service";
import { Game, GameModel, Setup } from "../../models";
import mongoose from "mongoose";
import { PUNCHLINES, SETUPS } from "../../resources";
import * as Util from "../../util";
import { create } from "domain";

beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__, {
    useNewUrlParser: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("createGame Service", () => {
  let modelSpy: jest.SpyInstance;
  let codeSpy: jest.SpyInstance;

  beforeEach(() => {
    modelSpy = jest.spyOn(GameModel.prototype, "save");
    codeSpy = jest.spyOn(Util, "digitShortCode");
  });

  afterEach(() => {
    modelSpy.mockRestore();
    codeSpy.mockRestore();
  });

  it("Creates game", async () => {
    const gameCode = await createGame();

    expect(modelSpy).toHaveBeenCalledTimes(1);
    const savedGame: Game = modelSpy.mock.instances[0];
    expect(savedGame.gameCode).toBe(gameCode);

    const setupSort = (a: Setup, b: Setup): number =>
      a.setup.localeCompare(b.setup);
    expect(savedGame.punchlines).toHaveLength(PUNCHLINES.length);
    expect([...savedGame.punchlines]).toEqual(
      expect.arrayContaining(PUNCHLINES)
    );
    expect([...savedGame.punchlines]).not.toEqual(PUNCHLINES);
    expect(savedGame.setups).toHaveLength(SETUPS.length);
    expect([...savedGame.setups].sort(setupSort)).toMatchObject(
      SETUPS.sort(setupSort)
    );
    expect([...savedGame.setups]).not.toEqual(SETUPS);
  });

  it("Mongoose error", async () => {
    modelSpy.mockRejectedValue(new mongoose.Error("Mongoose error"));

    await expect(createGame()).rejects.toThrow("Mongoose error");
  });

  it("Duplicate gameCode", async () => {
    codeSpy.mockReturnValue(42069420);

    await expect(createGame()).resolves.toBeDefined();

    await expect(createGame()).rejects.toThrow();
  });
});

describe("getGame Service", () => {
  it("Game does not exist", async () => {
    await expect(getGame("123456")).rejects.toThrow("Could not get game");
  });

  it("Game exists", async () => {
    const gameCode = await createGame();

    const game = await getGame(gameCode);

    expect(game._id).toBeDefined();
  });
});

describe("validateGameCode Service", () => {
  it("Invalid code", async () => {
    const result = await validateGameCode("69420");

    expect(result).toBe(false);
  });

  it("Valid code", async () => {
    const gameCode = await createGame();

    const result = await validateGameCode(gameCode);

    expect(result).toBe(true);
  });
});
