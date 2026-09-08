import { describe, expect, it } from "vitest";
import {
  currentSlotIndex,
  slotSeconds,
  toMinutes,
  type ExamSlot,
} from "./exam";

const at = (h: number, m: number) => new Date(2026, 0, 1, h, m);
const slots: ExamSlot[] = [
  { id: "a", subject: "國文", start: "10:00", end: "10:40" },
  { id: "b", subject: "數學", start: "11:00", end: "11:40" },
];

describe("exam", () => {
  it("解析時間", () => {
    expect(toMinutes("10:40")).toBe(640);
    expect(toMinutes("亂寫")).toBe(0);
  });

  it("節次長度，倒著填當 0", () => {
    expect(slotSeconds(slots[0])).toBe(2400);
    expect(slotSeconds({ ...slots[0], end: "09:00" })).toBe(0);
  });

  it("找出目前節次，結束那一刻就不算，午休不算一節", () => {
    expect(currentSlotIndex(slots, at(10, 30))).toBe(0);
    expect(currentSlotIndex(slots, at(11, 39))).toBe(1);
    expect(currentSlotIndex(slots, at(10, 40))).toBe(-1);
    const withRest = [{ ...slots[0], rest: true }, slots[1]];
    expect(currentSlotIndex(withRest, at(10, 30))).toBe(-1);
  });
});
