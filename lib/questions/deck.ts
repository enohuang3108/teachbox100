/** 可序列化的出題進度；題庫內容或篩選範圍改變時重新洗牌。 */
export interface QuestionDeck {
  key: string;
  remaining: number[];
}

export function shuffleQuestions<T>(items: T[], random = Math.random): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** 每題只出一次，整份耗盡後才重新洗牌；不修改傳入的題庫或進度。 */
export function drawFromDeck<T>(
  pool: T[],
  deck: QuestionDeck | null | undefined,
  random = Math.random,
): { item: T | null; deck: QuestionDeck } {
  const key = JSON.stringify(pool);
  const remaining = deck?.key === key && deck.remaining.length > 0
    ? deck.remaining
    : shuffleQuestions(pool.map((_, index) => index), random);
  return {
    item: pool[remaining[0]] ?? null,
    deck: { key, remaining: remaining.slice(1) },
  };
}
