import { defineCodec, fail, flag, readFlag, rows, US } from "@/lib/share/codec";
import type { ClockPeriod } from "./game";

export type ClockAnswerMethod = "digit" | "multiple" | "keypad";

export interface ClockSetup {
  period: ClockPeriod;
  showMinuteHint: boolean;
  answerMethod: ClockAnswerMethod;
}

const PERIODS: ClockPeriod[] = ["am", "pm", "random"];
const METHODS: ClockAnswerMethod[] = ["digit", "multiple", "keypad"];

export const clockShare = defineCodec<ClockSetup>(
  (s) => ["1", s.period, flag(s.showMinuteHint), s.answerMethod].join(US),
  (text) => {
    const [[, period, hint, method]] = rows(text, "1");
    if (!PERIODS.includes(period as ClockPeriod)) fail();
    if (!METHODS.includes(method as ClockAnswerMethod)) fail();
    return {
      period: period as ClockPeriod,
      showMinuteHint: readFlag(hint),
      answerMethod: method as ClockAnswerMethod,
    };
  },
);
