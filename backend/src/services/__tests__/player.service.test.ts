import mongoose from "mongoose";
import { createPlayer } from "../player.service";
import { createGame, getGame } from "../game.service";

beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__, {
    useNewUrlParser: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("createPlayer Service", () => {
  it("Create player", async () => {
    const gameCode = await createGame();

    const playerId = await createPlayer(gameCode, "Bob");

    const game = await getGame(gameCode);

    expect(game.players.id(playerId)).not.toBeNull();
  });

  it("Invalid game code", async () => {
    await expect(createPlayer("987654321", "Fred")).rejects.toThrow(
      "Could not get game"
    );
  });
});
