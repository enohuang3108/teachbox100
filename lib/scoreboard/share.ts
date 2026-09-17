import { clean, defineCodec, fail, num, RS, rows, US } from "@/lib/share/codec";
import { STEPS, TONES, type ToneKey } from "./store";

/** 分數不分享：拿到連結的班級從 0 分開始 */
export interface ScoreboardSetup {
  names: string[];
  step: number;
  tone: ToneKey;
  hueSeed: number;
}

export const scoreboardShare = defineCodec<ScoreboardSetup>(
  (s) =>
    [["1", s.step, s.tone, s.hueSeed].join(US), ...s.names.map(clean)].join(RS),
  (text) => {
    const [[, step, tone, hueSeed], ...names] = rows(text, "1");
    if (!(STEPS as readonly number[]).includes(num(step))) fail();
    if (!Object.hasOwn(TONES, tone)) fail();
    return {
      names: names.map(([name = ""]) => name),
      step: num(step),
      tone: tone as ToneKey,
      hueSeed: num(hueSeed),
    };
  },
);
