import { describe, expect, it } from "vitest";
import { rms, smooth, toLevel, zoneOf } from "./meter";

describe("rms", () => {
  it("全 0 的取樣是 0", () => {
    expect(rms(new Float32Array(8))).toBe(0);
  });

  it("定值 0.5 的均方根就是 0.5", () => {
    expect(rms(new Float32Array(8).fill(0.5))).toBeCloseTo(0.5);
  });
});

describe("toLevel", () => {
  it("無聲是 0，破表夾在 100", () => {
    expect(toLevel(0)).toBe(0);
    expect(toLevel(1)).toBe(100);
  });

  it("單調遞增", () => {
    expect(toLevel(0.05)).toBeGreaterThan(toLevel(0.005));
  });
});

describe("smooth", () => {
  it("上升比下降快", () => {
    const up = smooth(0, 100);
    const down = 100 - smooth(100, 0);
    expect(up).toBeGreaterThan(down);
  });
});

describe("zoneOf", () => {
  it("依門檻分三區", () => {
    expect(zoneOf(10, 70)).toBe("quiet");
    expect(zoneOf(55, 70)).toBe("ok");
    expect(zoneOf(80, 70)).toBe("loud");
  });
});
