import { describe, expect, it } from "vitest";
import { celebration, makeNextQuestion, makeQuestion, OPTION_COUNT, TABLES } from "./multiplication";

describe("makeQuestion", () => {
  it("選項一定有正確答案，且剛好四個不重複", () => {
    for (let i = 0; i < 500; i++) {
      const q = makeQuestion([...TABLES]);
      expect(q.options).toHaveLength(OPTION_COUNT);
      expect(new Set(q.options).size).toBe(OPTION_COUNT);
      expect(q.options).toContain(q.answer);
      expect(q.answer).toBe(q.a * q.b);
    }
  });

  it("選項全是正數（1×1 這種誘答項會被濾掉再補）", () => {
    for (let i = 0; i < 500; i++) {
      for (const o of makeQuestion([1, 2]).options) expect(o).toBeGreaterThan(0);
    }
  });

  it("只出老師勾選的乘法表", () => {
    for (let i = 0; i < 200; i++) {
      expect([7, 9]).toContain(makeQuestion([7, 9]).a);
    }
  });

  it("沒勾任何一段時退回全部，不會當掉", () => {
    expect(makeQuestion([]).a).toBeGreaterThan(0);
  });
});

describe("celebration", () => {
  it("每個分數都有鼓勵，八成以上才撒紙屑、全對才加砲", () => {
    expect(celebration(10, 10)).toEqual({ label: "全對！", confetti: true, cannons: true });
    expect(celebration(8, 10)).toEqual({ label: "好厲害！", confetti: true, cannons: false });
    expect(celebration(7, 10)).toEqual({ label: "有進步！", confetti: false, cannons: false });
    expect(celebration(0, 10)).toEqual({ label: "繼續加油！", confetti: false, cannons: false });
    expect(celebration(0, 0).confetti).toBe(false);
  });
});


it("選定乘法表的所有組合出完前不重複", () => {
  let deck: import("@/lib/questions/deck").QuestionDeck | null = null;
  const pairs: string[] = [];
  for (let i = 0; i < 54; i++) {
    const result = makeNextQuestion([2, 3], deck, () => 0);
    pairs.push(`${result.question.a}x${result.question.b}`);
    deck = result.questionDeck;
  }
  for (let i = 0; i < pairs.length; i += 18) expect(new Set(pairs.slice(i, i + 18)).size).toBe(18);
});
