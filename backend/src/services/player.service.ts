import { getGame } from "./game.service";
import { Game, GameModel, Player } from "../models";

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
  playerId: string,
  game?: Game
): Promise<Player> => {
  if (!game) game = await getGame(gameCode);

  const player = game.players.id(playerId);

  if (player) return player;
  throw new Error("Could not get player");
};

export const validatePlayerId = async (
  gameCode: string,
  playerId: string
): Promise<boolean> => {
  return await GameModel.exists({
    gameCode: gameCode,
    players: { $elemMatch: { _id: playerId } },
  });
};

export const initialisePlayer = async (
  game: Game,
  playerId: string
): Promise<void> => {
  const player = game.players.id(playerId);
  if (player === null) throw new Error("Player does not exist");
  player.new = false;
  await game.save();
};
