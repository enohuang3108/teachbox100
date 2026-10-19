import { describe, expect, it } from "vitest";
import { chineseVoices, questionVoice } from "./speech";

const voice = (voiceURI: string, lang: string, name = voiceURI): SpeechSynthesisVoice => ({
  voiceURI, lang, name, default: false, localService: true,
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

  it("瀏覽器有 Google 中文聲音時只列 Google 的，沒有時列全部中文聲音", () => {
    const meijia = voice("meijia", "zh-TW");
    const tw = voice("g-tw", "zh-TW", "Google 國語（臺灣）");
    const hk = voice("g-hk", "zh-HK", "Google 粤語（香港）");
    const cn = voice("g-cn", "zh-CN", "Google 普通话（中国大陆）");
    const english = voice("g-en", "en-US", "Google US English");
    expect(chineseVoices([meijia, tw, hk, cn, english])).toEqual([tw, hk, cn]);
    expect(chineseVoices([meijia, english])).toEqual([meijia]);
    expect(questionVoice([meijia, tw, hk], "meijia")).toBe(tw);
  });
});
