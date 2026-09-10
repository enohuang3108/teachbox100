import { describe, expect, it } from "vitest";
import { isClockAnswerCorrect, randomClockTime } from "./game";

describe("學習讀時鐘", () => {
  it("12 小時制只出 0–11 時，分鐘與秒都落在鐘面範圍", () => {
    expect(randomClockTime(false, () => 0.999)).toEqual({ hour: 11, minute: 59, second: 59 });
  });

  it("24 小時制可出下午時段，仍不會超出時間範圍", () => {
    expect(randomClockTime(true, () => 0.999)).toEqual({ hour: 23, minute: 59, second: 59 });
  });

  it("作答比較時與分，秒數不同不影響答案", () => {
    expect(isClockAnswerCorrect({ hour: 8, minute: 30, second: 42 }, { hour: 8, minute: 30, second: 0 })).toBe(true);
    expect(isClockAnswerCorrect({ hour: 8, minute: 30, second: 0 }, { hour: 8, minute: 31, second: 0 })).toBe(false);
  });
});
