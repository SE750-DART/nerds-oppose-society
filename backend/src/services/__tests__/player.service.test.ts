import mongoose from "mongoose";
import {
  createPlayer,
  getPlayer,
  incrementScore,
  initialisePlayer,
  removePlayer,
  validatePlayerId,
} from "../player.service";
import { createGame, getGame } from "../game.service";
import * as GameServices from "../game.service";
import { validate as validateUUID } from "uuid";

beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__, {
    useNewUrlParser: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("createPlayer Service", () => {
  let gameSpy: jest.SpyInstance;

  beforeEach(() => {
    gameSpy = jest.spyOn(GameServices, "getGame");
  });

  afterEach(() => {
    gameSpy.mockRestore();
  });

  it("creates a player and returns its playerId", async () => {
    const gameCode = await createGame();

    const { playerId, token } = await createPlayer(gameCode, "Bob");

    const game = await getGame(gameCode);

    const player = game.players.id(playerId);
    expect(player).toBeDefined();
    if (player === null) return;
    expect(token).toBe(player.token);
    expect(validateUUID(token)).toBeTruthy();
  });

  it("throws an error when provided an invalid gameCode", async () => {
    await expect(createPlayer("987654321", "Fred")).rejects.toThrow(
      "Game does not exist"
    );
  });

  it("throws an error when provided a duplicate nickname", async () => {
    const mockSave = jest.fn().mockRejectedValue(new Error("Mongoose error"));
    gameSpy.mockReturnValue({
      players: [],
      save: mockSave,
    });

    await expect(createPlayer("987654321", "Fred")).rejects.toThrow(
      "Duplicate player nickname"
    );
  });
});

describe("removePlayer Service", () => {
  it("removes a player from a game is score is zero", async () => {
    const gameCode = await createGame();
    const { playerId } = await createPlayer(gameCode, "Dave");

    await expect(validatePlayerId(gameCode, playerId)).resolves.toBeTruthy();

    const game = await getGame(gameCode);
    await removePlayer(game, playerId);

    await expect(validatePlayerId(gameCode, playerId)).resolves.toBeFalsy();
  });

  it("throws error when provided an invalid playerId", async () => {
    const gameCode = await createGame();
    const game = await getGame(gameCode);

    await expect(removePlayer(game, "qtgehgoiwuehsdgs68976")).rejects.toThrow(
      "Player does not exist"
    );
  });

  it("does not remove a player from the game if score is greater than zero", async () => {
    const gameCode = await createGame();
    const { playerId } = await createPlayer(gameCode, "Dave");

    let game = await getGame(gameCode);
    await incrementScore(game, playerId);

    await expect(validatePlayerId(gameCode, playerId)).resolves.toBeTruthy();

    game = await getGame(gameCode);
    await removePlayer(game, playerId);

    await expect(validatePlayerId(gameCode, playerId)).resolves.toBeTruthy();
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
    ).rejects.toThrow("Player does not exist");
  });

  it("returns a Player object retrieving Game from gameCode", async () => {
    const gameCode = await createGame();

    const { playerId } = await createPlayer(gameCode, "James");

    spy = jest.spyOn(GameServices, "getGame");

    const player = await getPlayer(gameCode, playerId);

    expect(player._id).toBeDefined();
    expect(player.nickname).toBe("James");
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("returns a Player object using provided Game", async () => {
    const gameCode = await createGame();

    const { playerId } = await createPlayer(gameCode, "James");

    const game = await getGame(gameCode);

    spy = jest.spyOn(GameServices, "getGame");

    const player = await getPlayer(gameCode, playerId, game);

    expect(player._id).toBeDefined();
    expect(player.nickname).toBe("James");
    expect(spy).toHaveBeenCalledTimes(0);
  });

  it("throws an error when provided an invalid gameCode", async () => {
    await expect(getPlayer("987654321", "afgifophweuqhfeu34")).rejects.toThrow(
      "Game does not exist"
    );
  });
});

describe("validatePlayerId Service", () => {
  it("returns true for a valid gameCode and playerId", async () => {
    const gameCode = await createGame();

    const { playerId } = await createPlayer(gameCode, "Dave");

    const result = await validatePlayerId(gameCode, playerId);

    expect(result).toBeTruthy();
  });

  it("returns false for an invalid gameCode", async () => {
    const result = await validatePlayerId(
      "9846541654",
      mongoose.Types.ObjectId().toHexString()
    );

    expect(result).toBeFalsy();
  });

  it("returns false for an invalid playerId", async () => {
    const gameCode = await createGame();

    const result = await validatePlayerId(
      gameCode,
      mongoose.Types.ObjectId().toHexString()
    );

    expect(result).toBeFalsy();
  });
});

describe("initialisePlayer service", () => {
  it("sets player.new to false", async () => {
    const gameCode = await createGame();
    const { playerId } = await createPlayer(gameCode, "Jimbo");

    const game = await getGame(gameCode);
    let player = await getPlayer(gameCode, playerId);
    expect(player.new).toBeTruthy();

    await initialisePlayer(game, playerId);

    player = await getPlayer(gameCode, playerId);
    expect(player.new).toBeFalsy();
  });

  it("throws error when provided an invalid playerId", async () => {
    const gameCode = await createGame();
    const game = await getGame(gameCode);

    await expect(
      initialisePlayer(game, "qtgehgoiwuehsdgs68976")
    ).rejects.toThrow("Player does not exist");
  });
});

describe("incrementScore service", () => {
  it("increments a players score", async () => {
    const gameCode = await createGame();
    const { playerId } = await createPlayer(gameCode, "Jimbo");

    let player = await getPlayer(gameCode, playerId);
    expect(player.score).toBe(0);

    const game = await getGame(gameCode);
    await incrementScore(game, playerId);

    player = await getPlayer(gameCode, playerId);
    expect(player.score).toBe(1);
  });

  it("throws error when provided an invalid playerId", async () => {
    const gameCode = await createGame();
    const game = await getGame(gameCode);

    await expect(incrementScore(game, "qtgehgoiwuehsdgs68976")).rejects.toThrow(
      "Player does not exist"
    );
  });
});
