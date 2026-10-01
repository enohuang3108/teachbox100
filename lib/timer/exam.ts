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

export const MAX_SUBJECT_LENGTH = 20;
const HHMM = /^\d{2}:\d{2}$/;

export type ExamError = {
  message: string;
  /** 出錯的那一節，設定裡把那一列標紅 */
  slotId?: string;
};

/**
 * 設定時擋住開始的原因；沒問題回 undefined。
 * 時間表照列表順序檢查：每一節要在前一節結束之後才開始，排錯順序或重疊都擋。
 */
export function examError(
  date: string,
  slots: ExamSlot[],
  now: Date,
): ExamError | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { message: "請選考試日期" };
  if (date < isoDate(now)) return { message: "考試日期已經過了" };
  if (!slots.some((s) => !s.rest)) return { message: "至少要有一節考試" };

  for (const [i, s] of slots.entries()) {
    const at = (message: string) => ({ message, slotId: s.id });
    const name = s.subject.trim();
    if (!name) return at(`第 ${i + 1} 節還沒填名稱`);
    if (name.length > MAX_SUBJECT_LENGTH) {
      return at(`名稱最多 ${MAX_SUBJECT_LENGTH} 個字`);
    }
    if (!HHMM.test(s.start) || !HHMM.test(s.end)) {
      return at(`${name}的時間還沒填完`);
    }
    if (slotSeconds(s) <= 0) return at(`${name}的結束時間要晚於開始時間`);
    const prev = slots[i - 1];
    if (prev && toMinutes(s.start) < toMinutes(prev.end)) {
      return at(`${name}要在${prev.subject.trim()}結束（${prev.end}）之後開始`);
    }
  }

  const last = slots.at(-1)!;
  if (isOver(last, now, date)) return { message: "今天的考試時間都已經過了" };
}

export type ExamState = {
  /** 畫面上亮起來的那節；時間表空的時候是 -1 */
  index: number;
  remaining: number;
  total: number;
  /** 正在這節的時段內。兩節之間、全部考完都是 false */
  running: boolean;
};

/**
 * 整個考試模式只看牆上時鐘：在哪節時段內就倒數那節（午休也算），
 * 還沒開考就倒數到下一節開始，全部考完停在最後一節歸零。
 */
export function examState(
  slots: ExamSlot[],
  now: Date,
  date = isoDate(now),
): ExamState {
  const t = secondsSince(date, now);
  const start = (s: ExamSlot) => toMinutes(s.start) * 60;
  const end = (s: ExamSlot) => toMinutes(s.end) * 60;

  const active = slots.findIndex((s) => t >= start(s) && t < end(s));
  if (active >= 0) {
    const s = slots[active];
    return {
      index: active,
      remaining: end(s) - t,
      total: slotSeconds(s),
      running: true,
    };
  }

  const pickBy = (
    ok: (s: ExamSlot) => boolean,
    better: (a: ExamSlot, b: ExamSlot) => boolean,
  ) =>
    slots.reduce(
      (best, s, i) =>
        ok(s) && (best < 0 || better(s, slots[best])) ? i : best,
      -1,
    );

  const next = pickBy(
    (s) => start(s) > t,
    (a, b) => start(a) < start(b),
  );
  if (next >= 0) {
    // 還沒開考就倒數到開始；環從上一節結束起算，第一節之前沒有起點就是滿的
    const remaining = start(slots[next]) - t;
    const prev = pickBy(
      (s) => end(s) <= t,
      (a, b) => end(a) > end(b),
    );
    const total = prev >= 0 ? start(slots[next]) - end(slots[prev]) : remaining;
    return { index: next, remaining, total, running: false };
  }
  const last = pickBy(
    () => true,
    (a, b) => end(a) >= end(b),
  );
  return {
    index: last,
    remaining: 0,
    total: last >= 0 ? slotSeconds(slots[last]) : 0,
    running: false,
  };
}

/** 開考後顯示「考試開始」的秒數 */
export const START_BANNER_SECONDS = 5;

/** 剛開考的那幾秒回傳科目名稱，錶面換成開考畫面；其他時候（含午休開始）回 null */
export function startBanner(
  slots: ExamSlot[],
  state: ExamState,
): string | null {
  const slot = slots[state.index];
  if (!slot || slot.rest || !state.running) return null;
  return state.total - state.remaining < START_BANNER_SECONDS
    ? slot.subject
    : null;
}

/** 這節已經考完（結束時間過了） */
/** 這節已經開始（開始時間到了，可能也已經考完） */
export function hasStarted(
  slot: ExamSlot,
  now: Date,
  date = isoDate(now),
): boolean {
  return secondsSince(date, now) >= toMinutes(slot.start) * 60;
}

export function isOver(
  slot: ExamSlot,
  now: Date,
  date = isoDate(now),
): boolean {
  return secondsSince(date, now) >= toMinutes(slot.end) * 60;
}

/** 本地日期 "YYYY-MM-DD"，跟 <input type="date"> 同格式 */
export function isoDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/**
 * 從考試日期那天 00:00 到現在幾秒。考試日還沒到是負的、過了就超過一天，
 * 節次比較照樣成立：還沒到就倒數到第一節，過了就全部考完。
 */
function secondsSince(date: string, now: Date): number {
  const [y, m, d] = date.split("-").map(Number);
  const base = new Date(y, m - 1, d);
  // 日期壞掉就當今天
  if (Number.isNaN(base.getTime())) return secondsSince(isoDate(now), now);
  return (now.getTime() - base.getTime()) / 1000;
}
