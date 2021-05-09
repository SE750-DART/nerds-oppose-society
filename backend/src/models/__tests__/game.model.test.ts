import mongoose from "mongoose";
import { GameModel, GameState, SetupType } from "../../models";
import { RoundState } from "../round.model";
import { validate as validateUUID } from "uuid";
import { MaxPlayers } from "../settings.model";

describe("Game Model", () => {
  let gameCode = 420691;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let gameData: any;

  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(() => {
    gameData = {
      gameCode: String(gameCode++),
      setups: [
        {
          setup: "Why did the chicken cross the road?",
          type: SetupType.pickOne,
        },
      ],
      punchlines: ["To get to the other side"],
    };
  });

  it("creates a valid game with initialised and default fields", async () => {
    const game = new GameModel(gameData);
    const savedGame = await game.save();

    expect(savedGame._id).toBeDefined();
    expect(savedGame.gameCode).toBe(gameData.gameCode);
    expect(savedGame.settings).toMatchObject({
      roundLimit: 69,
      maxPlayers: 25,
    });
    expect([...savedGame.setups]).toMatchObject(gameData.setups);
    expect(savedGame.discardedSetups).toHaveProperty("length", 0);
    expect([...savedGame.punchlines]).toMatchObject(gameData.punchlines);
    expect(savedGame.discardedPunchlines).toHaveProperty("length", 0);
    expect(savedGame.players).toHaveProperty("length", 0);
    expect(savedGame.state).toBe(GameState.lobby);
    expect(savedGame.rounds).toHaveProperty("length", 0);
  });

  it("initialises setup type to pick one by default", async () => {
    gameData.setups = [
      {
        setup: "Why did the chicken cross the road?",
      },
    ];
    const game = new GameModel(gameData);
    const savedGame = await game.save();

    expect([...savedGame.setups]).toMatchObject([
      { setup: "Why did the chicken cross the road?", type: SetupType.pickOne },
    ]);
  });

  it("throws a ValidationError if gameCode is not defined", async () => {
    gameData.gameCode = undefined;

    const game = new GameModel(gameData);

    try {
      await game.save();
      fail("gameCode is required");
    } catch (e) {
      expect(e).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(e.errors.gameCode).toBeDefined();
    }
  });

  it("throws a ValidationError if setups are not defined", async () => {
    gameData.setups = undefined;

    const game = new GameModel({
      gameCode: "42069042",
      punchlines: ["To get to the other side"],
    });

    await game.save();
    expect(game.setups).toBeDefined();
  });

  it("throws a ValidationError if setup string is not defined", async () => {
    gameData.setups = undefined;

    const game = new GameModel({
      gameCode: "420693",
      setups: [
        {
          type: SetupType.pickOne,
        },
      ],
      punchlines: ["To get to the other side"],
    });

    try {
      await game.save();
      fail("setups are required");
    } catch (e) {
      expect(e).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(e.errors["setups.0.setup"]).toBeDefined();
    }
  });

  it("throws a ValidationError if punchlines are not defined", async () => {
    gameData.punchlines = undefined;

    const game = new GameModel(gameData);

    await game.save();
    expect(game.punchlines).toBeDefined();
  });

  it("inserts a player with new defaulting to true, score defaulting to zero and assigning a random UUID", async () => {
    gameData.players = [
      { nickname: "Bob" },
      { nickname: "Fred" },
      { nickname: "Steve" },
    ];

    const game = new GameModel(gameData);
    const savedGame = await game.save();

    expect(savedGame.players).toHaveProperty("length", 3);
    expect(savedGame.players[0].punchlines).toHaveProperty("length", 0);
    expect(savedGame.players[1].punchlines).toHaveProperty("length", 0);
    expect(savedGame.players[2].punchlines).toHaveProperty("length", 0);
    expect([...savedGame.players]).toMatchObject(Array(3).fill({ new: true }));
    expect([...savedGame.players]).toMatchObject(Array(3).fill({ score: 0 }));
    expect(validateUUID(savedGame.players[0].token)).toBeTruthy();
    expect(validateUUID(savedGame.players[1].token)).toBeTruthy();
    expect(validateUUID(savedGame.players[2].token)).toBeTruthy();
  });

  it("throws a ValidationError if a player is added without a nickname", async () => {
    gameData.players = [
      { punchlines: ["To get to the other side"] },
      { punchlines: ["To go to KFC"] },
    ];

    const game = new GameModel(gameData);

    try {
      await game.save();
      fail("nicknames are required");
    } catch (e) {
      expect(e).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(e.errors.players).toBeDefined();
    }
  });

  it("throws a ValidationError if two players with the same nickname are added to the same game", async () => {
    gameData.players = [{ nickname: "Bob" }, { nickname: "Bob" }];

    const game = new GameModel(gameData);

    try {
      await game.save();
      fail("unique nicknames are required");
    } catch (e) {
      expect(e).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(e.errors.players).toBeDefined();
    }
  });

  it("allows two players with the same nickname to be added to separate games", async () => {
    gameData.players = [{ nickname: "Bob" }];
    const gameCodeOne = gameData.gameCode;

    const gameOne = new GameModel(gameData);
    await gameOne.save();

    const gameCodeTwo = String(gameCode++);
    gameData.gameCode = gameCodeTwo;

    const gameTwo = new GameModel(gameData);
    await gameTwo.save();

    expect(gameCodeOne === gameCodeTwo).toBe(false);
    expect([...gameOne.players]).toMatchObject([{ nickname: "Bob" }]);
    expect([...gameTwo.players]).toMatchObject([{ nickname: "Bob" }]);
  });

  it("inserts a round with state defaulting to BEFORE and initialised punchlinesByPlayer map", async () => {
    gameData.rounds = [
      {
        setup: {
          setup: "Why did the chicken cross the road?",
          type: SetupType.pickOne,
        },
        host: "6094a2e1d7909d84ae35819c",
      },
    ];

    const game = new GameModel(gameData);
    const savedGame = await game.save();

    expect(savedGame.rounds).toHaveProperty("length", 1);
    expect(savedGame.rounds[0]).toHaveProperty("state", RoundState.before);
    expect(savedGame.rounds[0]).toMatchObject({
      state: RoundState.before,
    });
    expect(savedGame.rounds[0].punchlinesByPlayer).toHaveProperty("size", 0);
  });

  it("throws a ValidationError for a round inserted without a setup", async () => {
    gameData.rounds = [
      {
        host: "abc123",
      },
    ];

    const game = new GameModel(gameData);

    try {
      await game.save();
    } catch (e) {
      expect(e).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(e.errors["rounds.0.setup"]).toBeDefined();
    }
  });

  it("throws a ValidationError for a round inserted without a host", async () => {
    gameData.rounds = [
      {
        setup: {
          setup: "Why did the chicken cross the road?",
          type: SetupType.pickOne,
        },
      },
    ];

    const game = new GameModel(gameData);

    try {
      await game.save();
    } catch (e) {
      expect(e).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(e.errors["rounds.0.host"]).toBeDefined();
    }
  });

  it("should throw a validation error if the game is at max capacity and another player tries to join", async () => {
    gameData.players = [];
    for (let i = 0; i < MaxPlayers; i++) {
      gameData.players.push({ nickname: `Bob${i}` });
    }

    const game = new GameModel(gameData);

    try {
      game.players.push({ nickname: `Bob${MaxPlayers}` });
      await game.save();
      fail(`should not allow a ${MaxPlayers + 1}th player`);
    } catch (e) {
      expect(e).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(e.errors.players).toBeDefined();
    }
  });
});
