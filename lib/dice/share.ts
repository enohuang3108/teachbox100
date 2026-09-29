import { clean, defineCodec, fail, GS, num, rows, US } from "@/lib/share/codec";
import { MAX_DICE, MIN_DICE, type DiceMode } from "./game";

export interface DiceSetup {
  count: number;
  mode: DiceMode;
  faces: string[];
}

// 文字骰的六面以 GS 分隔；數字骰也帶著六面，對方切到文字骰時看到的是同一份
export const diceShare = defineCodec<DiceSetup>(
  (s) => ["1", s.count, s.mode, s.faces.map(clean).join(GS)].join(US),
  (text) => {
    const [[, count, mode, faces = ""]] = rows(text, "1");
    const n = num(count);
    const list = faces.split(GS);
    if (!Number.isInteger(n) || n < MIN_DICE || n > MAX_DICE) fail();
    if (mode !== "number" && mode !== "text") fail();
    if (list.length !== 6) fail();
    return { count: n, mode, faces: list };
  },
);
