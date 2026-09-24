import { questionFrom, questionRow } from "@/lib/questions/share";
import type { Difficulty, Question } from "@/lib/questions/types";
import { DIFFICULTIES } from "@/lib/questions/types";
import { defineCodec, fail, RS, US } from "@/lib/share/codec";

/** bank 為 null 代表用內建題庫，連結就不用塞整份題目 */
export interface MorseSetup {
  bank: Question[] | null;
  cap: Difficulty;
}

const VERSION = "1";

export const morseShare = defineCodec<MorseSetup>(
  (s) =>
    [
      [VERSION, s.cap[0], s.bank ? "c" : "d"].join(US),
      ...(s.bank ?? []).map(questionRow),
    ].join(RS),
  (text) => {
    const [head, ...rows] = text.split(RS);
    const h = head.split(US);
    if (h[0] !== VERSION) fail();
    const cap = DIFFICULTIES.find((d) => d[0] === h[1]) ?? fail();
    return { cap, bank: h[2] === "d" ? null : rows.map(questionFrom) };
  },
);
