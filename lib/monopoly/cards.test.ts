import { describe, expect, it } from "vitest";
import { CHANCE_CARDS, FATE_CARDS, deckOf } from "./cards";

describe("cards", () => {
  it("每組卡都有內容且 deck 標示正確", () => {
    expect(CHANCE_CARDS.length).toBeGreaterThan(0);
    expect(FATE_CARDS.length).toBeGreaterThan(0);
    CHANCE_CARDS.forEach((c) => expect(c.deck).toBe("chance"));
    FATE_CARDS.forEach((c) => expect(c.deck).toBe("fate"));
  });

  it("id 唯一", () => {
    const ids = [...CHANCE_CARDS, ...FATE_CARDS].map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("deckOf 回傳對應卡組", () => {
    expect(deckOf("chance")).toBe(CHANCE_CARDS);
    expect(deckOf("fate")).toBe(FATE_CARDS);
  });
});
