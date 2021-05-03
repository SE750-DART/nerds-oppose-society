import { getGame } from "./game.service";
import { Game, GameModel, Player } from "../models";

export const createPlayer = async (
  gameCode: Game["gameCode"],
  nickname: string
): Promise<Player["id"]> => {
  const game = await getGame(gameCode);

  const length = game.players.push({
    nickname: nickname,
  });
  const player = game.players[length - 1];

  await game.save();

  return player.id;
};

export const removePlayer = async (
  game: Game,
  playerId: Player["id"]
): Promise<Player> => {
  const player = game.players.id(playerId);
  if (player === null) throw Error("Player does not exist");

  await player.remove();
  await game.save();

  return player;
};

export const getPlayer = async (
  gameCode: Game["gameCode"],
  playerId: Player["id"],
  game?: Game
): Promise<Player> => {
  if (!game) game = await getGame(gameCode);

  const player = game.players.id(playerId);

  if (player) return player;
  throw Error("Player does not exist");
};

export const validatePlayerId = async (
  gameCode: Game["gameCode"],
  playerId: Player["id"]
): Promise<boolean> => {
  return await GameModel.exists({
    gameCode: gameCode,
    players: { $elemMatch: { _id: playerId } },
  });
};

export const initialisePlayer = async (
  game: Game,
  playerId: Player["id"]
): Promise<void> => {
  const player = game.players.id(playerId);
  if (player === null) throw Error("Player does not exist");
  player.new = false;
  await game.save();
};
