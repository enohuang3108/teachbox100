import { describe, expect, it } from "vitest";
import { parseQuestions, type RawRow } from "./excel";

const choiceRow: RawRow = {
  題型: "選擇",
  題目: "台灣最高的山是？",
  選項A: "玉山",
  選項B: "雪山",
  選項C: "合歡山",
  選項D: "阿里山",
  正確答案: "A",
  解析: "玉山3952公尺",
};

describe("parseQuestions", () => {
  it("解析選擇題，正確答案字母轉為選項文字", () => {
    const r = parseQuestions([choiceRow]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.questions[0]).toMatchObject({
        type: "choice",
        text: "台灣最高的山是？",
        options: ["玉山", "雪山", "合歡山", "阿里山"],
        answer: "玉山",
      });
    }
  });

  it("是非題", () => {
    const r = parseQuestions([
      { 題型: "是非", 題目: "台北是首都", 正確答案: "是" },
    ]);
    expect(r.ok).toBe(true);
    if (r.ok)
      expect(r.questions[0]).toMatchObject({ type: "boolean", answer: "是" });
  });

  it("簡答題", () => {
    const r = parseQuestions([
      { 題型: "簡答", 題目: "最長河川？", 正確答案: "濁水溪" },
    ]);
    expect(r.ok).toBe(true);
    if (r.ok)
      expect(r.questions[0]).toMatchObject({ type: "short", answer: "濁水溪" });
  });

  it("題型非法 → 回報錯誤列號", () => {
    const r = parseQuestions([{ 題型: "填空", 題目: "x", 正確答案: "y" }]);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors[0].row).toBe(2); // 第1列表頭，資料從第2列起
      expect(r.errors[0].message).toContain("題型");
    }
  });

  it("選擇題答案對應的選項不存在 → 錯誤", () => {
    const r = parseQuestions([{ ...choiceRow, 正確答案: "D", 選項D: "" }]);
    expect(r.ok).toBe(false);
  });

  it("缺少題目 → 錯誤", () => {
    const r = parseQuestions([{ 題型: "是非", 題目: "", 正確答案: "是" }]);
    expect(r.ok).toBe(false);
  });

  it("收集所有錯誤列，不是只回第一個", () => {
    const r = parseQuestions([
      { 題型: "填空", 題目: "x", 正確答案: "y" },
      { 題型: "是非", 題目: "", 正確答案: "是" },
    ]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.length).toBe(2);
  });

  it("空陣列 → 錯誤（題庫不可為空）", () => {
    const r = parseQuestions([]);
    expect(r.ok).toBe(false);
  });

  it("選擇題答案直接給選項文字也可", () => {
    const r = parseQuestions([{ ...choiceRow, 正確答案: "合歡山" }]);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.questions[0].answer).toBe("合歡山");
  });

  it("選擇題答案文字不在選項中 → 錯誤", () => {
    const r = parseQuestions([{ ...choiceRow, 正確答案: "聖母峰" }]);
    expect(r.ok).toBe(false);
  });

  it("選擇題不足兩個選項 → 錯誤", () => {
    const r = parseQuestions([
      { 題型: "選擇", 題目: "x", 選項A: "甲", 正確答案: "A" },
    ]);
    expect(r.ok).toBe(false);
  });

  it("是非題答案為否（接受別名）", () => {
    const r = parseQuestions([
      { 題型: "是非", 題目: "地球是平的", 正確答案: "錯" },
    ]);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.questions[0].answer).toBe("否");
  });

  it("是非題答案非法 → 錯誤", () => {
    const r = parseQuestions([{ 題型: "是非", 題目: "x", 正確答案: "也許" }]);
    expect(r.ok).toBe(false);
  });

  it("缺少正確答案 → 錯誤", () => {
    const r = parseQuestions([{ 題型: "簡答", 題目: "x", 正確答案: "" }]);
    expect(r.ok).toBe(false);
  });
});
