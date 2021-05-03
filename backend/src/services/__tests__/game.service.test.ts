import { createGame, getGame, validateGameCode } from "../game.service";
import { Game, GameModel, Setup } from "../../models";
import mongoose from "mongoose";
import { PUNCHLINES, SETUPS } from "../../resources";
import * as Util from "../../util";

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

  it("creates a game", async () => {
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

  it("throws a mongoose error when the game cannot be saved", async () => {
    modelSpy.mockRejectedValue(new mongoose.Error("Mongoose error"));

    await expect(createGame()).rejects.toThrow("Mongoose error");
  });

  it("throws an error when a gameCode is not unique", async () => {
    codeSpy.mockReturnValue(42069420);

    await expect(createGame()).resolves.toBeDefined();

    await expect(createGame()).rejects.toThrow();
  });
});

describe("getGame Service", () => {
  it("throws an error when provided an invalid gameCode", async () => {
    await expect(getGame("123456")).rejects.toThrow("Could not get game");
  });

  it("returns a game object", async () => {
    const gameCode = await createGame();

    const game = await getGame(gameCode);

    expect(game._id).toBeDefined();
  });
});

describe("validateGameCode Service", () => {
  it("returns false for an invalid gameCode", async () => {
    const result = await validateGameCode("69420");

    expect(result).toBe(false);
  });

  it("returns true for a valid gameCode", async () => {
    const gameCode = await createGame();

    const result = await validateGameCode(gameCode);

    expect(result).toBe(true);
  });
});
