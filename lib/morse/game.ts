export const MORSE_DIGITS = [
  "-----",
  ".----",
  "..---",
  "...--",
  "....-",
  ".....",
  "-....",
  "--...",
  "---..",
  "----.",
] as const;

export function encodeNumber(value: number): string {
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    throw new Error("摩斯密碼只接受 0 到 100 的整數");
  }
  return String(value)
    .split("")
    .map((digit) => MORSE_DIGITS[Number(digit)])
    .join("   ");
}

export function nextRange(
  guess: number,
  secret: number,
  range: { low: number; high: number } = { low: 1, high: 100 },
) {
  if (guess === secret) return range;
  return guess < secret
    ? { low: Math.max(range.low, guess + 1), high: range.high }
    : { low: range.low, high: Math.min(range.high, guess - 1) };
}

export function isValidGuess(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= 100;
}
