import type { ClockTime } from "@/components/atoms/Clock";

export type Rng = () => number;

/** 題目範圍：只出上午、只出下午，或上下午隨機（要分得出上下午才算對）。 */
export type ClockPeriod = "am" | "pm" | "random";

export function randomClockTime(period: ClockPeriod, rng: Rng = Math.random): ClockTime {
  return {
    hour: period === "random" ? Math.floor(rng() * 24) : Math.floor(rng() * 12) + (period === "pm" ? 12 : 0),
    minute: Math.floor(rng() * 60),
    second: Math.floor(rng() * 60),
  };
}

/** 孩子只需要讀到分鐘；秒數不納入作答。12 小時制下 12 點與 0 點指著同一格。 */
export const isClockAnswerCorrect = (
  answer: ClockTime,
  selected: ClockTime,
  is24HourClock = true,
): boolean =>
  (is24HourClock ? answer.hour === selected.hour : answer.hour % 12 === selected.hour % 12) &&
  answer.minute === selected.minute;

/** 數字鍵盤只有 0–9：按「9 3 0」是 9:30，最後兩碼固定是分。 */
export function parseKeypadTime(digits: string): ClockTime | null {
  if (digits.length < 3) return null;
  const hour = Number(digits.slice(0, -2));
  const minute = Number(digits.slice(-2));
  return minute < 60 ? { hour, minute, second: 0 } : null;
}

export function clockText({ hour, minute }: ClockTime, is24HourClock: boolean): string {
  const h12 = hour % 12 || 12;
  const prefix = is24HourClock ? `${hour < 12 ? "上午" : "下午"} ` : "";
  return `${prefix}${h12} 點${minute > 0 ? ` ${minute} 分` : ""}`;
}

/** 誘答選項取孩子常犯的錯：時針看成下一格或上一格、分針差一格（5 分）、長短針看反。 */
export function clockChoices(answer: ClockTime, is24HourClock: boolean, rng: Rng = Math.random): ClockTime[] {
  const hours = is24HourClock ? 24 : 12;
  const at = (hour: number, minute: number): ClockTime => ({
    hour: (hour + hours) % hours,
    minute: (minute + 60) % 60,
    second: 0,
  });
  const { hour, minute } = answer;
  const candidates = [
    at(hour + 1, minute),
    at(hour - 1, minute),
    at(hour, minute + 5),
    at(hour, minute - 5),
    at(Math.round(minute / 5) % 12 + (is24HourClock && hour >= 12 ? 12 : 0), (hour % 12) * 5),
  ].sort(() => rng() - 0.5);
  const choices = [at(hour, minute)];
  for (const c of candidates) {
    if (choices.length === 4) break;
    if (!choices.some((x) => x.hour === c.hour && x.minute === c.minute)) choices.push(c);
  }
  return choices.sort(() => rng() - 0.5);
}
