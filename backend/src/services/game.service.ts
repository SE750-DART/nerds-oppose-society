import { Game, GameModel, Settings, Setup } from "../models";
import { digitShortCode, ErrorType, ServiceError, shuffle } from "../util";
import { PUNCHLINES, SETUPS } from "../resources";

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
