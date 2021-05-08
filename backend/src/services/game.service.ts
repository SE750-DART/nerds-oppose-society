import { Game, GameModel, GameState, Player, Settings, Setup } from "../models";
import { digitShortCode, ErrorType, ServiceError, shuffle } from "../util";
import { PUNCHLINES, SETUPS } from "../resources";
import { MaxPlayers } from "../models/game.model";

export const createGame = async (): Promise<Game["gameCode"]> => {
  const gameCode: number = digitShortCode(6);
  const setups: Setup[] = shuffle(SETUPS);
  const punchlines: string[] = shuffle(PUNCHLINES);

  const game = new GameModel({
    gameCode: gameCode,
    setups: setups,
    punchlines: punchlines,
  });
  await game.save();

  return String(gameCode);
};

export const getGame = async (gameCode: Game["gameCode"]): Promise<Game> => {
  const game: Game | null = await GameModel.findOne({
    gameCode: gameCode,
  }).exec();

  if (game) return game;
  throw new ServiceError(ErrorType.gameCode, "Game does not exist");
};

export const validateGameCode = async (
  gameCode: Game["gameCode"]
): Promise<boolean> => {
  return await GameModel.exists({ gameCode: gameCode });
};

export const setMaxPlayers = async (
  game: Game,
  maxPlayers: Settings["maxPlayers"]
): Promise<void> => {
  game.settings.maxPlayers = maxPlayers;
  await game.save();
};

export const setRoundLimit = async (
  game: Game,
  roundLimit: Settings["maxPlayers"]
): Promise<void> => {
  game.settings.roundLimit = roundLimit;
  await game.save();
};

export const initialiseNextRound = async (
  gameCode: string,
  host: Player["id"]
): Promise<{ roundNumber: number; setup: Setup }> => {
  const game = await getGame(gameCode);

  const setup = game.setups.pop();
  if (setup !== undefined) {
    game.rounds.push({
      setup: setup,
      host: host,
    });
    game.state = GameState.active;

    await game.save();
    return {
      roundNumber: game.rounds.length,
      setup: setup,
    };
  }
  throw new ServiceError(ErrorType.invalidAction, "Could not start round");
};

/* TODO - rewrite this to pop from the punchlines and pushes onto player if less than max but if greater than max, then remove the excess
 */
export const allocatePlayerPunchlines = async (
  game: Game,
  playerId: Player["id"],
  punchlineLimit = 10
): Promise<string[]> => {
  const player = game.players.id(playerId);

  const punchlinesAdded: string[] = [];

  if (player !== null) {
    while (player.punchlines.length < punchlineLimit) {
      const punchlineFromDeck = game.punchlines.pop();
      if (punchlineFromDeck === undefined) {
        // Potentially reshuffle deck if it is undefined
        throw new ServiceError(ErrorType.gameError, "No punchlines in deck");
      }

      punchlinesAdded.push(punchlineFromDeck);
      player.punchlines.push(punchlineFromDeck);
    }

    return punchlinesAdded;
  }

  throw new ServiceError(ErrorType.playerId, "Player does not exist");
};
export const shuffleDiscardedSetups = async (game: Game): Promise<void> => {
  if (game.setups.length <= 5) {
    const discardedSetups: Setup[] = game.discardedSetups;
    game.setups.push(...shuffle(discardedSetups));
    game.discardedSetups.remove(...discardedSetups);
    await game.save();
  }
};
export const shuffleDiscardedPunchlines = async (game: Game): Promise<void> => {
  if (game.punchlines.length <= MaxPlayers) {
    const discardedPunchlines: string[] = game.discardedPunchlines;
    game.punchlines.push(...shuffle(discardedPunchlines));
    game.discardedPunchlines = [];
    await game.save();
  }
};
