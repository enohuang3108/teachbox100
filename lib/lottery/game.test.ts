import { describe, expect, it } from "vitest";
import { BALL_R_MAX, BALL_R_MIN, BREEZE, layout, traySlot, windEnvelope } from "./game";

describe("layout", () => {
  it("球體、管子與球都在畫布內，球半徑在上下限之間", () => {
    for (const count of [2, 6, 30, 60]) {
      const L = layout(900, 680, count);
      expect(L.ballR).toBeGreaterThanOrEqual(BALL_R_MIN);
      expect(L.ballR).toBeLessThanOrEqual(BALL_R_MAX);
      expect(L.cy + L.r).toBeLessThan(680);
      expect(L.tube.top).toBeGreaterThan(0);
      // 管口比球寬，球才進得去
      expect(L.tube.w).toBeGreaterThan(L.ballR * 2);
    }
  });

  it("托盤由上而下排，放滿一欄往左開新欄，全部在畫布內", () => {
    const L = layout(900, 680, 60);
    const first = traySlot(L, 0);
    const second = traySlot(L, 1);
    expect(second.x).toBe(first.x);
    expect(second.y).toBeGreaterThan(first.y);
    const wrapped = traySlot(L, L.tray.perCol);
    expect(wrapped.y).toBe(first.y);
    expect(wrapped.x).toBeLessThan(first.x);
    for (let i = 0; i < 60; i++) {
      const { x, y } = traySlot(L, i);
      expect(x).toBeGreaterThan(L.ballR);
      expect(y + L.ballR).toBeLessThanOrEqual(680);
    }
  });

  it("球越多球越小", () => {
    expect(layout(900, 680, 60).ballR).toBeLessThan(layout(900, 680, 6).ballR);
  });
});

describe("windEnvelope", () => {
  it("介於 BREEZE 與 1 之間，而且有起有落", () => {
    const samples = Array.from({ length: 300 }, (_, i) => windEnvelope(i * 0.02, false));
    for (const v of samples) {
      expect(v).toBeGreaterThanOrEqual(BREEZE - 1e-9);
      expect(v).toBeLessThanOrEqual(1 + 1e-9);
    }
    expect(Math.max(...samples)).toBeGreaterThan(0.9);
    expect(Math.min(...samples)).toBeLessThan(0.2);
  });
});
