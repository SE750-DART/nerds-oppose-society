import { Game, Player, SetupType } from "../models";
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

export const playerChoosePunchlines = async (
  gameCode: Game["gameCode"],
  playerId: Player["id"],
  punchlines: string[]
): Promise<void> => {
  const game = await getGame(gameCode);
  const round = game.rounds.slice(-1)[0];
  const player = game.players.id(playerId);

  if (
    round !== undefined &&
    round.state === RoundState.playersChoose &&
    playerId !== round.host &&
    !round.punchlinesByPlayer.has(playerId) &&
    ((round.setup.type === SetupType.pickOne && punchlines.length === 1) ||
      (round.setup.type === SetupType.pickTwo && punchlines.length === 2) ||
      (round.setup.type === SetupType.drawTwoPickThree &&
        punchlines.length === 3)) &&
    player !== null &&
    punchlines.reduce(
      (contains, punchline) =>
        contains && player.punchlines.includes(punchline),
      true
    )
  ) {
    player.punchlines = player.punchlines.filter(
      (p) => !punchlines.includes(p)
    );
    round.punchlinesByPlayer.set(playerId, JSON.stringify(punchlines));
    game.discardedPunchlines.push(...punchlines);

    await game.save();
    return;
  }
  throw new ServiceError(ErrorType.invalidAction, "Cannot choose punchlines");
};

export const enterHostChoosesState = async (
  gameCode: Game["gameCode"],
  playerId: Player["id"]
): Promise<string[][]> => {
  const game = await getGame(gameCode);
  const round = game.rounds.slice(-1)[0];

  if (
    round !== undefined &&
    round.state === RoundState.playersChoose &&
    round.host === playerId
  ) {
    round.state = RoundState.hostChooses;

    await game.save();
    return Array.from(round.punchlinesByPlayer.values()).map((value) =>
      JSON.parse(value)
    );
  }
  throw new ServiceError(ErrorType.invalidAction, "Cannot enter state");
};
