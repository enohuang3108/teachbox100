import { Coin } from "../types/types";

// 遊戲中使用的硬幣
export const AVAILABLE_COINS: Coin[] = [
  { value: 1, name: "1元" },
  { value: 5, name: "5元" },
  { value: 10, name: "10元" },
  { value: 50, name: "50元" },
];

// 難度等級設定
export const DIFFICULTY_SETTINGS = {
  easy: { maxCoins: 3, maxValue: 20 },
  medium: { maxCoins: 5, maxValue: 50 },
  hard: { maxCoins: 7, maxValue: 100 },
};
