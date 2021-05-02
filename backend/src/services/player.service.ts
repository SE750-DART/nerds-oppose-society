import { getGame } from "./game.service";

export const createPlayer = async (
  gameCode: string,
  nickname: string
): Promise<string> => {
  const game = await getGame(gameCode);

  const length = game.players.push({
    nickname: nickname,
  });
  const player = game.players[length - 1];

  await game.save();

  return player._id;
};
