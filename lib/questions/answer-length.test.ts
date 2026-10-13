import { describe, expect, it } from "vitest";
import { answerLengthWarnings } from "./answer-length";
import { aiQuestionPrompt, parseQuestions } from "./excel";

describe("答案長度提醒", () => {
  it("所有提示詞要求每個選項與答案最多 10 個字", () => {
    for (const allowShort of [true, false]) {
      expect(aiQuestionPrompt({ allowShort })).toContain("每個選項與答案最多 10 個字");
    }
  });
  it("超長選項與簡答保留，提醒指出題號與內容；10 字與 Unicode 不誤報", () => {
    const result = parseQuestions([
      { 題型: "選擇", 題目: "選一個", 選項A: "一二三四五六七八九十", 選項B: "一二三四五六七八九十百", 正確答案: "B" },
      { 題型: "簡答", 題目: "回答", 正確答案: "😀".repeat(10) },
      { 題型: "簡答", 題目: "回答", 正確答案: "長".repeat(11) },
    ]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.questions).toHaveLength(3);
    expect(result.questions[0].answer).toBe("一二三四五六七八九十百");
    expect(answerLengthWarnings(result.questions)).toEqual([
      { questionNumber: 1, label: "選項B", text: "一二三四五六七八九十百", length: 11 },
      { questionNumber: 3, label: "答案", text: "長".repeat(11), length: 11 },
    ]);
  });
});
