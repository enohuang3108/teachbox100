import { describe, expect, it } from "vitest";
import { pickIndex, rollOne, seqRng } from "./rng";

describe("rng", () => {
  it("rollOne 將 [0,1) 映射到 1~6", () => {
    expect(rollOne(seqRng([0]))).toBe(1);
    expect(rollOne(seqRng([0.99]))).toBe(6);
    expect(rollOne(seqRng([0.5]))).toBe(4);
  });

  it("pickIndex 落在範圍內", () => {
    expect(pickIndex(5, seqRng([0]))).toBe(0);
    expect(pickIndex(5, seqRng([0.99]))).toBe(4);
  });

  it("seqRng 依序回傳並循環", () => {
    const rng = seqRng([0.1, 0.2]);
    expect(rng()).toBe(0.1);
    expect(rng()).toBe(0.2);
    expect(rng()).toBe(0.1);
  });
});
