import {
  createGame,
  getGame,
  initialiseNextRound,
  setMaxPlayers,
  setRoundLimit,
  validateGameCode,
} from "../game.service";
import { Game, GameModel, GameState, Setup } from "../../models";
import mongoose from "mongoose";
import { PUNCHLINES, SETUPS } from "../../resources";
import * as Util from "../../util";
import { createPlayer } from "../player.service";
import { RoundState } from "../../models/round.model";
import { ErrorType, ServiceError } from "../../util";

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
    await expect(getGame("123456")).rejects.toThrow("Game does not exist");
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

    expect(result).toBeFalsy();
  });

  it("returns true for a valid gameCode", async () => {
    const gameCode = await createGame();

    const result = await validateGameCode(gameCode);

    expect(result).toBeTruthy();
  });
});

describe("setRoundLimit Service", () => {
  it("sets roundLimit to 100", async () => {
    const gameCode = await createGame();
    let game = await getGame(gameCode);
    expect(game.settings.roundLimit).not.toBe(100);

    await setRoundLimit(game, 100);

    game = await getGame(gameCode);
    expect(game.settings.roundLimit).toBe(100);
  });
});

describe("setMaxPlayers Service", () => {
  it("sets maxPlayers to 50", async () => {
    const gameCode = await createGame();
    let game = await getGame(gameCode);
    expect(game.settings.maxPlayers).not.toBe(50);

    await setMaxPlayers(game, 50);

    game = await getGame(gameCode);
    expect(game.settings.maxPlayers).toBe(50);
  });
});

describe("nextRound Service", () => {
  let gameCode: string;

  let playerId: string;

  beforeEach(async () => {
    gameCode = await createGame();

    playerId = (await createPlayer(gameCode, "Bob")).playerId;
  });

  it("initialises the next round", async () => {
    let game = await getGame(gameCode);
    const setup = game.setups.pop();
    if (setup === undefined) return fail();

    await expect(
      initialiseNextRound(gameCode, playerId)
    ).resolves.toMatchObject({
      roundNumber: 1,
      setup: {
        setup: setup.setup,
        type: setup.type,
      },
    });

    game = await getGame(gameCode);
    expect(game.rounds[0].setup).toMatchObject({
      setup: setup.setup,
      type: setup.type,
    });
    expect(game.rounds[0].host.toString()).toBe(playerId);
    expect(game.rounds[0].state).toBe(RoundState.before);
    expect(game.state).toBe(GameState.active);
  });

  it("throws error if game does not exist", async () => {
    await expect(initialiseNextRound("987654321", playerId)).rejects.toThrow(
      new ServiceError(ErrorType.gameCode, "Game does not exist")
    );
  });
  it("throws error if game has no setups", async () => {
    const game = await getGame(gameCode);

    while (game.setups.length > 0) {
      game.setups.pop();
    }
    await game.save();

    await expect(initialiseNextRound(gameCode, playerId)).rejects.toThrow(
      ServiceError
    );
  });
});
