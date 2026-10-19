import { describe, expect, it } from "vitest";
import type { Question } from "@/lib/questions/types";
import { rowErrors, toBank, toRows } from "./bank-draft";

const choice: Question = { id: "c", type: "choice", text: "最高的山", options: ["雪山", "玉山"], answer: "玉山", difficulty: "easy" };
const yes: Question = { id: "b", type: "boolean", text: "地球是圓的", answer: "是" };

describe("題庫編輯器", () => {
  it("編輯後存回的題目與原本相同，取消勾選的題目記在 off", () => {
    const rows = toRows([choice, yes], ["b"]);
    expect(rows.map((r) => r.on)).toEqual([true, false]);
    expect(rowErrors(rows)).toEqual([null, null]);
    expect(toBank(rows)).toEqual({ questions: [choice, { ...yes, difficulty: "normal" }], off: ["b"] });
  });

  it("簡答題保留下來，答案空白要指出來", () => {
    const short: Question = { id: "s", type: "short", text: "最長的河", answer: "濁水溪", difficulty: "hard" };
    const [row] = toRows([short], []);
    expect(toBank([row]).questions).toEqual([short]);
    expect(rowErrors([{ ...row, answer: " " }])).toEqual(["答案還沒填"]);
  });

  it("改了正確選項的文字，答案跟著改；錯誤指到那一題", () => {
    const [row] = toRows([choice], []);
    row.options[1] = "玉山主峰";
    expect(toBank([row]).questions[0].answer).toBe("玉山主峰");
    expect(rowErrors([{ ...row, text: " " }, { ...row, options: ["玉山", "", "", ""], answer: "0" }, { ...row, answer: "3" }]))
      .toEqual(["題目還沒填", "選擇題至少要兩個選項", "正確答案的選項是空的"]);
  });
});
