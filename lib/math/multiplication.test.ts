import { describe, expect, it } from "vitest";
import { makeNextQuestion, makeQuestion, OPTION_COUNT, TABLES } from "./multiplication";

/** 走遍 0..1 的固定序列，讓出題結果可重現 */
const seq = (values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

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

describe("makeNextQuestion", () => {
  it("不會緊接著出一模一樣的題目", () => {
    let prev = makeQuestion([...TABLES]);
    for (let i = 0; i < 300; i++) {
      const next = makeNextQuestion([...TABLES], prev);
      expect(next.a === prev.a && next.b === prev.b).toBe(false);
      prev = next;
    }
  });

  it("只剩一種可能的題目時仍會回傳（不會無限重試）", () => {
    const q = makeNextQuestion([2], { a: 2, b: 2, answer: 4, options: [] }, seq([0.1]));
    expect(q.a).toBe(2);
  });
});
