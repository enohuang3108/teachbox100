// 亂數來源：回傳 [0, 1) 的數。預設用 Math.random，測試時注入固定序列。
export type Rng = () => number;

export const defaultRng: Rng = () => Math.random();

// 用固定序列建立可決定性 rng（測試用）。耗盡後從頭循環。
export function seqRng(values: number[]): Rng {
  let i = 0;
  return () => {
    const v = values[i % values.length];
    i++;
    return v;
  };
}

// 擲一顆 1~6 的骰子
export function rollOne(rng: Rng): number {
  return Math.floor(rng() * 6) + 1;
}

// 從陣列隨機取一個 index
export function pickIndex(length: number, rng: Rng): number {
  return Math.floor(rng() * length);
}
