import { getGame } from "./game.service";
import { Game, GameModel, GameState, Player } from "../models";
import { ErrorType, ServiceError } from "../util";
import { MaxPlayers } from "../models/settings.model";

export const createPlayer = async (
  gameCode: Game["gameCode"],
  nickname: string
): Promise<{
  playerId: Player["id"];
  token: Player["token"];
}> => {
  const game = await getGame(gameCode);
  const gameMax = game?.settings?.maxPlayers || MaxPlayers;
  if (game.state === GameState.finished) {
    throw new ServiceError(ErrorType.gameError, "Game is finished");
  } else if (game.players.length >= gameMax) {
    throw new ServiceError(ErrorType.gameError, "Too many players in the game");
  }

  const length = game.players.push({
    nickname: nickname,
  });
  const player = game.players[length - 1];

  try {
    await game.save();
  } catch (e) {
    throw new ServiceError(ErrorType.playerName, "Duplicate player nickname");
  }

  return {
    playerId: player.id,
    token: player.token,
  };
};

export const removePlayer = async (
  game: Game,
  playerId: Player["id"]
): Promise<Player> => {
  const player = game.players.id(playerId);
  if (player === null)
    throw new ServiceError(ErrorType.playerId, "Player does not exist");

  if (player.score === 0 && game.state === GameState.lobby) {
    while (player.punchlines.length > 0) {
      const punchline = player.punchlines.pop() as string;
      game.discardedPunchlines.push(punchline);
    }
    await game.save();
    await player.remove();
    await game.save();
  }

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
  throw new ServiceError(ErrorType.playerId, "Player does not exist");
};

export const authenticatePlayer = async (
  gameCode: Game["gameCode"],
  playerId: Player["id"],
  token: Player["token"]
): Promise<boolean> => {
  return !!(await GameModel.exists({
    gameCode: gameCode,
    players: { $elemMatch: { _id: playerId, token: token } },
  }));
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

export const incrementScore = async (
  game: Game,
  playerId: Player["id"]
): Promise<void> => {
  const player = game.players.id(playerId);
  if (player === null) throw Error("Player does not exist");
  player.score++;
  await game.save();
};
