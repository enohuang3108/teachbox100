/** 考試時間表：一節課用牆上時鐘的起訖時間表示，不是倒數長度。 */

export type ExamSlot = {
  id: string;
  subject: string;
  start: string;
  end: string;
  /** 午休這類不考試的段落：清單上畫成分隔線，不能選 */
  rest?: boolean;
};

export const EXAM_STORAGE_KEY = "timer.examSlots";
export const EXAM_WARN_KEY = "timer.examWarnMin";

/** 考試模式預設剩 10 分鐘轉紅，跟一般計時器的 10 秒不同 */
export const DEFAULT_WARN_MIN = 10;

export const DEFAULT_SLOTS: ExamSlot[] = [
  { id: "s1", subject: "國文", start: "10:00", end: "10:40" },
  { id: "s2", subject: "午休", start: "12:00", end: "13:00", rest: true },
  { id: "s3", subject: "數學", start: "13:00", end: "13:40" },
];

/** "HH:MM" -> 當日分鐘數；格式壞掉回 0 */
export function toMinutes(hhmm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return 0;
  return Math.min(24 * 60, Number(m[1]) * 60 + Number(m[2]));
}

/** 一節的長度（秒）。跨午夜不支援，倒著填就當 0。 */
export function slotSeconds(slot: ExamSlot): number {
  return Math.max(0, (toMinutes(slot.end) - toMinutes(slot.start)) * 60);
}

/** 現在正在考的那節；午休不算，都不在範圍內回 -1 */
export function currentSlotIndex(slots: ExamSlot[], now: Date): number {
  const nowMin = minutesOfDay(now);
  return slots.findIndex(
    (s) => !s.rest && nowMin >= toMinutes(s.start) && nowMin < toMinutes(s.end),
  );
}

function minutesOfDay(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}
