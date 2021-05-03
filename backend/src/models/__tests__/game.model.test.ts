import mongoose from "mongoose";
import { GameModel, SetupType } from "../../models";

describe("Game Model", () => {
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("creates a valid game", async () => {
    const gameData = {
      gameCode: "42069",
      setups: [
        {
          setup: "Why did the chicken cross the road?",
          type: SetupType.pickOne,
        },
      ],
      punchlines: ["To get to the other side"],
    };

    const game = new GameModel(gameData);
    const savedGame = await game.save();

    expect(savedGame._id).toBeDefined();
    expect(savedGame.gameCode).toBe(gameData.gameCode);
    expect([...savedGame.setups]).toMatchObject(gameData.setups);
    expect([...savedGame.punchlines]).toMatchObject(gameData.punchlines);
  });

  it("throws a ValidationError if gameCode is not defined", async () => {
    const game = new GameModel({
      setups: [
        {
          setup: "Why did the chicken cross the road?",
          type: SetupType.pickOne,
        },
      ],
      punchlines: ["To get to the other side"],
    });

    try {
      await game.save();
      fail("gameCode is required");
    } catch (e) {
      expect(e).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(e.errors.gameCode).toBeDefined();
    }
  });

  it("throws a ValidationError if setups are not defined", async () => {
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
    const game = new GameModel({
      gameCode: "42069",
      setups: [
        {
          setup: "Why did the chicken cross the road?",
          type: SetupType.pickOne,
        },
      ],
    });

    try {
      await game.save();
      fail("punchlines are required");
    } catch (e) {
      expect(e).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(e.errors.punchlines).toBeDefined();
    }
  });
});
