import {
  Game,
  GameModel,
  GameState,
  Player,
  Settings,
  Setup,
  SetupType,
} from "../models";
import { digitShortCode, ErrorType, ServiceError, shuffle } from "../util";
import { PUNCHLINES, SETUPS } from "../resources";
import { MaxPlayers } from "../models/settings.model";

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

export const checkGameEnded = async (
  gameCode: Game["gameCode"]
): Promise<boolean> => {
  const game = await getGame(gameCode);
  if (game?.settings?.roundLimit === game?.rounds.length) {
    game.state = GameState.finished;
    await game.save();
    return true;
  }
  return false;
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
    await game.save();

    return punchlinesAdded;
  }

  throw new ServiceError(ErrorType.playerId, "Player does not exist");
};
export const shuffleDiscardedSetups = async (game: Game): Promise<void> => {
  if (game.setups.length <= 5) {
    const discardedSetups: Setup[] = game.discardedSetups;
    const shuffledDiscard: Setup[] = shuffle(discardedSetups);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    game.setups.push({
      $each: shuffledDiscard,
      $position: 0,
    });
    game.discardedSetups.remove(...discardedSetups);
    await game.save();
  }
};
export const shuffleDiscardedPunchlines = async (
  game: Game,
  maxPlayers: number = MaxPlayers
): Promise<void> => {
  // Get the next card in the setups pile
  const topSetup: Setup = game.setups[game.setups.length - 1];

  // Get the size of the first player in the lobby (should be representative of all players)
  const handSize = game.players[0].punchlines.length;

  let requiredDeckSize: number;
  // In the case of draw2pick 3, players may need to draw up to 4 cards
  if (topSetup.type === SetupType.drawTwoPickThree) {
    requiredDeckSize = handSize === 8 ? 4 * maxPlayers : 3 * maxPlayers;
  } else {
    requiredDeckSize = handSize === 8 ? 2 * maxPlayers : maxPlayers;
  }

  if (game.punchlines.length <= requiredDeckSize) {
    const discardedPunchlines: string[] = game.discardedPunchlines;
    const shuffledDiscard: string[] = shuffle(discardedPunchlines);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    game.punchlines.push({
      $each: shuffledDiscard,
      $position: 0,
    });
    game.discardedPunchlines = [];
    await game.save();
  }
};
