import { describe, expect, it } from "vitest";
import { clockChoices, clockText, isClockAnswerCorrect, parseKeypadTime, randomClockTime } from "./game";

describe("學習讀時鐘", () => {
  it("只出上午：0–11 時，分鐘與秒都落在鐘面範圍", () => {
    expect(randomClockTime("am", () => 0)).toEqual({ hour: 0, minute: 0, second: 0 });
    expect(randomClockTime("am", () => 0.999)).toEqual({ hour: 11, minute: 59, second: 59 });
  });

  it("只出下午：12–23 時", () => {
    expect(randomClockTime("pm", () => 0).hour).toBe(12);
    expect(randomClockTime("pm", () => 0.999).hour).toBe(23);
  });

  it("隨機上下午：0–23 時", () => {
    expect(randomClockTime("random", () => 0).hour).toBe(0);
    expect(randomClockTime("random", () => 0.999).hour).toBe(23);
  });

  it("作答比較時與分，秒數不同不影響答案", () => {
    expect(isClockAnswerCorrect({ hour: 8, minute: 30, second: 42 }, { hour: 8, minute: 30, second: 0 })).toBe(true);
    expect(isClockAnswerCorrect({ hour: 8, minute: 30, second: 0 }, { hour: 8, minute: 31, second: 0 })).toBe(false);
  });
});

describe("學習讀時鐘的作答方式", () => {
  it("12 小時制下 12 點與 0 點是同一個鐘面位置", () => {
    expect(isClockAnswerCorrect({ hour: 0, minute: 5, second: 0 }, { hour: 12, minute: 5, second: 0 }, false)).toBe(true);
    expect(isClockAnswerCorrect({ hour: 0, minute: 5, second: 0 }, { hour: 12, minute: 5, second: 0 }, true)).toBe(false);
  });

  it("數字鍵盤：最後兩碼是分，前面是時；不到三碼還不算作答", () => {
    expect(parseKeypadTime("930")).toEqual({ hour: 9, minute: 30, second: 0 });
    expect(parseKeypadTime("1205")).toEqual({ hour: 12, minute: 5, second: 0 });
    expect(parseKeypadTime("93")).toBeNull();
    expect(parseKeypadTime("975")).toBeNull();
  });

  it("選擇題：四個不重複選項，正確答案一定在裡面", () => {
    for (const answer of [
      { hour: 0, minute: 0, second: 0 },
      { hour: 11, minute: 55, second: 0 },
      { hour: 23, minute: 30, second: 0 },
    ]) {
      const choices = clockChoices(answer, answer.hour > 11);
      expect(choices).toHaveLength(4);
      expect(new Set(choices.map((c) => `${c.hour}:${c.minute}`)).size).toBe(4);
      expect(choices.some((c) => isClockAnswerCorrect(answer, c))).toBe(true);
    }
  });

  it("選項文字：12 小時制 0 點顯示 12 點，整點不念分", () => {
    expect(clockText({ hour: 0, minute: 0, second: 0 }, false)).toBe("12 點");
    expect(clockText({ hour: 15, minute: 5, second: 0 }, true)).toBe("下午 3 點 5 分");
  });
});
