// 硬幣相關類型
export interface Coin {
  value: number;
  name: string;
}

// 遊戲答案相關類型
export interface GameAnswer {
  value: number | string;
  isCorrect: boolean;
}
