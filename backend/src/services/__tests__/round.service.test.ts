import { createGame, getGame } from "../game.service";
import { Game, SetupType } from "../../models";
import { beginRound } from "../round.service";
import mongoose from "mongoose";
import { RoundState } from "../../models/round.model";

beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__, {
    useNewUrlParser: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("beginRound Service", () => {
  let game: Game;

  beforeEach(async () => {
    const gameCode = await createGame();
    game = await getGame(gameCode);

    game.rounds.push({
      setup: {
        setup: "Why did the chicken cross the road?",
        type: SetupType.pickOne,
      },
      host: "abc123",
    });
  });

  it("begins round", async () => {
    await game.save();

    await beginRound(game.gameCode, "abc123");

    game = await getGame(game.gameCode);
    expect(game.rounds[0].state).toBe(RoundState.playersChoose);
  });

  it("throws error if game contains no rounds", async () => {
    game.rounds.pop();
    await game.save();

    await expect(beginRound(game.gameCode, "abc123")).rejects.toThrow(
      "Cannot begin round"
    );
  });

  it("throws error if round state is not BEFORE", async () => {
    game.rounds[0].state = RoundState.playersChoose;
    await game.save();

    await expect(beginRound(game.gameCode, "abc123")).rejects.toThrow(
      "Cannot begin round"
    );
  });

  it("throws error if playerId is not round host", async () => {
    game.rounds[0].host = "abcd1234";
    await game.save();

    await expect(beginRound(game.gameCode, "abc123")).rejects.toThrow(
      "Cannot begin round"
    );
  });
});
