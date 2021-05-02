import { Game, GameModel, Setup } from "../models";
import { digitShortCode, shuffle } from "../util";
import { PUNCHLINES, SETUPS } from "../resources";

export const createGame = async (): Promise<string> => {
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

export const getGame = async (
  gameCode: string,
  projection?: string
): Promise<Game> => {
  const game: Game | null = await GameModel.findOne(
    { gameCode: gameCode },
    projection
  ).exec();
  if (game) return game;
  throw new Error("Could not get game");
};

export const validateGameCode = async (gameCode: string): Promise<boolean> => {
  return await GameModel.exists({ gameCode: gameCode });
};
