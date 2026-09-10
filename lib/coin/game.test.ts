import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/lib/constants/products";
import { AVAILABLE_COINS } from "@/lib/constants/game";
import {
  createChangeQuestion,
  createPaymentQuestion,
  createShelfProducts,
  generateChoices,
  generateRandomCoins,
  sumValues,
} from "./game";

describe("金錢單元的出題", () => {
  it("付款題的商品價格不超過老師設定的上限，且在商品的價格區間內", () => {
    const question = createPaymentQuestion(50, () => 0.99);

    expect(question.price).toBeLessThanOrEqual(50);
    expect(question.price).toBeGreaterThanOrEqual(question.product.priceRange[0]);
    expect(question.price).toBeLessThanOrEqual(question.product.priceRange[1]);
  });

  it("找零題的售價是正數，實付金額不小於售價，找零能剛好算出來", () => {
    const question = createChangeQuestion(300, () => 0);

    expect(question.price).toBeGreaterThan(0);
    expect(question.paid).toBeGreaterThanOrEqual(question.price);
    expect(question.change).toBe(question.paid - question.price);
  });

  it("購物商品架只放價格上限內、且價格仍在商品原始區間的商品", () => {
    const shelf = createShelfProducts(100, () => 0);

    expect(shelf).toHaveLength(5);
    for (const item of shelf) {
      expect(item.currentPrice).toBeLessThanOrEqual(100);
      expect(item.currentPrice).toBeGreaterThanOrEqual(item.priceRange[0]);
      expect(item.currentPrice).toBeLessThanOrEqual(item.priceRange[1]);
    }
  });

  it("金額加總、等值判定使用所有選到的面額", () => {
    expect(sumValues([{ value: 50 }, { value: 10 }, { value: 1 }])).toBe(61);
  });

  it("價值題只使用老師啟用的面額，總額不超過上限", () => {
    const coins = generateRandomCoins([10, 50], true, 30, 120, () => 0);

    expect(coins).not.toHaveLength(0);
    expect(coins.every((coin) => [10, 50].includes(coin.value))).toBe(true);
    expect(sumValues(coins)).toBeGreaterThanOrEqual(30);
    expect(sumValues(coins)).toBeLessThanOrEqual(120);
    expect(coins.map((coin) => coin.value)).toEqual([...coins.map((coin) => coin.value)].sort((a, b) => a - b));
  });

  it("價值題四個選項皆為正數且不重複，包含正確答案", () => {
    const choices = generateChoices(80, () => 0.7);

    expect(choices).toHaveLength(4);
    expect(new Set(choices).size).toBe(4);
    expect(choices.every((choice) => choice > 0)).toBe(true);
    expect(choices).toContain(80);
  });
});

it("商品資料至少有可在最低設定金額下使用的商品", () => {
  expect(PRODUCTS.some((product) => product.priceRange[0] <= 10)).toBe(true);
});

it("認識新臺幣單元提供完整且不重複的教學面額", () => {
  expect(AVAILABLE_COINS.map((coin) => coin.value)).toEqual([
    1, 5, 10, 50, 100, 200, 500, 1000, 2000,
  ]);
  expect(new Set(AVAILABLE_COINS.map((coin) => coin.name)).size).toBe(AVAILABLE_COINS.length);
});
