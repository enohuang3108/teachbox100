// 骰子的規則：顆數、擲出的點數、文字骰的六面。UI 只負責畫與播放拋擲動作。
import { rollOne, type Rng } from "@/lib/monopoly/rng";

export const MIN_DICE = 1;
/** 烘焙好的拋擲軌跡只有 1–6 顆（design/dice/create_dice_throws.py） */
export const MAX_DICE = 6;
/** 字要貼在骰面上、投影時後排看得清楚，兩行各三個字是極限 */
export const MAX_FACE_LENGTH = 6;

export type DiceMode = "number" | "text";

export const STARTER_FACES = [
  "跳三下",
  "拍手五下",
  "唱首歌",
  "學動物叫",
  "原地轉圈",
  "再擲一次",
];

export function rollDice(count: number, rng: Rng): number[] {
  const n = Math.min(MAX_DICE, Math.max(MIN_DICE, Math.round(count)));
  return Array.from({ length: n }, () => rollOne(rng));
}

export function validateFaces(faces: string[]): string | undefined {
  for (const [i, face] of faces.entries()) {
    const text = face.trim();
    if (!text) return `第 ${i + 1} 面還沒填`;
    if (Array.from(text).length > MAX_FACE_LENGTH)
      return `第 ${i + 1} 面超過 ${MAX_FACE_LENGTH} 個字`;
  }
  return undefined;
}

/** 擲出 value 點時畫面上要寫的字 */
export const faceLabel = (value: number, mode: DiceMode, faces: string[]) =>
  mode === "number" ? String(value) : faces[value - 1].trim();
