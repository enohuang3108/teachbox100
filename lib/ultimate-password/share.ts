import { questionFrom, questionRow } from "@/lib/questions/share";
import type { Difficulty, Question } from "@/lib/questions/types";
import { DIFFICULTIES } from "@/lib/questions/types";
import { clean, defineCodec, fail, RS, US } from "@/lib/share/codec";
import { DEFAULT_BOUNDS, rangeError, TIME_LIMITS, type TimeLimit } from "./game";

/** bank 為 null 代表用內建題庫，連結就不用塞整份題目 */
export interface UltimatePasswordSetup {
  bank: Question[] | null;
  cap: Difficulty;
  /** 題庫名稱；收到的人在清單裡看得到選了哪份 */
  title?: string;
  low: number;
  high: number;
  minutes: TimeLimit;
}

const VERSION = "1";

export const ultimatePasswordShare = defineCodec<UltimatePasswordSetup>(
  (s) =>
    [
      // 範圍與限時接在題庫名稱後面（沒名稱留空位）；舊連結沒有這三欄就用預設
      [VERSION, s.cap[0], s.bank ? "c" : "d", s.bank && s.title ? clean(s.title) : "", s.low, s.high, s.minutes].join(US),
      ...(s.bank ?? []).map(questionRow),
    ].join(RS),
  (text) => {
    const [head, ...rows] = text.split(RS);
    const h = head.split(US);
    if (h[0] !== VERSION) fail();
    const cap = DIFFICULTIES.find((d) => d[0] === h[1]) ?? fail();
    const low = h[4] === undefined ? DEFAULT_BOUNDS.low : Number(h[4]);
    const high = h[5] === undefined ? DEFAULT_BOUNDS.high : Number(h[5]);
    if (rangeError({ low, high })) fail();
    const minutes = h[6] === undefined ? 0 : (TIME_LIMITS.find((m) => String(m) === h[6]) ?? fail());
    return {
      ...(h[3] ? { title: h[3] } : {}),
      cap,
      low,
      high,
      minutes,
      bank: h[2] === "d" ? null : rows.map(questionFrom),
    };
  },
);
