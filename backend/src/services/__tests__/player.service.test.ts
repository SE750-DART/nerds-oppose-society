import mongoose from "mongoose";
import { createPlayer, getPlayer } from "../player.service";
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

describe("getPlayer Service", () => {
  it("Get player", async () => {
    const gameCode = await createGame();

    const playerId = await createPlayer(gameCode, "James");

    const player = await getPlayer(gameCode, playerId);

    expect(player._id).toBeDefined();
    expect(player.nickname).toBe("James");
  });

  it("Invalid game code", async () => {
    await expect(getPlayer("987654321", "afgifophweuqhfeu34")).rejects.toThrow(
      "Could not get game"
    );
  });

  it("Invalid player id", async () => {
    const gameCode = await createGame();

    await expect(
      getPlayer(gameCode, "4qf987hergouhsdfhgoissh")
    ).rejects.toThrow("Could not get player");
  });
});
