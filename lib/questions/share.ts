import { clean, fail, GS, num, US } from "@/lib/share/codec";
import {
  DIFFICULTIES,
  type Difficulty,
  type Question,
  type QuestionType,
} from "./types";

/**
 * 題目在分享連結裡的寫法。題庫格式全站共用（ADR-0001），連結裡的編碼也只有這一份 ——
 * 兩個單元各寫一次，改欄位時就會有一邊沒跟上。
 *
 * 一題一列，欄位以 US 分隔，選項以 GS 分隔。
 */

const TYPE_CODE: Record<QuestionType, string> = {
  choice: "c",
  boolean: "b",
  short: "s",
};

export const diffCode = (d: Difficulty | undefined) => (d ? d[0] : "");
export const readDiff = (s: string | undefined) =>
  s ? DIFFICULTIES.find((d) => d[0] === s) : undefined;

export function questionRow(q: Question): string {
  return [
    TYPE_CODE[q.type],
    clean(q.text),
    (q.options ?? []).map(clean).join(GS),
    // 選擇題存選項索引，不重複存一份答案文字
    q.options ? q.options.indexOf(q.answer) : clean(q.answer),
    clean(q.explanation ?? ""),
    diffCode(q.difficulty),
  ].join(US);
}

export function questionFrom(row: string, i: number): Question {
  const [t, text, opts, answer, explanation, d] = row.split(US);
  const type = (Object.keys(TYPE_CODE) as QuestionType[]).find(
    (k) => TYPE_CODE[k] === t,
  );
  if (!type || !text) fail();
  const options = type === "choice" ? opts.split(GS) : undefined;
  const difficulty = readDiff(d);
  return {
    id: `q${i}`,
    type,
    text,
    ...(options && { options }),
    answer: options ? (options[num(answer)] ?? fail()) : answer,
    ...(explanation && { explanation }),
    ...(difficulty && { difficulty }),
  };
}
