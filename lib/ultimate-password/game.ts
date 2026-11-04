import { drawFromDeck, type QuestionDeck } from "@/lib/questions/deck";
import type { Question } from "@/lib/questions/types";

export type NumberRange = { low: number; high: number };
/** bounds 是老師設定的範圍；range 是猜錯後縮小的提示；endsAt 為 null 代表不限時 */
export type Round = { secret: number; range: NumberRange; bounds: NumberRange; endsAt: number | null };

export const DEFAULT_BOUNDS: NumberRange = { low: 1, high: 100 };
export const RANGE_LIMIT = { min: 0, max: 1000, span: 10 };
/** 總限時（分鐘），0 = 不限時 */
export const TIME_LIMITS = [0, 1, 2, 3, 5, 10] as const;
export type TimeLimit = (typeof TIME_LIMITS)[number];

/** 設定的範圍哪裡不對；null = 可以玩 */
export function rangeError({ low, high }: NumberRange): string | null {
  if (!Number.isInteger(low) || !Number.isInteger(high)) return "最小值與最大值都要填整數";
  if (low < RANGE_LIMIT.min || high > RANGE_LIMIT.max)
    return `範圍要在 ${RANGE_LIMIT.min} 到 ${RANGE_LIMIT.max} 之間`;
  if (high - low + 1 < RANGE_LIMIT.span) return `最大值要比最小值大，且至少 ${RANGE_LIMIT.span} 個數字`;
  return null;
}

export function playableQuestions(questions: Question[]): Question[] {
  return questions.filter((question) => question.type === "choice" || question.type === "boolean");
}

export function startRound(
  { bounds = DEFAULT_BOUNDS, minutes = 0 }: { bounds?: NumberRange; minutes?: number } = {},
  random = Math.random,
  now = Date.now(),
): Round {
  return {
    secret: bounds.low + Math.floor(random() * (bounds.high - bounds.low + 1)),
    range: bounds,
    bounds,
    endsAt: minutes ? now + minutes * 60_000 : null,
  };
}

export function drawQuestion(
  questions: Question[],
  deck: QuestionDeck | null = null,
  random = Math.random,
) {
  const drawn = drawFromDeck(questions, deck, random);
  return { question: drawn.item, questionDeck: drawn.deck };
}

export function resolveGuess(
  guess: number,
  answer: number,
  range: NumberRange,
  bounds: NumberRange = DEFAULT_BOUNDS,
) {
  if (!Number.isInteger(guess) || guess < bounds.low || guess > bounds.high) {
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
  const result = resolveGuess(guess, round.secret, round.range, round.bounds);
  return { correct: result.correct, valid: result.valid, round: { ...round, range: result.range } };
}

/** 尺規刻度隨範圍放大，維持約 20 格 */
export function rulerStep({ low, high }: NumberRange) {
  return [1, 2, 5, 10, 25, 50].find((s) => (high - low) / s <= 25) ?? 50;
}
