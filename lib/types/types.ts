// 硬幣相關類型
export interface Coin {
  value: number;
  name: string;
}

// 難度級別類型
export type DifficultyLevel = "easy" | "medium" | "hard";

// 遊戲答案相關類型
export interface GameAnswer {
  value: number | string;
  isCorrect: boolean;
}
