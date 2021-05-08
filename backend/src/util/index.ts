export const digitShortCode = (length: number): number => {
  const low = 10 ** (length - 1);
  const high = 10 ** length;
  return Math.floor(Math.random() * (high - low) + low);
};

export const shuffle = <Type>(array: Type[]): Type[] => {
  return array
    .map((value): { rank: number; value: Type } => {
      return { rank: Math.random(), value: value };
    })
    .sort((a, b) => a.rank - b.rank)
    .map((value) => value.value);
};

export enum ErrorType {
  gameCode = "GAME_CODE",
  playerId = "PLAYER_ID",
  invalidAction = "INVALID_ACTION",
  noRound = "NO_ROUND",
  gameError = "GAME_ERROR",
}

export class ServiceError extends Error {
  type: ErrorType;
  constructor(type: ErrorType, message?: string) {
    super(message);
    this.type = type;
  }
}
