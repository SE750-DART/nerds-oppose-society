import { Game, Player, SetupType } from "../models";
import { getGame } from "./game.service";
import { RoundState } from "../models/round.model";
import { ErrorType, ServiceError } from "../util";

export const enterPlayersChooseState = async (
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
  throw new ServiceError(
    ErrorType.invalidAction,
    "Cannot enter players choose state"
  );
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
    round.punchlinesByPlayer.set(playerId, punchlines);
    game.discardedPunchlines.push(...punchlines);

    await game.save();
    return;
  }
  throw new ServiceError(ErrorType.invalidAction, "Cannot choose punchlines");
};

export const enterHostChoosesState = async (
  gameCode: Game["gameCode"]
): Promise<string[][]> => {
  const game = await getGame(gameCode);
  const round = game.rounds.slice(-1)[0];

  if (round !== undefined && round.state === RoundState.playersChoose) {
    round.state = RoundState.hostChooses;

    await game.save();
    return Array.from(round.punchlinesByPlayer.values()).map((entry) => entry);
  }
  throw new ServiceError(
    ErrorType.invalidAction,
    "Cannot enter host chooses state"
  );
};

export const hostChoosesWinner = async (
  gameCode: Game["gameCode"],
  playerId: Player["id"],
  winningPunchlines: string[]
): Promise<{ playerId: Player["id"]; punchlines: string[] }> => {
  const game = await getGame(gameCode);
  const round = game.rounds.slice(-1)[0];

  if (
    round !== undefined &&
    round.state === RoundState.hostChooses &&
    round.host === playerId
  ) {
    console.log(winningPunchlines);
    const winningEntry = Array.from(round.punchlinesByPlayer.entries()).find(
      (entry) =>
        winningPunchlines.length === entry[1].length &&
        winningPunchlines.every(
          (punchline, index) => punchline === entry[1][index]
        )
    );
    if (winningEntry !== undefined) {
      round.state = RoundState.after;

      await game.save();
      return {
        playerId: winningEntry[0],
        punchlines: winningEntry[1],
      };
    }
  }
  throw new ServiceError(ErrorType.invalidAction, "Cannot choose winner");
};
