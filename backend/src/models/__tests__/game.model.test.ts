import mongoose from "mongoose";
import { GameModel, SetupType } from "../../models";

describe("Game Model", () => {
  let gameCode = 42069;
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

  it("creates a valid game", async () => {
    const game = new GameModel(gameData);
    const savedGame = await game.save();

    expect(savedGame._id).toBeDefined();
    expect(savedGame.gameCode).toBe(gameData.gameCode);
    expect([...savedGame.setups]).toMatchObject(gameData.setups);
    expect([...savedGame.punchlines]).toMatchObject(gameData.punchlines);
    expect(savedGame.settings).toMatchObject({
      roundLimit: 69,
      maxPlayers: 25,
    });
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
      gameCode: "42069",
      punchlines: ["To get to the other side"],
    });

    try {
      await game.save();
      fail("setups are required");
    } catch (e) {
      expect(e).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(e.errors.setups).toBeDefined();
    }
  });

  it("throws a ValidationError if punchlines are not defined", async () => {
    gameData.punchlines = undefined;

    const game = new GameModel(gameData);

    try {
      await game.save();
      fail("punchlines are required");
    } catch (e) {
      expect(e).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(e.errors.punchlines).toBeDefined();
    }
  });

  it("inserts a player with new defaulting to true and score defaulting to zero", async () => {
    gameData.players = [
      { nickname: "Bob" },
      { nickname: "Fred" },
      { nickname: "Steve" },
    ];

    const game = new GameModel(gameData);
    const savedGame = await game.save();

    expect([...savedGame.players]).toMatchObject(Array(3).fill({ new: true }));
    expect([...savedGame.players]).toMatchObject(Array(3).fill({ score: 0 }));
  });

  it("throws a ValidationError if two players with the same nickname are added to the same game", async () => {
    gameData.players = [{ nickname: "Bob" }, { nickname: "Bob" }];

    const game = new GameModel(gameData);

    try {
      await game.save();
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
});
