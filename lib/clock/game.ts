import type { ClockTime } from "@/components/atoms/Clock";

export type Rng = () => number;

/** 依教師的 12／24 小時設定產生可讀的鐘面時間。 */
export function randomClockTime(is24HourClock: boolean, rng: Rng = Math.random): ClockTime {
  return {
    hour: Math.floor(rng() * (is24HourClock ? 24 : 12)),
    minute: Math.floor(rng() * 60),
    second: Math.floor(rng() * 60),
  };
}

/** 孩子只需要讀到分鐘；秒數不納入作答。 */
export const isClockAnswerCorrect = (answer: ClockTime, selected: ClockTime): boolean =>
  answer.hour === selected.hour && answer.minute === selected.minute;
