import { describe, expect, it } from "vitest";
import { DEFAULT_ICHIBAN_PRIZES, buildTicketPool, normalizePrizes, prizeTotal } from "./prizes";

describe("一番賞獎項設定", () => {
  it("提供可直接使用的預設獎項與內容", () => {
    expect(DEFAULT_ICHIBAN_PRIZES[0]).toEqual({
      rank: "A賞",
      name: "星空投影燈",
      quantity: 1,
    });
    expect(DEFAULT_ICHIBAN_PRIZES).toHaveLength(3);
    expect(prizeTotal(DEFAULT_ICHIBAN_PRIZES)).toBe(7);
  });

  it("只保留填寫完整的獎項，沒有有效內容時回復預設", () => {
    expect(
      normalizePrizes([
        { rank: " 特賞 ", name: " 精美禮物 ", quantity: 3.7 },
        { rank: "", name: "遺漏獎項", quantity: 1 },
      ]),
    ).toEqual([{ rank: "A賞", name: "精美禮物", quantity: 4 }]);
    expect(normalizePrizes([{ rank: "", name: "", quantity: 0 }])).toEqual(
      DEFAULT_ICHIBAN_PRIZES,
    );
  });

  it("卡池張數等於剩餘張數，已抽完的獎項不會出現", () => {
    const pool = buildTicketPool(DEFAULT_ICHIBAN_PRIZES, [1, 2]);
    expect(pool).toHaveLength(4);
    expect(pool.filter((index) => index === 0)).toHaveLength(0);
    expect(pool.filter((index) => index === 1)).toHaveLength(1);
    expect(pool.filter((index) => index === 2)).toHaveLength(3);
  });
});
