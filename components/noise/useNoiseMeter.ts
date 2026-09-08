"use client";

import { rms, smooth, toLevel } from "@/lib/noise/meter";
import { useCallback, useEffect, useRef, useState } from "react";

export type MicState = "idle" | "starting" | "on" | "denied" | "unsupported";

/**
 * 麥克風音量。整條鏈路都在瀏覽器裡，沒有任何音訊被錄下或送出。
 * 用 rAF 而不是 setInterval：跟畫面更新同步，切到背景分頁自動停。
 */
export function useNoiseMeter() {
  const [state, setState] = useState<MicState>("idle");
  const [level, setLevel] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef(0);

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    ctxRef.current?.close();
    streamRef.current = null;
    ctxRef.current = null;
    setLevel(0);
    setState("idle");
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setState("unsupported");
      return;
    }
    setState("starting");
    try {
      // 關掉自動增益與降噪，不然瀏覽器會替我們「修正」音量，讀數就不老實了
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      ctx.createMediaStreamSource(stream).connect(analyser);

      streamRef.current = stream;
      ctxRef.current = ctx;
      setState("on");

      const buf = new Float32Array(analyser.fftSize);
      let current = 0;
      const tick = () => {
        analyser.getFloatTimeDomainData(buf);
        current = smooth(current, toLevel(rms(buf)));
        setLevel(current);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setState("denied");
    }
  }, []);

  useEffect(() => stop, [stop]);

  return { state, level, start, stop };
}
