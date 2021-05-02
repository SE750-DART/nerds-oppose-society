import { GameModel, Setup } from "../models";
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

export const validateGameCode = async (gameCode: string): Promise<boolean> => {
  return await GameModel.exists({ gameCode: gameCode });
};
