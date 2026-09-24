import type { Question } from "@/lib/questions/types";

export type NumberRange = { low: number; high: number };
export type Round = { secret: number; range: NumberRange };

export function playableQuestions(questions: Question[]): Question[] {
  return questions.filter((question) => question.type === "choice" || question.type === "boolean");
}

export function startRound(random = Math.random): Round {
  return { secret: Math.floor(random() * 100) + 1, range: { low: 1, high: 100 } };
}

export function drawQuestion(questions: Question[], random = Math.random): Question | null {
  return questions[Math.floor(random() * questions.length)] ?? null;
}

export function resolveGuess(
  guess: number,
  answer: number,
  range: NumberRange,
) {
  if (!Number.isInteger(guess) || guess < 1 || guess > 100) {
    return { correct: false, valid: false, range };
  }
  if (guess === answer) return { correct: true, valid: true, range };
  return {
    correct: false,
    valid: true,
    range: guess < answer
      ? { low: Math.max(range.low, guess + 1), high: range.high }
      : { low: range.low, high: Math.min(range.high, guess - 1) },
  };
}

export function resolveRoundGuess(guess: number, round: Round) {
  const result = resolveGuess(guess, round.secret, round.range);
  return { correct: result.correct, valid: result.valid, round: { ...round, range: result.range } };
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
