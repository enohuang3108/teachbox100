import { describe, expect, it } from "vitest";
import { seqRng } from "@/lib/monopoly/rng";
import {
  buildBoard,
  isMatch,
  MAX_GROUPS,
  MIN_GROUPS,
  parseBatch,
  STARTER_DECK,
  toBatch,
  validateDeck,
  type PairGroup,
} from "./game";
import { faceFontScale, fullscreenColumnsFor } from "./layout";

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

  it("圖片卡面不受字數限制，但同一張圖不能用兩次", () => {
    const img = "data:image/webp;base64," + "A".repeat(500);
    expect(validateDeck([group(0, { faces: [img, "乙0"] }), group(1)]).ok).toBe(true);
    const dup = validateDeck([group(0, { faces: [img, "乙0"] }), group(1, { faces: [img, "乙1"] })]);
    expect(dup.ok).toBe(false);
    expect(dup.groups[1]).toContain("同一張圖片");
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

describe("fullscreenColumnsFor", () => {
  it("寬螢幕 14 張牌鋪成 7 欄 2 列，牌比 4 欄 4 列大", () => {
    expect(fullscreenColumnsFor(14, 1920, 1000)).toBe(7);
  });
  it("直式螢幕欄數變少", () => {
    expect(fullscreenColumnsFor(14, 800, 1400)).toBeLessThan(fullscreenColumnsFor(14, 1400, 800));
  });
  it("8 張牌在 16:9 一排放完", () => {
    expect(fullscreenColumnsFor(8, 1920, 1080)).toBe(4);
  });
});

describe("批次輸入", () => {
  it("一行一組，第一個空白前後是兩張卡面；空行略過，只寫一段或兩段相同就是同卡面", () => {
    const deck = parseBatch("貓 cat\n\n  狗　 a dog \n蘋果\n樹 樹\n");
    expect(deck.map((g) => [g.faces, g.sameFace])).toEqual([
      [["貓", "cat"], false],
      [["狗", "a dog"], false],
      [["蘋果", ""], true],
      [["樹", ""], true],
    ]);
  });

  it("有 Tab 就以 Tab 分隔（從試算表貼上），卡面裡可以有空白", () => {
    expect(parseBatch("ice cream\t冰淇淋")[0].faces).toEqual(["ice cream", "冰淇淋"]);
  });

  it("牌組轉回文字再解析，卡面不變", () => {
    const deck = [
      group(1),
      group(2, { faces: ["月", "x"], sameFace: true }),
      group(3, { faces: ["ice cream", "冰淇淋"] }),
    ];
    const back = parseBatch(toBatch(deck));
    expect(back.map((g) => [g.faces[0], g.sameFace ? g.faces[0] : g.faces[1]])).toEqual([
      ["甲1", "乙1"],
      ["月", "月"],
      ["ice cream", "冰淇淋"],
    ]);
  });
});

describe("faceFontScale", () => {
  it("字越多字級越小，短字有上限", () => {
    const one = faceFontScale("貓");
    const eight = faceFontScale("一二三四五六七八");
    const twenty = faceFontScale("一二三四五六七八九十一二三四五六七八九十");
    expect(one).toBeGreaterThan(eight);
    expect(eight).toBeGreaterThan(twenty);
    expect(one).toBeLessThanOrEqual(0.4);
    // 中文沒有空白，整句不能被當成一個「長單字」縮到看不見
    expect(twenty).toBeGreaterThan(0.15);
  });
  it("20 個中文字照估算的行數排得進 3:4 的牌", () => {
    const f = faceFontScale("一二三四五六七八九十一二三四五六七八九十");
    const perLine = Math.floor(0.9 / f);
    expect(Math.ceil(20 / perLine) * f * 1.25).toBeLessThan(4 / 3);
  });
  it("三個字的短詞排成一行，不折行", () => {
    expect(faceFontScale("冰淇淋") * 3).toBeLessThanOrEqual(0.9);
  });
  it("最長的英文單字一行放得下", () => {
    expect(faceFontScale("watermelon") * 10 * 0.62).toBeLessThanOrEqual(0.9);
  });
});
