"use client";

import { useEffect, useRef, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export { SPEECH_RATES } from "@/lib/questions/types";

export interface SpeechPreferences {
  reading: boolean;
  speechRate: number;
  voiceURI: string;
}

/** Chrome 另附 Google 線上聲音，有就只列 Google 國語、粵語、普通話；其他瀏覽器列系統中文聲音。 */
export function chineseVoices(voices: readonly SpeechSynthesisVoice[]) {
  const chinese = voices.filter((voice) => /^zh(?:[-_]|$)/i.test(voice.lang));
  const google = chinese.filter((voice) => voice.name.startsWith("Google"));
  return google.length ? google : chinese;
}

/** 聲音屬於裝置；分享或換機找不到原聲音時，回到台灣華語、其他中文。 */
export function questionVoice(allVoices: readonly SpeechSynthesisVoice[], voiceURI: string) {
  const voices = chineseVoices(allVoices);
  return voices.find((voice) => voice.voiceURI === voiceURI)
    ?? voices.find((voice) => /^zh[-_]TW$/i.test(voice.lang))
    ?? voices.find((voice) => /^zh(?:[-_]|$)/i.test(voice.lang));
}

interface SpeechStore extends SpeechPreferences {
  setReading: (reading: boolean) => void;
  setSpeechRate: (speechRate: number) => void;
  setVoiceURI: (voiceURI: string) => void;
}

/** 朗讀偏好跟著老師與這台裝置走，所有出題遊戲共用一份 */
export const useSpeechStore = create<SpeechStore>()(
  persist(
    (set) => ({
      reading: true,
      speechRate: 0.9,
      voiceURI: "",
      setReading: (reading) => set({ reading }),
      setSpeechRate: (speechRate) => set({ speechRate }),
      setVoiceURI: (voiceURI) => set({ voiceURI }),
    }),
    { name: "question-speech" },
  ),
);

/**
 * 唸一段題目，結束、失敗或放棄時呼叫 onDone 一次；回傳的函式停止朗讀並不再回呼。
 * 自然結束時不 cancel —— 中斷音訊尾端會爆音。有些瀏覽器不回報自動播放被擋：
 * 未開始先等五秒，開始後留足長題時間。
 */
export function speakQuestion(
  text: string,
  { speechRate, voiceURI }: Pick<SpeechPreferences, "speechRate" | "voiceURI">,
  onDone: () => void,
): () => void {
  const synth = window.speechSynthesis;
  if (!synth || !window.SpeechSynthesisUtterance) {
    onDone();
    return () => {};
  }
  let active = true;
  let endedNaturally = false;
  let watchdog: number;
  const finish = () => {
    if (!active) return;
    active = false;
    window.clearTimeout(watchdog);
    onDone();
  };
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-TW";
  const voice = questionVoice(synth.getVoices(), voiceURI);
  if (voice) utterance.voice = voice;
  utterance.rate = speechRate;
  utterance.onend = () => {
    endedNaturally = true;
    finish();
  };
  utterance.onerror = finish;
  watchdog = window.setTimeout(finish, 5000);
  utterance.onstart = () => {
    if (!active) return;
    window.clearTimeout(watchdog);
    watchdog = window.setTimeout(finish, Math.max(60_000, text.length * 1000 / speechRate));
  };
  try {
    synth.speak(utterance);
  } catch {
    finish();
  }
  return () => {
    active = false;
    window.clearTimeout(watchdog);
    utterance.onstart = null;
    utterance.onend = null;
    utterance.onerror = null;
    if (!endedNaturally) synth.cancel();
  };
}

/**
 * 出題時自動唸題目。current 換成另一個物件（換題、重抽同一題）就重唸；回傳 true 表示還在唸，
 * 遊戲這段時間先不開放作答。靜音、關閉朗讀或沒有題目時直接回 false。
 */
export function useQuestionReading(current: object | null, text: string, sound: boolean) {
  const { reading, speechRate, voiceURI } = useSpeechStore();
  const [doneFor, setDoneFor] = useState<object | null>(null);
  const on = current !== null && reading && sound;
  useEffect(() => {
    if (!on) return;
    return speakQuestion(text, { speechRate, voiceURI }, () => setDoneFor(current));
    // 換聲音或語速不重唸這一題
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, current]);
  return on && doneFor !== current;
}

/**
 * 按了才唸：兩隊各看各的題目時不能自動唸，交給老師點。再按一次從頭唸；
 * active 變 false（靜音、打開設定）、換題或離開畫面就停。關掉或不能唸時回 null，不顯示喇叭
 */
export function useReadAloud(active: boolean, current: object | null) {
  const { reading, speechRate, voiceURI } = useSpeechStore();
  const stop = useRef<(() => void) | null>(null);
  useEffect(() => () => stop.current?.(), [active, current]);
  return reading && active
    ? (text: string) => {
        stop.current?.();
        stop.current = speakQuestion(text, { speechRate, voiceURI }, () => {
          stop.current = null;
        });
      }
    : null;
}
