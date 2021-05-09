import {
  allocatePlayerPunchlines,
  createGame,
  getGame,
  initialiseNextRound,
  setMaxPlayers,
  setRoundLimit,
  shuffleDiscardedPunchlines,
  shuffleDiscardedSetups,
  validateGameCode,
} from "../game.service";
import {
  Game,
  GameModel,
  GameState,
  Player,
  Setup,
  SetupType,
} from "../../models";
import mongoose from "mongoose";
import { PUNCHLINES, SETUPS } from "../../resources";
import * as Util from "../../util";
import { ErrorType, ServiceError } from "../../util";
import { createPlayer, getPlayer } from "../player.service";
import { RoundState } from "../../models/round.model";
import { MaxPlayers } from "../../models/game.model";

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
      new ServiceError(ErrorType.invalidAction, "Could not start round")
    );
  });
});

describe("allocateCards Service", () => {
  let gameCode: string;
  let playerId: Player["id"];
  let punchlineLimit: number;

  beforeEach(async () => {
    gameCode = await createGame();
    playerId = (await createPlayer(gameCode, "bob")).playerId;
    punchlineLimit = 10;
  });

  it("should successfully allocate new cards at the start of the game", async () => {
    const game: Game = await getGame(gameCode);
    const newCards = await allocatePlayerPunchlines(
      game,
      playerId,
      punchlineLimit
    );
    expect(newCards.length).toBe(10);
  });

  it("should successfully only allocate 1 punchline on a normal setup if a player has 9 punchlines", async () => {
    const game: Game = await getGame(gameCode);
    const player: Player = await getPlayer(gameCode, playerId, game);
    const punchlines = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    player.punchlines.push(...punchlines);
    await game.save();
    const newCards = await allocatePlayerPunchlines(
      game,
      playerId,
      punchlineLimit
    );
    expect(newCards.length).toBe(1);
  });

  it("should successfully only allocate 2 punchlines on a play 2 setup if a player has 8 punchlines", async () => {
    const game: Game = await getGame(gameCode);
    const player: Player = await getPlayer(gameCode, playerId, game);
    const punchlines = ["1", "2", "3", "4", "5", "6", "7", "8"];
    player.punchlines.push(...punchlines);
    await game.save();
    const newCards = await allocatePlayerPunchlines(
      game,
      playerId,
      punchlineLimit
    );
    expect(newCards.length).toBe(2);
  });

  it("should successfully only allocate 3 punchlines on a draw 2 pick 3 setup with a normal hand", async () => {
    const game: Game = await getGame(gameCode);
    const player: Player = await getPlayer(gameCode, playerId, game);
    const punchlines = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    player.punchlines.push(...punchlines);
    await game.save();
    const newCards = await allocatePlayerPunchlines(game, playerId, 12);
    expect(newCards.length).toBe(3);
  });

  it("should throw ServiceError if there are no punchlines left in the deck", async () => {
    let game: Game = await getGame(gameCode);
    while (game.punchlines.length > 0) {
      game.punchlines.pop();
    }
    await game.save();
    game = await getGame(gameCode);
    await expect(allocatePlayerPunchlines(game, playerId)).rejects.toThrow(
      new ServiceError(ErrorType.gameError, "No punchlines in deck")
    );
  });

  it("should throw ServiceError if player id is incorrect", async () => {
    const game: Game = await getGame(gameCode);
    await expect(
      allocatePlayerPunchlines(game, "12345", punchlineLimit)
    ).rejects.toThrow(
      new ServiceError(ErrorType.playerId, "Player does not exist")
    );
  });
});

describe("reshuffle setups/punchlines service", () => {
  let gameCode: string;
  let setupNum: number;
  let punchlineNum: number;
  let playerId: Player["id"];

  beforeEach(async () => {
    gameCode = await createGame();
    const game: Game = await getGame(gameCode);
    setupNum = game.setups.length;
    punchlineNum = game.punchlines.length;
    playerId = (await createPlayer(gameCode, "Bob")).playerId;
  });

  describe("setups shuffling", () => {
    it("should shuffle the deck when there are only 5 setups left", async () => {
      const game: Game = await getGame(gameCode);
      const setups = game.setups;
      const discards = setups.splice(5, setups.length);
      game.setups = setups;
      game.discardedSetups.push(...discards);
      await game.save();
      await shuffleDiscardedSetups(game);
      expect(game.setups.length).toBe(setupNum);
      expect(game.discardedSetups.length).toBe(0);
    });

    it("should not shuffle the deck when there are more than 5 setups left", async () => {
      const game: Game = await getGame(gameCode);
      const setups = game.setups;
      const discards = setups.splice(6, setups.length);
      game.setups = setups;
      game.discardedSetups.push(...discards);
      await game.save();
      await shuffleDiscardedSetups(game);
      expect(game.setups.length).toBe(6);
      expect(game.discardedSetups.length).toBe(setupNum - 6);
    });
  });

  describe("punchlines shuffling", () => {
    it(`should shuffle the punchlines when: hand size 8, draw 4, 4 * ${MaxPlayers} punchlines left`, async () => {
      const game: Game = await getGame(gameCode);
      await allocatePlayerPunchlines(game, playerId, 8);

      game.setups.push({
        setup: "why did the chicken cross the road?",
        type: SetupType.drawTwoPickThree,
      });

      const punchlines = game.punchlines;
      const discards = punchlines.splice(4 * MaxPlayers, punchlines.length);

      game.punchlines = punchlines;
      game.discardedPunchlines.push(...discards);
      await game.save();

      await shuffleDiscardedPunchlines(game);
      expect(game.punchlines.length).toBe(punchlineNum - 8);
      expect(game.discardedPunchlines.length).toBe(0);
    });

    it(`should shuffle the punchlines when: hand size 9, draw 3, 3 * ${MaxPlayers} punchlines left`, async () => {
      const game: Game = await getGame(gameCode);
      await allocatePlayerPunchlines(game, playerId, 9);

      game.setups.push({
        setup: "why did the chicken cross the road?",
        type: SetupType.drawTwoPickThree,
      });

      const punchlines = game.punchlines;
      const discards = punchlines.splice(3 * MaxPlayers, punchlines.length);

      game.punchlines = punchlines;
      game.discardedPunchlines.push(...discards);
      await game.save();

      await shuffleDiscardedPunchlines(game);
      expect(game.punchlines.length).toBe(punchlineNum - 9);
      expect(game.discardedPunchlines.length).toBe(0);
    });

    it(`should shuffle the punchlines when: hand size 8, draw 2, 2 * ${MaxPlayers} punchlines left`, async () => {
      const game: Game = await getGame(gameCode);
      await allocatePlayerPunchlines(game, playerId, 8);

      game.setups.push({
        setup: "why did the chicken cross the road?",
        type: SetupType.pickOne,
      });

      const punchlines = game.punchlines;
      const discards = punchlines.splice(2 * MaxPlayers, punchlines.length);

      game.punchlines = punchlines;
      game.discardedPunchlines.push(...discards);
      await game.save();

      await shuffleDiscardedPunchlines(game);
      expect(game.punchlines.length).toBe(punchlineNum - 8);
      expect(game.discardedPunchlines.length).toBe(0);
    });

    it(`should shuffle the punchlines when: hand size 9, draw 1, 1 * ${MaxPlayers} punchlines left`, async () => {
      const game: Game = await getGame(gameCode);
      await allocatePlayerPunchlines(game, playerId, 9);

      game.setups.push({
        setup: "why did the chicken cross the road?",
        type: SetupType.pickTwo,
      });

      const punchlines = game.punchlines;
      const discards = punchlines.splice(MaxPlayers, punchlines.length);

      game.punchlines = punchlines;
      game.discardedPunchlines.push(...discards);
      await game.save();

      await shuffleDiscardedPunchlines(game);
      expect(game.punchlines.length).toBe(punchlineNum - 9);
      expect(game.discardedPunchlines.length).toBe(0);
    });

    it(`should not shuffle punchlines when there are more than 4 * ${MaxPlayers} punchlines`, async () => {
      const game: Game = await getGame(gameCode);
      const punchlines = game.punchlines;
      const discards = punchlines.splice(4 * MaxPlayers + 1, punchlines.length);
      game.punchlines = punchlines;
      game.discardedPunchlines.push(...discards);
      await game.save();
      await shuffleDiscardedPunchlines(game);
      expect(game.punchlines.length).toBe(4 * MaxPlayers + 1);
      expect(game.discardedPunchlines.length).toBe(
        punchlineNum - 4 * MaxPlayers - 1
      );
    });
  });
});
