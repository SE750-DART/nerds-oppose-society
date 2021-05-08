import { createGame, getGame } from "../game.service";
import { Game, Player, SetupType } from "../../models";
import {
  enterPlayersChooseState,
  enterHostChoosesState,
  playerChoosePunchlines,
  hostChoosesWinner,
} from "../round.service";
import mongoose from "mongoose";
import { RoundState } from "../../models/round.model";
import { createPlayer } from "../player.service";

beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__, {
    useNewUrlParser: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("enterPlayersChooseState Service", () => {
  let game: Game;

  beforeEach(async () => {
    const gameCode = await createGame();
    game = await getGame(gameCode);

    game.rounds.push({
      setup: {
        setup: "Why did the chicken cross the road?",
        type: SetupType.pickOne,
      },
      host: "6094a2e1d7909d84ae35819c",
    });
  });

  it("enters playersChoose state", async () => {
    await game.save();

    await enterPlayersChooseState(game.gameCode, "6094a2e1d7909d84ae35819c");

    game = await getGame(game.gameCode);
    expect(game.rounds[0].state).toBe(RoundState.playersChoose);
  });

  it("throws error if game contains no rounds", async () => {
    game.rounds.pop();
    await game.save();

    await expect(
      enterPlayersChooseState(game.gameCode, "6094a2e1d7909d84ae35819c")
    ).rejects.toThrow("Cannot enter players choose state");
  });

  it("throws error if round state is not BEFORE", async () => {
    game.rounds[0].state = RoundState.playersChoose;
    await game.save();

    await expect(
      enterPlayersChooseState(game.gameCode, "6094a2e1d7909d84ae35819c")
    ).rejects.toThrow("Cannot enter players choose state");
  });

  it("throws error if player is not the round host", async () => {
    game.rounds[0].host = "6094a31d25335f84c32a12ff";
    await game.save();

    await expect(
      enterPlayersChooseState(game.gameCode, "6094a2e1d7909d84ae35819c")
    ).rejects.toThrow("Cannot enter players choose state");
  });
});

describe("playersChoosePunchline Service", () => {
  let gameCode: string;
  let game: Game;
  let playerId: Player["id"];

  beforeEach(async () => {
    gameCode = await createGame();
    const response = await createPlayer(gameCode, "Bob");
    playerId = response.playerId;

    game = await getGame(gameCode);
    game.rounds.push({
      setup: {
        setup: "Why did the chicken cross the road?",
        type: SetupType.pickOne,
      },
      host: "6094a2e1d7909d84ae35819c",
      state: RoundState.playersChoose,
    });
    const player = game.players.id(playerId);
    if (player !== null) {
      player.punchlines = [
        "To get to the other side",
        "To avoid bad jokes",
        "To go to KFC",
        "To go to Cheeky Nando's with the lads",
      ];
    }
  });

  it("chooses players cards for the round, removes cards from the players hand and add them to game discard pile", async () => {
    await game.save();

    await playerChoosePunchlines(gameCode, playerId, [
      "To get to the other side",
    ]);

    game = await getGame(gameCode);

    expect(game.players[0]).toEqual(
      expect.not.arrayContaining(["To get to the other side"])
    );
    expect(game.rounds[0].punchlinesByPlayer.get(playerId)).toEqual(
      expect.arrayContaining(["To get to the other side"])
    );
    expect(game.discardedPunchlines).toEqual(
      expect.arrayContaining(["To get to the other side"])
    );
  });

  it("handles multiple players choosing cards", async () => {
    await game.save();

    const response = await createPlayer(gameCode, "Fred");
    const player2Id = response.playerId;
    game = await getGame(gameCode);
    const player2 = game.players.id(player2Id);
    if (player2 !== null) {
      player2.punchlines = [
        "To prove it wasn't chicken!",
        "It was feeling cocky",
      ];
    }
    await game.save();

    await playerChoosePunchlines(gameCode, playerId, [
      "To get to the other side",
    ]);
    await playerChoosePunchlines(gameCode, player2Id, ["It was feeling cocky"]);

    game = await getGame(gameCode);

    expect(game.players[1]).toEqual(
      expect.not.arrayContaining(["It was feeling cocky"])
    );
    expect(game.rounds[0].punchlinesByPlayer.get(player2Id)).toEqual(
      expect.arrayContaining(["It was feeling cocky"])
    );
    expect(game.discardedPunchlines).toEqual(
      expect.arrayContaining([
        "To get to the other side",
        "It was feeling cocky",
      ])
    );
  });

  it("throws error if game contains no rounds", async () => {
    game.rounds.pop();
    await game.save();

    await expect(
      playerChoosePunchlines(gameCode, playerId, ["To get to the other side"])
    ).rejects.toThrow("Cannot choose punchlines");
  });

  it("throws error if round state is not PLAYERS_CHOSE", async () => {
    game.rounds[0].state = RoundState.before;
    await game.save();

    await expect(
      playerChoosePunchlines(gameCode, playerId, ["To get to the other side"])
    ).rejects.toThrow("Cannot choose punchlines");
  });

  it("throws error if player is the round host", async () => {
    await game.save();

    await expect(
      playerChoosePunchlines(gameCode, "6094a2e1d7909d84ae35819c", [
        "To get to the other side",
      ])
    ).rejects.toThrow("Cannot choose punchlines");
  });

  it("throws error if player has already chosen punchlines for this round", async () => {
    game.rounds[0].punchlinesByPlayer.set(playerId, [
      "To get to the other side",
    ]);
    await game.save();

    await expect(
      playerChoosePunchlines(gameCode, playerId, ["To get to the other side"])
    ).rejects.toThrow("Cannot choose punchlines");
  });

  it("throws error if one punchline isn't provided for PICK_ONE round setup", async () => {
    await game.save();

    await expect(
      playerChoosePunchlines(gameCode, playerId, [
        "To get to the other side",
        "To avoid bad jokes",
      ])
    ).rejects.toThrow("Cannot choose punchlines");
  });

  it("throws error if two punchlines aren't provided for PICK_TWO round setup", async () => {
    game.rounds[0].setup.type = SetupType.pickTwo;
    await game.save();

    await expect(
      playerChoosePunchlines(gameCode, playerId, [
        "To get to the other side",
        "To avoid bad jokes",
        "To go to KFC",
      ])
    ).rejects.toThrow("Cannot choose punchlines");
  });

  it("throws error if three punchlines aren't provided for DRAW_TWO_PICK_THREE round setup", async () => {
    game.rounds[0].setup.type = SetupType.drawTwoPickThree;
    await game.save();

    await expect(
      playerChoosePunchlines(gameCode, playerId, [
        "To get to the other side",
        "To avoid bad jokes",
        "To go to KFC",
        "To go to Cheeky Nando's with the lads",
      ])
    ).rejects.toThrow("Cannot choose punchlines");
  });

  it("throws error if player does not exist in game", async () => {
    game.players.pop();
    await game.save();

    await expect(
      playerChoosePunchlines(gameCode, playerId, ["To get to the other side"])
    ).rejects.toThrow("Cannot choose punchlines");
  });

  it("throws error if player chooses punchline that is not in their hand", async () => {
    await game.save();

    await expect(
      playerChoosePunchlines(gameCode, playerId, [
        "To try out their black market jokes",
      ])
    ).rejects.toThrow("Cannot choose punchlines");
  });
});

describe("enterHostChoosesState Service", () => {
  let game: Game;

  beforeEach(async () => {
    const gameCode = await createGame();
    game = await getGame(gameCode);

    game.rounds.push({
      setup: {
        setup: "Why did the chicken cross the road?",
        type: SetupType.pickOne,
      },
      host: "6094a2e1d7909d84ae35819c",
      state: RoundState.playersChoose,
      punchlinesByPlayer: new Map([
        ["abc123", ["To get to the other side"]],
        ["def456", ["It was feeling cocky"]],
      ]),
    });
  });

  it("enters host chooses state", async () => {
    await game.save();

    const punchlines = await enterHostChoosesState(game.gameCode);

    game = await getGame(game.gameCode);
    expect(game.rounds[0].state).toBe(RoundState.hostChooses);
    expect(punchlines[0]).toEqual(
      expect.arrayContaining(["To get to the other side"])
    );
    expect(punchlines[1]).toEqual(
      expect.arrayContaining(["It was feeling cocky"])
    );
  });

  it("throws error if game contains no rounds", async () => {
    game.rounds.pop();
    await game.save();

    await expect(enterHostChoosesState(game.gameCode)).rejects.toThrow(
      "Cannot enter host chooses state"
    );
  });

  it("throws error if round state is not PLAYERS_CHOOSE", async () => {
    game.rounds[0].state = RoundState.before;
    await game.save();

    await expect(enterHostChoosesState(game.gameCode)).rejects.toThrow(
      "Cannot enter host chooses state"
    );
  });
});

describe("hostChoosesWinner Service", () => {
  let game: Game;

  beforeEach(async () => {
    const gameCode = await createGame();
    game = await getGame(gameCode);

    game.rounds.push({
      setup: {
        setup: "Why did the chicken cross the road?",
        type: SetupType.pickOne,
      },
      host: "6094a2e1d7909d84ae35819c",
      state: RoundState.hostChooses,
      punchlinesByPlayer: new Map([
        ["def456", ["To get to the other side"]],
        ["ghi789", ["It was feeling cocky"]],
      ]),
    });
  });

  it("returns winner", async () => {
    await game.save();

    const winningEntry = await hostChoosesWinner(
      game.gameCode,
      "6094a2e1d7909d84ae35819c",
      ["It was feeling cocky"]
    );

    game = await getGame(game.gameCode);
    expect(game.rounds[0].state).toBe(RoundState.after);
    expect(winningEntry.playerId).toBe("ghi789");
    expect(winningEntry.punchlines).toEqual(
      expect.arrayContaining(["It was feeling cocky"])
    );
  });

  it("throws error if game contains no rounds", async () => {
    game.rounds.pop();
    await game.save();

    await expect(
      hostChoosesWinner(game.gameCode, "6094a2e1d7909d84ae35819c", [
        "It was feeling cocky",
      ])
    ).rejects.toThrow("Cannot choose winner");
  });

  it("throws error if round state is not PLAYERS_CHOOSE", async () => {
    game.rounds[0].state = RoundState.before;
    await game.save();

    await expect(
      hostChoosesWinner(game.gameCode, "6094a2e1d7909d84ae35819c", [
        "It was feeling cocky",
      ])
    ).rejects.toThrow("Cannot choose winner");
  });

  it("throws error if player is not the round host", async () => {
    game.rounds[0].host = "6094a31d25335f84c32a12ff";
    await game.save();

    await expect(
      hostChoosesWinner(game.gameCode, "6094a2e1d7909d84ae35819c", [
        "It was feeling cocky",
      ])
    ).rejects.toThrow("Cannot choose winner");
  });

  it("throws error if winningPunchlines are invalid", async () => {
    await game.save();

    await expect(
      hostChoosesWinner(game.gameCode, "6094a2e1d7909d84ae35819c", [
        "It was feeling bold",
      ])
    ).rejects.toThrow("Cannot choose winner");
  });
});
