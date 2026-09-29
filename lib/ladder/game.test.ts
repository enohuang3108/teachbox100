import { describe, expect, it } from "vitest";
import { defaultRng, seqRng } from "@/lib/monopoly/rng";
import {
  buildLadder,
  groupLabels,
  MAX_PLAYERS,
  parseResults,
  trace,
  validateSetup,
} from "./game";

describe("buildLadder", () => {
  it("同一列的橫槓不會共用同一條直線，每一對相鄰直線至少有一條橫槓", () => {
    for (const n of [2, 3, 7, MAX_PLAYERS]) {
      const { rows } = buildLadder(n, defaultRng);
      for (const row of rows) {
        const sorted = [...row].sort((a, b) => a - b);
        sorted.forEach((col, i) => {
          expect(col).toBeGreaterThanOrEqual(0);
          expect(col).toBeLessThan(n - 1);
          if (i > 0) expect(col - sorted[i - 1]).toBeGreaterThan(1);
        });
      }
      for (let gap = 0; gap < n - 1; gap++)
        expect(rows.some((row) => row.includes(gap))).toBe(true);
    }
  });
});

describe("trace", () => {
  it("每條直線都走到不同的終點", () => {
    const ladder = buildLadder(12, defaultRng);
    const ends = Array.from({ length: 12 }, (_, i) => trace(ladder, i).end);
    expect(new Set(ends).size).toBe(12);
  });

  it("遇到橫槓就轉彎", () => {
    // 兩條線、中間一條橫槓：左邊的走到右邊
    const ladder = { columns: 2, rows: [[0]] };
    expect(trace(ladder, 0)).toEqual({
      end: 1,
      points: [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 2],
      ],
    });
    expect(trace(ladder, 1).end).toBe(0);
  });
});

describe("groupLabels", () => {
  it("人數除不盡時各組最多差一人", () => {
    const labels = groupLabels(10, 3, seqRng([0.3, 0.7, 0.1, 0.9]));
    const sizes = ["第 1 組", "第 2 組", "第 3 組"].map(
      (g) => labels.filter((l) => l === g).length,
    );
    expect(sizes.sort()).toEqual([3, 3, 4]);
  });
});

describe("validateSetup", () => {
  const names = ["小明", "小華", "小美"];

  it("自訂結果要跟名單一樣多", () => {
    expect(
      validateSetup(names, { mode: "custom", results: ["一", "二"], groupCount: 2 }),
    ).toBe("結果要跟名單一樣多（名單 3 個，結果 2 個）");
    expect(
      validateSetup(names, { mode: "custom", results: ["一", "二", "三"], groupCount: 2 }),
    ).toBeUndefined();
  });

  it("分組的組數不能比人多", () => {
    expect(validateSetup(names, { mode: "groups", results: [], groupCount: 4 })).toBe(
      "3 個人最多分 3 組",
    );
  });

  it("名單至少兩個、最多上限", () => {
    expect(validateSetup(["小明"], { mode: "groups", results: [], groupCount: 2 })).toBe(
      "至少要 2 個人",
    );
    const many = Array.from({ length: MAX_PLAYERS + 1 }, (_, i) => `x${i}`);
    expect(validateSetup(many, { mode: "groups", results: [], groupCount: 2 })).toBe(
      `最多 ${MAX_PLAYERS} 個人`,
    );
  });
});

it("parseResults 一行一個，去空白與空行", () => {
  expect(parseResults(" 掃地 \n\n擦黑板\n")).toEqual(["掃地", "擦黑板"]);
});
