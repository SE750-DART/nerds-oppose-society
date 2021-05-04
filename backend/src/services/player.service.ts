import { getGame } from "./game.service";
import { Player } from "../models";
import { ErrorType, ServiceError } from "../util";

export const createPlayer = async (
  gameCode: string,
  nickname: string
): Promise<string> => {
  const game = await getGame(gameCode);

  const length = game.players.push({
    nickname: nickname,
  });
  const player = game.players[length - 1];

  try {
    await game.save();
  } catch (e) {
    throw new ServiceError(ErrorType.playerName, "Duplicate player nickname");
  }

  return player._id;
};

export const getPlayer = async (
  gameCode: string,
  playerId: string
): Promise<Player> => {
  const game = await getGame(gameCode);

  const player = game.players.id(playerId);

  if (player) return player;
  throw new ServiceError(ErrorType.playerName, "Could not get player");
};
