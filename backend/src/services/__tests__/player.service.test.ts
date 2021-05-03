import mongoose from "mongoose";
import {
  createPlayer,
  getPlayer,
  initialisePlayer,
  removePlayer,
  validatePlayerId,
} from "../player.service";
import { createGame, getGame } from "../game.service";
import * as GameServices from "../game.service";

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

describe("removePlayer Service", () => {
  it("throws an error when provided an invalid gameCode", async () => {
    await expect(
      removePlayer("12430985735", "112acfs86a9ds8f6")
    ).rejects.toThrow("Could not get game");
  });

  it("removes a player from a game", async () => {
    const gameCode = await createGame();
    const playerId = await createPlayer(gameCode, "Dave");

    await expect(validatePlayerId(gameCode, playerId)).resolves.toBeTruthy();

    await removePlayer(gameCode, playerId);

    await expect(validatePlayerId(gameCode, playerId)).resolves.toBeFalsy();
  });
});

describe("getPlayer Service", () => {
  let spy: jest.SpyInstance;

  afterEach(() => {
    if (spy) spy.mockRestore();
  });

  it("throws an error when provided an invalid playerId", async () => {
    const gameCode = await createGame();

    await expect(
      getPlayer(gameCode, "4qf987hergouhsdfhgoissh")
    ).rejects.toThrow("Could not get player");
  });

  it("returns a Player object retrieving Game from gameCode", async () => {
    const gameCode = await createGame();

    const playerId = await createPlayer(gameCode, "James");

    spy = jest.spyOn(GameServices, "getGame");

    const player = await getPlayer(gameCode, playerId);

    expect(player._id).toBeDefined();
    expect(player.nickname).toBe("James");
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("returns a Player object using provided Game", async () => {
    const gameCode = await createGame();

    const playerId = await createPlayer(gameCode, "James");

    const game = await getGame(gameCode);

    spy = jest.spyOn(GameServices, "getGame");

    const player = await getPlayer(gameCode, playerId, game);

    expect(player._id).toBeDefined();
    expect(player.nickname).toBe("James");
    expect(spy).toHaveBeenCalledTimes(0);
  });

  it("throws an error when provided an invalid gameCode", async () => {
    await expect(getPlayer("987654321", "afgifophweuqhfeu34")).rejects.toThrow(
      "Could not get game"
    );
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

describe("initialisePlayer service", () => {
  it("sets player.new to false", async () => {
    const gameCode = await createGame();

    const playerId = await createPlayer(gameCode, "Jimbo");

    const game = await getGame(gameCode);
    let player = await getPlayer(gameCode, playerId);
    expect(player.new).toBe(true);

    await initialisePlayer(game, playerId);

    player = await getPlayer(gameCode, playerId);
    expect(player.new).toBe(false);
  });

  it("throws error when provided an invalid playerId", async () => {
    const gameCode = await createGame();
    const game = await getGame(gameCode);

    await expect(
      initialisePlayer(game, "qtgehgoiwuehsdgs68976")
    ).rejects.toThrow("Player does not exist");
  });
});
