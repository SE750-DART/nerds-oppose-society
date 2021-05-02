import mongoose from "mongoose";
import Game from "../game.model";
import { SetupType } from "../setup.model";

describe("Create game", () => {
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("Valid", async () => {
    const game = new Game({
      gameCode: "42069",
      setups: [
        {
          setup: "Why did the chicken cross the road?",
          type: SetupType.pickOne,
        },
      ],
      punchlines: ["To get to the other side"],
    });

    await expect(game.validate()).resolves.toBe(undefined);
  });

  it("Invalid: Missing gameCode", async () => {
    const game = new Game({
      setups: [
        {
          setup: "Why did the chicken cross the road?",
          type: SetupType.pickOne,
        },
      ],
      punchlines: ["To get to the other side"],
    });

    await expect(game.validate()).rejects.toThrow();
  });

  it("Invalid: Missing setups", async () => {
    const game = new Game({
      gameCode: "42069",
      punchlines: ["To get to the other side"],
    });

    await expect(game.validate()).rejects.toThrow();
  });

  it("Invalid: Missing punchlines", async () => {
    const game = new Game({
      gameCode: "42069",
      setups: [
        {
          setup: "Why did the chicken cross the road?",
          type: SetupType.pickOne,
        },
      ],
    });

    await expect(game.validate()).rejects.toThrow();
  });
});
