import { questionFrom, questionRow } from "@/lib/questions/share";
import type { Difficulty, Question } from "@/lib/questions/types";
import { DIFFICULTIES, SPEECH_RATES } from "@/lib/questions/types";
import { clean, defineCodec, fail, RS, US } from "@/lib/share/codec";
import { BOARD_SIZES, type BoardSize } from "./rules";
import { COUNTDOWNS, type Countdown } from "./store";

/** bank 為 null 代表用內建題庫，連結就不用塞整份題目 */
export interface TerritorySetup {
  bank: Question[] | null;
  cap: Difficulty;
  names: [string, string];
  countdown: Countdown;
  size: BoardSize;
  /** 舊連結才有：朗讀偏好改成裝置共用，不再隨連結帶走，收到也不套用；欄位留著讓題庫名稱的位置不變 */
  reading?: boolean;
  speechRate?: number;
  voiceURI?: string;
  /** 題庫名稱；收到的人在清單裡看得到選了哪份 */
  title?: string;
}

const VERSION = "1";

export const territoryShare = defineCodec<TerritorySetup>(
  (s) =>
    [
      [
        VERSION,
        s.cap[0],
        clean(s.names[0]),
        clean(s.names[1]),
        s.bank ? "c" : "d",
        String(s.countdown),
        s.size,
        ...(s.reading !== undefined || s.speechRate !== undefined || s.voiceURI !== undefined || s.title !== undefined
          ? [s.reading === false ? "0" : "1", String(s.speechRate ?? 0.9), clean(s.voiceURI ?? "")]
          : []),
        ...(s.title !== undefined ? [clean(s.title)] : []),
      ].join(US),
      ...(s.bank ?? []).map(questionRow),
    ].join(RS),
  (text) => {
    const [head, ...rows] = text.split(RS);
    const h = head.split(US);
    if (h[0] !== VERSION) fail();
    const cap = DIFFICULTIES.find((d) => d[0] === h[1]) ?? fail();
    // 第 6、7 欄是後來加的倒數秒數與場地大小；舊連結沒有就用 3 秒、自動
    const countdown =
      h[5] === undefined ? 3 : (COUNTDOWNS.find((c) => String(c) === h[5]) ?? fail());
    const size = h[6] === undefined ? "auto" : h[6] in BOARD_SIZES ? (h[6] as BoardSize) : fail();
    const speech = h[7] === undefined ? {} : {
      reading: h[7] === "1" ? true : h[7] === "0" ? false : fail(),
      speechRate: SPEECH_RATES.find((rate) => String(rate) === h[8]) ?? fail(),
      voiceURI: h[9] ?? "",
    };
    return {
      ...speech,
      ...(h[10] === undefined ? {} : { title: h[10] }),
      cap,
      names: [h[2] ?? "", h[3] ?? ""],
      countdown,
      size,
      bank: h[4] === "d" ? null : rows.map(questionFrom),
    };
  },
);
