import { describe, expect, it } from "vitest";
import { seqRng } from "@/lib/monopoly/rng";
import {
  indexAt,
  MAX_ENTRIES,
  MIN_ENTRIES,
  parseEntries,
  rotationFor,
  sliceColors,
  validateEntries,
} from "./game";

describe("parseEntries", () => {
  it("一行一個，去空白與空行，重複保留", () => {
    expect(parseEntries(" 小明 \n\n小華\r\n小明\n  ")).toEqual(["小明", "小華", "小明"]);
  });
});

describe("validateEntries", () => {
  const n = (k: number) => Array.from({ length: k }, (_, i) => `x${i}`);
  it("數量邊界", () => {
    expect(validateEntries(n(MIN_ENTRIES))).toBeUndefined();
    expect(validateEntries(n(MAX_ENTRIES))).toBeUndefined();
    expect(validateEntries(n(MIN_ENTRIES - 1))).toBeDefined();
    expect(validateEntries(n(MAX_ENTRIES + 1))).toBeDefined();
  });
  it("單項太長", () => {
    expect(validateEntries(["a", "b".repeat(21)])).toContain("超過");
  });
});

describe("rotationFor", () => {
  it("停下來時指標指到抽中的那格，且永遠往前轉", () => {
    for (const count of [2, 3, 6, 7, 13, 60]) {
      for (let index = 0; index < count; index++) {
        for (const r of [0, 0.31, 0.99]) {
          const current = 1234.5;
          const rot = rotationFor(index, count, current, seqRng([r, r]));
          expect(rot).toBeGreaterThan(current + 360 * 4);
          expect(indexAt(rot, count)).toBe(index);
        }
      }
    }
  });
});

describe("sliceColors", () => {
  it("相鄰不同色，頭尾也不同色", () => {
    for (let count = 3; count <= 60; count++) {
      const c = sliceColors(count);
      expect(c).toHaveLength(count);
      for (let i = 0; i < count; i++) expect(c[i]).not.toBe(c[(i + 1) % count]);
    }
  });
});
