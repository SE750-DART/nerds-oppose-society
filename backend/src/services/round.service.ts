import { Game, Player } from "../models";
import { getGame } from "./game.service";
import { RoundState } from "../models/round.model";
import { ErrorType, ServiceError } from "../util";

export const beginRound = async (
  gameCode: Game["gameCode"],
  playerId: Player["id"]
): Promise<void> => {
  const game = await getGame(gameCode);
  const round = game.rounds.slice(-1)[0];

  if (
    round !== undefined &&
    round.state === RoundState.before &&
    playerId === round.host
  ) {
    round.state = RoundState.playersChoose;

    // TODO: Allocate player cards here?

    await game.save();
    return;
  }
  throw new ServiceError(ErrorType.invalidAction, "Cannot begin round");
};
