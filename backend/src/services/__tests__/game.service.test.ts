import { createGame, validateGameCode } from "../game.service";
import { Game, GameModel, Setup } from "../../models";
import mongoose from "mongoose";
import { PUNCHLINES, SETUPS } from "../../resources";
import { create } from "domain";

describe("createGame Service", () => {
  let spy: jest.SpyInstance;

  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(() => {
    spy = jest.spyOn(GameModel.prototype, "save");
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it("Creates game", async () => {
    const gameCode = await createGame();

    expect(spy).toHaveBeenCalledTimes(1);
    const savedGame: Game = spy.mock.instances[0];
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

  it("Throws error", async () => {
    spy.mockRejectedValue(new mongoose.Error("Throws error"));

    await expect(createGame()).rejects.toThrow("Throws error");
  });
});

describe("validateGameCode Service", () => {
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("Invalid code", async () => {
    const result = await validateGameCode("42069");

    expect(result).toBe(false);
  });

  it("Valid code", async () => {
    const gameCode = await createGame();

    const result = await validateGameCode(gameCode);

    expect(result).toBe(true);
  });
});
