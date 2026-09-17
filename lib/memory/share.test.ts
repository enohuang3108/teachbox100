import { describe, expect, it } from "vitest";
import type { PairGroup } from "./game";
import { shrinkDeckForShare } from "./share";

// 假圖：長度就是「大小」，重壓後的長度 = size × quality × 10
const img = (n: number) => "data:image/webp;base64," + "A".repeat(n);
const fakeReencode = async (_: string, size: number, quality: number) =>
  img(Math.round(size * quality * 10));
const group = (a: string, b: string, i: number): PairGroup => ({
  id: `g${i}`,
  faces: [a, b],
  sameFace: false,
});

describe("分享翻牌照片", () => {
  it("放得下就原圖分享，不重壓", async () => {
    const deck = [group(img(1000), "cat", 0), group(img(1000), img(1000), 1)];
    let calls = 0;
    const out = await shrinkDeckForShare(
      deck,
      async (...a) => (calls++, fakeReencode(...a)),
      10_000,
    );
    expect(out).toBe(deck);
    expect(calls).toBe(0);
  });

  it("放不下就整副一起降到第一個放得下的等級，文字面不動", async () => {
    // 4 張 3000 → 共 12000；預算 7000：320×0.7=2240×4=8960 超過，320×0.6=1920×4=7680 超過，280×0.7=1960… 仍超過，240×0.7=1680×4=6720 放得下
    const deck = [0, 1, 2, 3].map((i) => group(img(3000 + i), "字", i));
    const out = await shrinkDeckForShare(deck, fakeReencode, 7000);
    expect(out.map((g) => g.faces[0].length)).toEqual(
      Array(4).fill(img(1680).length),
    );
    expect(out.every((g) => g.faces[1] === "字")).toBe(true);
    // 本機那副牌沒被改
    expect(deck[0].faces[0]).toBe(img(3000));
  });

  it("同一張圖出現兩次只重壓一次、兩邊用同一份", async () => {
    const same = img(5000);
    const deck = [group(same, same, 0)];
    let calls = 0;
    const out = await shrinkDeckForShare(
      deck,
      async (...a) => (calls++, fakeReencode(...a)),
      3000,
    );
    expect(out[0].faces[0]).toBe(out[0].faces[1]);
    expect(calls).toBe(1);
  });
});
