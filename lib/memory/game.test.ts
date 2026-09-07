import { describe, expect, it } from "vitest";
import { seqRng } from "@/lib/monopoly/rng";
import {
  buildBoard,
  isMatch,
  MAX_GROUPS,
  MIN_GROUPS,
  STARTER_DECK,
  validateDeck,
  type PairGroup,
} from "./game";

const group = (i: number, over: Partial<PairGroup> = {}): PairGroup => ({
  id: `g${i}`,
  faces: [`甲${i}`, `乙${i}`],
  sameFace: false,
  ...over,
});
const deckOf = (n: number) => Array.from({ length: n }, (_, i) => group(i));

describe("validateDeck", () => {
  it("2 組與 15 組都合法，少於 2 或多於 15 不合法", () => {
    expect(validateDeck(deckOf(MIN_GROUPS)).ok).toBe(true);
    expect(validateDeck(deckOf(MAX_GROUPS)).ok).toBe(true);
    expect(validateDeck(deckOf(MIN_GROUPS - 1)).ok).toBe(false);
    expect(validateDeck(deckOf(MAX_GROUPS + 1)).ok).toBe(false);
  });

  it("預設牌組合法", () => {
    expect(validateDeck(STARTER_DECK).ok).toBe(true);
  });

  it("空白卡面、超過 20 字、跨組重複都擋掉，並指到那一組", () => {
    const blank = validateDeck([group(0, { faces: ["貓", " "] }), group(1)]);
    expect(blank.ok).toBe(false);
    expect(blank.groups[0]).toBeDefined();
    expect(blank.groups[1]).toBeUndefined();

    const long = validateDeck([group(0, { faces: ["a".repeat(21), "b"] }), group(1)]);
    expect(long.ok).toBe(false);
    expect(validateDeck([group(0, { faces: ["a".repeat(20), "b"] }), group(1)]).ok).toBe(true);

    const dup = validateDeck([group(0), group(1, { faces: ["甲0", "x"] })]);
    expect(dup.ok).toBe(false);
    expect(dup.groups[1]).toContain("配對 1");
  });

  it("同卡面組兩張一樣是合法的；不同卡面組兩張一樣則不合法", () => {
    expect(validateDeck([group(0, { faces: ["貓", "貓"], sameFace: true }), group(1)]).ok).toBe(true);
    expect(validateDeck([group(0, { faces: ["貓", "貓"] }), group(1)]).ok).toBe(false);
  });
});

describe("buildBoard", () => {
  it("每組恰好兩張、沒有多也沒有少、都帶著配對識別", () => {
    const deck = deckOf(5);
    const board = buildBoard(deck, seqRng([0.3, 0.7, 0.1]));
    expect(board).toHaveLength(10);
    for (const g of deck) {
      const mine = board.filter((c) => c.groupId === g.id);
      expect(mine.map((c) => c.face).sort()).toEqual([...g.faces].sort());
    }
    expect(new Set(board.map((c) => c.id)).size).toBe(10);
  });

  it("同卡面組兩張都用第一張卡面", () => {
    const board = buildBoard([group(0, { faces: ["貓", "舊的"], sameFace: true }), group(1)], seqRng([0.5]));
    expect(board.filter((c) => c.groupId === "g0").map((c) => c.face)).toEqual(["貓", "貓"]);
  });

  it("亂數不同就會洗出不同順序", () => {
    const deck = deckOf(4);
    const a = buildBoard(deck, seqRng([0])).map((c) => c.id);
    const b = buildBoard(deck, seqRng([0.99])).map((c) => c.id);
    expect(a).not.toEqual(b);
  });
});

describe("isMatch", () => {
  const [a, b] = buildBoard([group(0, { faces: ["貓", "cat"] })], seqRng([0]));
  it("同一配對識別、卡面不同也算配對", () => {
    expect(a.face).not.toBe(b.face);
    expect(isMatch(a, b)).toBe(true);
  });
  it("不同識別不配對，就算卡面一樣", () => {
    expect(isMatch(a, { id: "x", groupId: "other", face: a.face })).toBe(false);
  });
  it("自己不能跟自己配", () => {
    expect(isMatch(a, a)).toBe(false);
  });
});
