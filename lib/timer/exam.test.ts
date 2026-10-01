import { describe, expect, it } from "vitest";
import {
  examState,
  startBanner,
  hasStarted,
  slotSeconds,
  toMinutes,
  examError,
  type ExamSlot,
} from "./exam";

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

  describe("examState 依牆上時鐘自動切換", () => {
    const day: ExamSlot[] = [
      { id: "a", subject: "國文", start: "10:00", end: "10:40" },
      { id: "r", subject: "午休", start: "12:00", end: "13:00", rest: true },
      { id: "b", subject: "數學", start: "13:00", end: "13:40" },
    ];
    const t = (h: number, m: number, s = 0) => new Date(2026, 0, 1, h, m, s);

    it("還沒開始：倒數到第一節開考，環是滿的", () => {
      expect(examState(day, t(9, 0))).toEqual({
        index: 0,
        remaining: 3600,
        total: 3600,
        running: false,
      });
    });

    it("考試中：剩下時間是到結束的真實秒數", () => {
      expect(examState(day, t(10, 30, 15))).toMatchObject({
        index: 0,
        remaining: 585,
        running: true,
      });
    });

    it("兩節之間：倒數到下一節開始，環從上一節結束算起", () => {
      expect(examState(day, t(11, 0))).toEqual({
        index: 1,
        remaining: 3600,
        total: 4800,
        running: false,
      });
    });

    it("午休中也會倒數，結束那一刻直接換下一科", () => {
      expect(examState(day, t(12, 30))).toMatchObject({
        index: 1,
        remaining: 1800,
        running: true,
      });
      expect(examState(day, t(13, 0))).toMatchObject({
        index: 2,
        remaining: 2400,
        running: true,
      });
    });

    it("考試日期在明天：今晚就倒數到明天第一節", () => {
      expect(examState(day, t(21, 45), "2026-01-02")).toEqual({
        index: 0,
        remaining: 12 * 3600 + 15 * 60,
        total: 12 * 3600 + 15 * 60,
        running: false,
      });
    });

    it("考試日期已經過了：全部考完", () => {
      expect(examState(day, t(9, 0), "2025-12-31")).toMatchObject({
        index: 2,
        remaining: 0,
        running: false,
      });
    });

    it("開考後 5 秒內顯示開考畫面，午休開始不顯示", () => {
      const at = (d: Date) => startBanner(day, examState(day, d));
      expect(at(t(9, 59, 59))).toBeNull();
      expect(at(t(10, 0, 0))).toBe("國文");
      expect(at(t(10, 0, 4))).toBe("國文");
      expect(at(t(10, 0, 5))).toBeNull();
      expect(at(t(12, 0, 1))).toBeNull();
      expect(at(t(13, 0, 1))).toBe("數學");
    });

    it("全部考完：停在最後一節、歸零", () => {
      expect(examState(day, t(15, 0))).toMatchObject({
        index: 2,
        remaining: 0,
        running: false,
      });
    });
  });

  describe("examError 設定表單檢查", () => {
    const now = new Date(2026, 0, 1, 8, 0);
    const ok = "2026-01-01";
    const err = (date: string, list: ExamSlot[], at = now) =>
      examError(date, list, at);

    it("正常的時間表沒有錯誤", () => {
      expect(err(ok, slots)).toBeUndefined();
    });

    it("日期沒選、已經過了", () => {
      expect(err("", slots)?.message).toBe("請選考試日期");
      expect(err("2025-12-31", slots)?.message).toBe("考試日期已經過了");
    });

    it("至少要有一節考試，午休不算", () => {
      expect(err(ok, [{ ...slots[0], rest: true }])?.message).toBe(
        "至少要有一節考試",
      );
    });

    it("名稱要填、不能太長，錯誤指到那一節", () => {
      expect(err(ok, [slots[0], { ...slots[1], subject: " " }])).toEqual({
        message: "第 2 節還沒填名稱",
        slotId: "b",
      });
      expect(
        err(ok, [{ ...slots[0], subject: "國".repeat(21) }])?.message,
      ).toBe("名稱最多 20 個字");
    });

    it("時間沒填完、結束不晚於開始", () => {
      expect(err(ok, [{ ...slots[0], end: "" }])?.message).toBe(
        "國文的時間還沒填完",
      );
      expect(err(ok, [{ ...slots[0], end: "10:00" }])?.message).toBe(
        "國文的結束時間要晚於開始時間",
      );
    });

    it("節次要照時間順序、不能重疊", () => {
      // 截圖裡的情況：午休排到晚上十點，後面的數學卻是下午一點
      const bad: ExamSlot[] = [
        { id: "a", subject: "國文", start: "22:02", end: "22:03" },
        { id: "r", subject: "午休", start: "22:03", end: "22:04", rest: true },
        { id: "b", subject: "數學", start: "13:00", end: "13:40" },
      ];
      expect(err(ok, bad)).toEqual({
        message: "數學要在午休結束（22:04）之後開始",
        slotId: "b",
      });
      expect(
        err(ok, [slots[0], { ...slots[1], start: "10:30" }])?.message,
      ).toBe("數學要在國文結束（10:40）之後開始");
      // 前一節結束那一刻接著開始是可以的
      expect(
        err(ok, [slots[0], { ...slots[1], start: "10:40" }]),
      ).toBeUndefined();
    });

    it("今天的考試時間全部已經過了", () => {
      expect(err(ok, slots, new Date(2026, 0, 1, 12, 0))?.message).toBe(
        "今天的考試時間都已經過了",
      );
    });
  });

  it("開考判斷：開始那一刻就算開始，跟著考試日期走", () => {
    expect(hasStarted(slots[0], new Date(2026, 0, 1, 9, 59))).toBe(false);
    expect(hasStarted(slots[0], new Date(2026, 0, 1, 10, 0))).toBe(true);
    expect(
      hasStarted(slots[0], new Date(2026, 0, 1, 23, 0), "2026-01-02"),
    ).toBe(false);
  });
});
