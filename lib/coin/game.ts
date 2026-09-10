import { AVAILABLE_COINS } from "@/lib/constants/game";
import { PRODUCTS, type Product } from "@/lib/constants/products";
import type { Coin } from "@/lib/types/types";

export type Rng = () => number;

const MIN_COINS = 3;
const MAX_COINS = 20;
const CHOICE_RANGE = 300;

export const sumValues = <T extends { value: number }>(items: T[]): number =>
  items.reduce((sum, item) => sum + item.value, 0);

const pick = <T>(items: T[], rng: Rng): T => {
  if (items.length === 0) throw new RangeError("沒有可用的項目");
  return items[Math.floor(rng() * items.length)];
};

const integerBetween = (min: number, max: number, rng: Rng): number =>
  min + Math.floor(rng() * (max - min + 1));

const shuffle = <T>(items: T[], rng: Rng): T[] => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const swap = Math.floor(rng() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
};

export const availableCoinsFor = (values: number[]): Coin[] =>
  AVAILABLE_COINS.filter((coin) => values.includes(coin.value));

/** 付款題：商品與隨機價格都必須符合老師設定的金額上限。 */
export function createPaymentQuestion(
  maxAmount: number,
  rng: Rng = Math.random,
  products: Product[] = PRODUCTS,
): { product: Product; price: number } {
  const candidates = products.filter((product) => product.priceRange[0] <= maxAmount);
  const product = pick(candidates, rng);
  const [min, max] = product.priceRange;
  return { product, price: integerBetween(min, Math.min(max, maxAmount), rng) };
}

export const findClosestPaidAmount = (price: number): number => {
  if (price <= 50) return 50;
  if (price <= 100) return 100;
  return Math.ceil(price / 100) * 100;
};

/** 找零題：售價至少一元，實付金額永遠足以付款。 */
export function createChangeQuestion(maxAmount: number, rng: Rng = Math.random) {
  if (maxAmount < 1) throw new RangeError("金額上限至少要一元");
  const price = integerBetween(1, maxAmount, rng);
  const paid = findClosestPaidAmount(price);
  return { price, paid, change: paid - price };
}

export type ShelfProduct = Product & { currentPrice: number };

/** 購物題只顯示在上限內仍有合法售價的商品，避免把 800 元商品標成 300 元。 */
export function createShelfProducts(
  maxAmount: number,
  rng: Rng = Math.random,
  count = 5,
  products: Product[] = PRODUCTS,
): ShelfProduct[] {
  return shuffle(
    products.filter((product) => product.priceRange[0] <= maxAmount),
    rng,
  )
    .slice(0, count)
    .map((product) => {
      const [min, max] = product.priceRange;
      return {
        ...product,
        currentPrice: integerBetween(min, Math.min(max, maxAmount), rng),
      };
    });
}

export function generateRandomCoins(
  enabledCoinValues: number[],
  ordered: boolean,
  minAmount: number,
  maxAmount: number,
  rng: Rng = Math.random,
): Coin[] {
  const available = availableCoinsFor(enabledCoinValues);
  if (available.length === 0) return [];

  let fallback: Coin[] = [];
  for (let attempt = 0; attempt < 50; attempt++) {
    const result: Coin[] = [];
    let total = 0;
    const eligible = () => available.filter((coin) => total + coin.value <= maxAmount);

    for (let i = 0; i < MIN_COINS; i++) {
      const choices = eligible();
      if (choices.length === 0) break;
      const coin = pick(choices, rng);
      result.push(coin);
      total += coin.value;
    }

    const target = integerBetween(minAmount, maxAmount, rng);
    while (total < target && result.length < MAX_COINS) {
      if (result.length >= MIN_COINS && rng() < 0.15) break;
      const choices = eligible();
      if (choices.length === 0) break;
      const coin = pick(choices, rng);
      result.push(coin);
      total += coin.value;
    }

    if (ordered) result.sort((a, b) => a.value - b.value);
    if (total >= minAmount) return result;
    if (total > sumValues(fallback)) fallback = result;
  }
  return fallback;
}

/** 四選一的正確答案與三個可辨識、正數且不重複的選項。 */
export function generateChoices(correctAnswer: number, rng: Rng = Math.random): number[] {
  const choices = [correctAnswer];
  while (choices.length < 4) {
    let candidate = correctAnswer + integerBetween(-CHOICE_RANGE, CHOICE_RANGE, rng);
    while (candidate <= 0 || choices.includes(candidate)) candidate++;
    choices.push(candidate);
  }
  return shuffle(choices, rng);
}
