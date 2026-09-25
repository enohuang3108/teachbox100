import { questionFrom, questionRow } from "@/lib/questions/share";
import type { Difficulty, Question } from "@/lib/questions/types";
import { DIFFICULTIES } from "@/lib/questions/types";
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
    return {
      cap,
      names: [h[2] ?? "", h[3] ?? ""],
      countdown,
      size,
      bank: h[4] === "d" ? null : rows.map(questionFrom),
    };
  },
);
