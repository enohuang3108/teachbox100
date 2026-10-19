"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Switch } from "@/components/atoms/shadcn/switch";
import { Button } from "@/components/atoms/shadcn/button";
import { chineseVoices, questionVoice, SPEECH_RATES, useSpeechStore } from "@/lib/questions/speech";

export function SpeechSettings() {
  const { reading, speechRate, voiceURI, setReading, setSpeechRate, setVoiceURI } = useSpeechStore();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [error, setError] = useState(false);
  // Firefox 核心（含 Zen）在 macOS 朗讀結尾會爆音，是瀏覽器本身的問題；設定視窗只在 client 開
  const [gecko] = useState(() => typeof navigator !== "undefined" && /firefox/i.test(navigator.userAgent));
  const previewing = useRef<SpeechSynthesisUtterance | null>(null);
  const id = useId();

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const update = () => setVoices(chineseVoices(synth.getVoices()));
    update();
    synth.addEventListener?.("voiceschanged", update);
    return () => {
      synth.removeEventListener?.("voiceschanged", update);
      if (previewing.current) { previewing.current = null; synth.cancel(); }
    };
  }, []);

  const stopPreview = () => {
    if (previewing.current) {
      previewing.current = null;
      window.speechSynthesis?.cancel();
    }
  };
  const preview = () => {
    stopPreview();
    setError(false);
    const synth = window.speechSynthesis;
    if (!synth || !window.SpeechSynthesisUtterance) { setError(true); return; }
    const utterance = new SpeechSynthesisUtterance("準備好了嗎？請仔細聽題目，倒數結束再作答。");
    utterance.lang = "zh-TW";
    utterance.rate = speechRate;
    const voice = questionVoice(synth.getVoices(), voiceURI);
    if (voice) utterance.voice = voice;
    utterance.onend = () => { if (previewing.current === utterance) previewing.current = null; };
    utterance.onerror = () => {
      if (previewing.current !== utterance) return;
      previewing.current = null;
      setError(true);
    };
    previewing.current = utterance;
    try { synth.speak(utterance); }
    catch { previewing.current = null; setError(true); }
  };

  return (
    <section aria-label="題目朗讀設定" className="space-y-4">
      <label htmlFor={`${id}-reading`} className="flex cursor-pointer items-center justify-between gap-4">
        <span className="text-body text-ink">題目朗讀</span>
        <Switch id={`${id}-reading`} checked={reading}
          onCheckedChange={(on) => { stopPreview(); setReading(on); }} />
      </label>
      <p className="text-caption text-muted-foreground">開啟後，出題時先唸題目，唸完才開放作答。頂列靜音會一併關閉朗讀。</p>
      {gecko && <p className="text-caption text-warning-ink">這個瀏覽器朗讀結尾可能會有爆音，建議改用 Chrome。</p>}
      <fieldset disabled={!reading} className="space-y-4 disabled:opacity-50">
        <label htmlFor={`${id}-rate`} className="flex flex-col gap-2">
          <span className="text-body text-ink">朗讀語速</span>
          <select id={`${id}-rate`} aria-label="朗讀語速" value={speechRate}
            onChange={(event) => { stopPreview(); setSpeechRate(Number(event.target.value)); }}
            className="min-h-11 rounded-xl border border-border bg-card px-3 py-2 text-body text-ink">
            {SPEECH_RATES.map((rate) => <option key={rate} value={rate}>{rate} 倍</option>)}
          </select>
        </label>
        <label htmlFor={`${id}-voice`} className="flex flex-col gap-2">
          <span className="text-body text-ink">朗讀聲音</span>
          <select id={`${id}-voice`} aria-label="朗讀聲音" value={voices.some((voice) => voice.voiceURI === voiceURI) ? voiceURI : ""}
            onChange={(event) => { stopPreview(); setVoiceURI(event.target.value); }}
            className="min-h-11 rounded-xl border border-border bg-card px-3 py-2 text-body text-ink">
            <option value="">預設中文聲音</option>
            {voices.map((voice) => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name}（{voice.lang}）</option>)}
          </select>
        </label>
        <p className="text-caption text-muted-foreground">男女聲依這台裝置提供的聲音而定，選擇後可按試聽確認。</p>
        {voiceURI && !voices.some((voice) => voice.voiceURI === voiceURI) && (
          <p className="text-caption text-warning-ink">這台裝置找不到原本的聲音，將使用預設中文聲音。</p>
        )}
        <Button type="button" variant="outline" onClick={preview} className="active:scale-[0.97]">試聽聲音</Button>
      </fieldset>
      {error && <p role="alert" className="text-caption text-danger-ink">目前無法播放聲音，請確認裝置的語音設定。</p>}
    </section>
  );
}
