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
    round.host.toString() === playerId
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
  chosenPunchlines: string[]
): Promise<Set<string>> => {
  const game = await getGame(gameCode);
  const round = game.rounds.slice(-1)[0];
  const player = game.players.id(playerId);

  if (
    round !== undefined &&
    round.state === RoundState.playersChoose &&
    round.host !== playerId &&
    // Check the player has not already chosen punchlines for this round
    !round.punchlinesByPlayer.has(playerId) &&
    // Check the number of punchlines chosen matches the setup type
    ((round.setup.type === SetupType.pickOne &&
      chosenPunchlines.length === 1) ||
      (round.setup.type === SetupType.pickTwo &&
        chosenPunchlines.length === 2) ||
      (round.setup.type === SetupType.drawTwoPickThree &&
        chosenPunchlines.length === 3)) &&
    player !== null &&
    // Player has chosen punchlines in their hand
    chosenPunchlines.every((punchline) => player.punchlines.includes(punchline))
  ) {
    // Remove chosen punchlines from players hand
    player.punchlines = player.punchlines.filter(
      (punchline) => !chosenPunchlines.includes(punchline)
    );
    // Discard players chosen punchlines
    game.discardedPunchlines.push(...chosenPunchlines);
    // Save players chosen punchlines
    round.punchlinesByPlayer.set(playerId, chosenPunchlines);

    await game.save();
    return new Set(round.punchlinesByPlayer.keys());
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
    return Array.from(round.punchlinesByPlayer.values());
  }
  throw new ServiceError(
    ErrorType.invalidAction,
    "Cannot enter host chooses state"
  );
};

export const hostChooseWinner = async (
  gameCode: Game["gameCode"],
  playerId: Player["id"],
  winningPunchlines: string[]
): Promise<Player["id"]> => {
  const game = await getGame(gameCode);
  const round = game.rounds.slice(-1)[0];

  if (
    round !== undefined &&
    round.state === RoundState.hostChooses &&
    round.host.toString() === playerId
  ) {
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
      return winningEntry[0];
    }
  }
  throw new ServiceError(ErrorType.invalidAction, "Cannot choose winner");
};
