import { getGame } from "./game.service";
import { Player } from "../models";

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

export const getPlayer = async (
  gameCode: string,
  playerId: string
): Promise<Player> => {
  const game = await getGame(gameCode);

  const player = game.players.id(playerId);

  if (player) return player;
  throw new Error("Could not get player");
};
