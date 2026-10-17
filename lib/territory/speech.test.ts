import { describe, expect, it } from "vitest";
import { questionVoice } from "./speech";

const voice = (voiceURI: string, lang: string): SpeechSynthesisVoice => ({
  voiceURI, lang, name: voiceURI, default: false, localService: true,
});

describe("領地戰朗讀聲音", () => {
  it("優先採用老師選定的聲音，換裝置找不到時回到台灣華語、其他中文", () => {
    const female = voice("female", "zh-TW");
    const male = voice("male", "zh-CN");
    const english = voice("english", "en-US");
    expect(questionVoice([english, female, male], "male")).toBe(male);
    expect(questionVoice([english, female, male], "missing")).toBe(female);
    expect(questionVoice([english, male], "missing")).toBe(male);
    expect(questionVoice([english], "missing")).toBeUndefined();
  });
});
