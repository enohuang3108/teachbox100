import { describe, expect, it } from "vitest";
import { rulerPosition, rulerTicks } from "./ruler";

describe("horizontal ruler ticks", () => {
  it("marks every 5 and emphasizes only 20, 40, 60, and 80", () => {
    const ticks = rulerTicks({
      min: 1,
      max: 100,
      every: 5,
      majorEvery: 20,
      start: 0,
    });

    expect(ticks.map(({ value }) => value)).toEqual(
      Array.from({ length: 21 }, (_, index) => index * 5),
    );
    expect(ticks.filter(({ major }) => major).map(({ value }) => value)).toEqual([
      20, 40, 60, 80,
    ]);
    expect(ticks.find(({ value }) => value === 100)?.major).toBe(false);
  });

  it("places 20 and 40 on the thumb's 1–100 axis", () => {
    expect(rulerPosition(0, 1, 100)).toBeCloseTo(-100 / 99);
    expect(rulerPosition(20, 1, 100)).toBeCloseTo((19 / 99) * 100);
    expect(rulerPosition(40, 1, 100)).toBeCloseTo((39 / 99) * 100);
    expect(rulerPosition(100, 1, 100)).toBe(100);
  });
});
