import { questionFrom, questionRow } from "@/lib/questions/share";
import type { Difficulty, Question } from "@/lib/questions/types";
import { DIFFICULTIES } from "@/lib/questions/types";
import { clean, defineCodec, fail, RS, US } from "@/lib/share/codec";

/** bank 為 null 代表用內建題庫，連結就不用塞整份題目 */
export interface TerritorySetup {
  bank: Question[] | null;
  cap: Difficulty;
  names: [string, string];
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
      ].join(US),
      ...(s.bank ?? []).map(questionRow),
    ].join(RS),
  (text) => {
    const [head, ...rows] = text.split(RS);
    const h = head.split(US);
    if (h[0] !== VERSION) fail();
    const cap = DIFFICULTIES.find((d) => d[0] === h[1]) ?? fail();
    return {
      cap,
      names: [h[2] ?? "", h[3] ?? ""],
      bank: h[4] === "d" ? null : rows.map(questionFrom),
    };
  },
);
