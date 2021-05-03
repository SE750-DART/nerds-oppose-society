import mongoose from "mongoose";
import { createPlayer, getPlayer, validatePlayerId } from "../player.service";
import { createGame, getGame } from "../game.service";
import { digitShortCode } from "../../util";

beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__, {
    useNewUrlParser: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("createPlayer Service", () => {
  it("creates a player and returns its playerId", async () => {
    const gameCode = await createGame();

    const playerId = await createPlayer(gameCode, "Bob");

    const game = await getGame(gameCode);

    expect(game.players.id(playerId)).not.toBeNull();
  });

  it("throws an error when provided an invalid gameCode", async () => {
    await expect(createPlayer("987654321", "Fred")).rejects.toThrow(
      "Could not get game"
    );
  });
});

describe("getPlayer Service", () => {
  it("returns a player object", async () => {
    const gameCode = await createGame();

    const playerId = await createPlayer(gameCode, "James");

    const player = await getPlayer(gameCode, playerId);

    expect(player._id).toBeDefined();
    expect(player.nickname).toBe("James");
  });

  it("throws an error when provided an invalid gameCode", async () => {
    await expect(getPlayer("987654321", "afgifophweuqhfeu34")).rejects.toThrow(
      "Could not get game"
    );
  });

  it("throws an error when provided an invalid playerId", async () => {
    const gameCode = await createGame();
    console.log(gameCode);
    console.log(digitShortCode(6));

    await expect(
      getPlayer(gameCode, "4qf987hergouhsdfhgoissh")
    ).rejects.toThrow("Could not get player");
  });
});

describe("validatePlayerId Service", () => {
  it("returns true for a valid gameCode and playerId", async () => {
    const gameCode = await createGame();

    const playerId = await createPlayer(gameCode, "Dave");

    const result = await validatePlayerId(gameCode, playerId);

    expect(result).toBe(true);
  });

  it("returns false for an invalid gameCode", async () => {
    const result = await validatePlayerId(
      "9846541654",
      mongoose.Types.ObjectId().toHexString()
    );

    expect(result).toBe(false);
  });

  it("returns false for an invalid playerId", async () => {
    const gameCode = await createGame();

    const result = await validatePlayerId(
      gameCode,
      mongoose.Types.ObjectId().toHexString()
    );

    expect(result).toBe(false);
  });
});
