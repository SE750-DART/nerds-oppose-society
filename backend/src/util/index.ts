export const digitShortCode = (length: number): number => {
  const low = 10 ** (length - 1);
  const high = 10 ** length;
  return Math.floor(Math.random() * (high - low) + low);
};
