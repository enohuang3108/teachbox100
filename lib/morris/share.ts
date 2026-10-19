import { questionFrom, questionRow } from "@/lib/questions/share";
import type { Difficulty, Question } from "@/lib/questions/types";
import { DIFFICULTIES } from "@/lib/questions/types";
import { clean, defineCodec, fail, RS, US } from "@/lib/share/codec";

/** bank 為 null 代表使用內建題庫，分享連結不重複攜帶內建內容。 */
export interface MorrisSetup {
  bank: Question[] | null;
  cap: Difficulty;
  /** 固定為紅隊、藍隊的顯示名稱。 */
  names: [string, string];
  /** 題庫名稱；收到的人在清單裡看得到選了哪份 */
  title?: string;
}

const VERSION = "1";

export const morrisShare = defineCodec<MorrisSetup>(
  (setup) =>
    [
      [
        VERSION,
        setup.cap[0],
        clean(setup.names[0]),
        clean(setup.names[1]),
        setup.bank ? "c" : "d",
        ...(setup.bank && setup.title ? [clean(setup.title)] : []),
      ].join(US),
      ...(setup.bank ?? []).map(questionRow),
    ].join(RS),
  (text) => {
    const [head, ...rows] = text.split(RS);
    const fields = head.split(US);
    // 第 6 欄題庫名稱是後來加的，舊連結沒有
    if ((fields.length !== 5 && fields.length !== 6) || fields[0] !== VERSION) fail();
    const cap = DIFFICULTIES.find((difficulty) => difficulty[0] === fields[1]) ?? fail();
    const names = [fields[2], fields[3]] as [string, string];
    if (names.some((name) => !name.trim() || name.length > 12)) fail();
    const source = fields[4];
    if (source !== "c" && source !== "d") fail();
    if (source === "d" && rows.length > 0) fail();
    if (rows.some((row) => row.split(US).length !== 6)) fail();
    return {
      ...(fields[5] ? { title: fields[5] } : {}),
      cap,
      names,
      bank: source === "d" ? null : rows.map(questionFrom),
    };
  },
);
