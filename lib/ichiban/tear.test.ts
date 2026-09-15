import { describe, expect, it } from "vitest";
import {
  fitPrizeTextSize,
  finishTear,
  prizeRevealProgress,
  tearProgress,
  tearSoundSegment,
  shouldPlayTearTick,
} from "./tear";

describe("一番賞票券撕開規則", () => {
  it("只計算由左往右的拖曳，並把進度限制在 0 到 1", () => {
    expect(tearProgress(100, 80, 240)).toBe(0);
    expect(tearProgress(100, 220, 240)).toBe(0.5);
    expect(tearProgress(100, 420, 240)).toBe(1);
  });

  it("撕過門檻才揭曉，太早放手會回復", () => {
    expect(finishTear(0.61)).toBe("closed");
    expect(finishTear(0.62)).toBe("revealed");
  });

  it("獎項內容只會跟著底紙露出的比例逐步顯示", () => {
    expect(prizeRevealProgress(-0.1)).toBe(0);
    expect(prizeRevealProgress(0)).toBe(0);
    expect(prizeRevealProgress(0.5)).toBe(0.5);
    expect(prizeRevealProgress(1)).toBe(1);
    expect(prizeRevealProgress(1.1)).toBe(1);
  });

  it("依文字實際寬度縮小字級，且不超過設定範圍", () => {
    expect(fitPrizeTextSize(500, 800, 92, 48)).toBe(92);
    expect(fitPrizeTextSize(1600, 800, 92, 48)).toBe(48);
    expect(fitPrizeTextSize(1200, 800, 92, 48)).toBe(61);
  });

  it("撕票音效均分 14 格，前 1 格與後 2 格保持靜音", () => {
    expect(tearSoundSegment(0.5)).toBe(7);
    expect(tearSoundSegment(1)).toBe(14);
    expect([1, 13, 14].every((segment) => !shouldPlayTearTick(segment))).toBe(true);
    expect([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].every(shouldPlayTearTick)).toBe(true);
  });
});
