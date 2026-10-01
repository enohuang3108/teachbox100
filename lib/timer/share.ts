import {
  clean,
  defineCodec,
  fail,
  flag,
  num,
  readFlag,
  rows,
  RS,
  US,
} from "@/lib/share/codec";
import { MAX_SECONDS } from "./timer";
import type { ExamSlot } from "./exam";

export type TimerMode = "timer" | "exam";

export interface TimerSetup {
  mode: TimerMode;
  /** 計時器模式的倒數長度 */
  seconds: number;
  /** 考試日期 "YYYY-MM-DD"：時間表只寫幾點，前一天晚上設好才不會被當成今天已經考完 */
  date: string;
  slots: ExamSlot[];
  warnMin: number;
}

const HHMM = /^\d{2}:\d{2}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

// 第一筆：版本、模式、秒數、提醒分鐘、考試日期；之後每筆一節：科目、開始、結束、是否休息
export const timerShare = defineCodec<TimerSetup>(
  (s) =>
    [
      ["1", s.mode, s.seconds, s.warnMin, s.date].join(US),
      ...s.slots.map((x) =>
        [clean(x.subject), x.start, x.end, flag(!!x.rest)].join(US),
      ),
    ].join(RS),
  (text) => {
    const [[, mode, seconds, warn, date = ""], ...list] = rows(text, "1");
    if (mode !== "timer" && mode !== "exam") fail();
    const sec = num(seconds);
    const warnMin = num(warn);
    if (sec < 0 || sec > MAX_SECONDS || warnMin < 0 || warnMin > 120) fail();
    if (!DATE.test(date) || !list.length) fail();
    const slots = list.map(([subject = "", start = "", end = "", rest], i) => {
      if (!HHMM.test(start) || !HHMM.test(end)) fail();
      const slot: ExamSlot = { id: `s${i}`, subject, start, end };
      if (readFlag(rest)) slot.rest = true;
      return slot;
    });
    return { mode, seconds: sec, warnMin, date, slots };
  },
);
