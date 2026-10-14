import { describe, expect, it } from "vitest";
import { drawFromDeck, shuffleQuestions, type QuestionDeck } from "./deck";

describe("題庫洗牌出題", () => {
  it("不修改題庫或舊進度，耗盡才再次使用亂數洗牌", () => {
    const pool = ["a", "b", "c"];
    let calls = 0;
    const random = () => { calls++; return 0; };
    let deck: QuestionDeck | null = null;
    for (let cycle = 0; cycle < 3; cycle++) {
      const seen: string[] = [];
      for (let i = 0; i < 3; i++) {
        const before = JSON.stringify(deck);
        const drawn = drawFromDeck(pool, deck, random);
        expect(JSON.stringify(deck)).toBe(before);
        seen.push(drawn.item!);
        deck = JSON.parse(JSON.stringify(drawn.deck));
        expect(calls).toBe((cycle + 1) * 2);
      }
      expect(seen.sort()).toEqual(pool);
    }
    expect(pool).toEqual(["a", "b", "c"]);
  });

  it("空題庫不抽題，單題題庫可以一直出題", () => {
    expect(drawFromDeck([], null, () => 0).item).toBeNull();
    const first = drawFromDeck(["a"], null, () => 0);
    expect(drawFromDeck(["a"], first.deck, () => 0).item).toBe("a");
  });

  it("更換題庫、同 id 改內容或篩選範圍改變時捨棄舊順序", () => {
    const bank = [{ id: "a", text: "A" }, { id: "b", text: "B" }];
    const first = drawFromDeck(bank, null, () => 0);
    const changed = [{ id: "a", text: "新 A" }];
    expect(drawFromDeck(changed, first.deck, () => 0).item).toEqual(changed[0]);
    expect(drawFromDeck(bank.slice(0, 1), first.deck, () => 0).item).toEqual(bank[0]);
  });

  it("洗牌不會改到來源陣列", () => {
    const bank = [1, 2, 3];
    expect(shuffleQuestions(bank, () => 0)).toEqual([2, 3, 1]);
    expect(bank).toEqual([1, 2, 3]);
  });
});
