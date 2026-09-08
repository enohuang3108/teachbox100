/** 九九乘法出題。全部是純函式，隨機來源由呼叫端傳進來，測試才好固定。 */

export const TABLES = [2, 3, 4, 5, 6, 7, 8, 9] as const;
export const OPTION_COUNT = 4;

export interface Question {
  a: number;
  b: number;
  answer: number;
  options: number[];
}

const pick = <T,>(arr: readonly T[], rng: () => number) =>
  arr[Math.floor(rng() * arr.length)];

/**
 * 誘答項不用亂數亂編，而是取孩子真的會犯的錯：
 * 背錯一格（±a、±b）、進位算錯（±1）、看成加法。
 * 隨機數字太好排除，練不到東西。
 */
function distractorsFor(a: number, b: number): number[] {
  const answer = a * b;
  return [
    answer + a,
    answer - a,
    answer + b,
    answer - b,
    answer + 1,
    answer - 1,
    a + b,
  ].filter((n) => n > 0 && n !== answer);
}

export function shuffle<T>(items: T[], rng: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function makeQuestion(
  tables: number[],
  rng: () => number = Math.random,
): Question {
  const a = pick(tables.length ? tables : [...TABLES], rng);
  const b = 1 + Math.floor(rng() * 9);
  const answer = a * b;

  const options = [answer];
  for (const d of shuffle(distractorsFor(a, b), rng)) {
    if (options.length === OPTION_COUNT) break;
    if (!options.includes(d)) options.push(d);
  }
  // 誘答項去重後可能不夠（例如 1×1），往上補到湊滿
  for (let n = answer + 2; options.length < OPTION_COUNT; n++) {
    if (!options.includes(n)) options.push(n);
  }

  return { a, b, answer, options: shuffle(options, rng) };
}

/** 連續出題時避免緊鄰兩題一模一樣，最多重試幾次就放行 */
export function makeNextQuestion(
  tables: number[],
  prev: Question | null,
  rng: () => number = Math.random,
): Question {
  for (let i = 0; i < 8; i++) {
    const q = makeQuestion(tables, rng);
    if (!prev || q.a !== prev.a || q.b !== prev.b) return q;
  }
  return makeQuestion(tables, rng);
}

/** 收尾的一句話，依答對率換 */
export function verdict(correct: number, total: number): string {
  const rate = total ? correct / total : 0;
  if (rate === 1) return "全對！九九乘法已經滾瓜爛熟了 🎉";
  if (rate >= 0.8) return "很不錯！剩下幾格再多練幾次就滿分了。";
  if (rate >= 0.5) return "有進步空間，挑答錯的那幾格再練一輪吧。";
  return "先從一段乘法表開始，練熟一段再加下一段。";
}
