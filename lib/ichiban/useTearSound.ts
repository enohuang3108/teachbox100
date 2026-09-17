"use client";

import { useCallback, useEffect, useRef } from "react";
import { useIchibanStore } from "./store";
import { shouldPlayTearTick, tearSoundSegment } from "./tear";

function makeClickNoise(context: AudioContext) {
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.025), context.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = (Math.random() * 2 - 1) * (1 - index / samples.length);
  }
  return buffer;
}

/** 撕封條時每前進一格只播放一次短促「噠」聲，像拉鍊齒一格一格咬合。 */
export function useTearSound() {
  const contextRef = useRef<AudioContext | null>(null);
  const lastToothRef = useRef(0);

  const getContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    contextRef.current ??= new AudioContext();
    return contextRef.current;
  }, []);

  const playTooth = useCallback(() => {
    if (!useIchibanStore.getState().sound) return;
    const context = getContext();
    if (!context) return;
    const now = context.currentTime;

    // 一點點高頻雜訊加上短促音高，像塑膠拉鍊卡進下一齒，而不會像撕紙。
    const source = context.createBufferSource();
    source.buffer = makeClickNoise(context);
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1850;
    filter.Q.value = 1.7;
    const noiseGain = context.createGain();
    noiseGain.gain.setValueAtTime(0.075, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
    source.connect(filter).connect(noiseGain).connect(context.destination);

    const oscillator = context.createOscillator();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(960, now);
    oscillator.frequency.exponentialRampToValueAtTime(620, now + 0.03);
    const toneGain = context.createGain();
    toneGain.gain.setValueAtTime(0.045, now);
    toneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
    oscillator.connect(toneGain).connect(context.destination);

    source.start(now);
    source.stop(now + 0.03);
    oscillator.start(now);
    oscillator.stop(now + 0.04);
  }, [getContext]);

  const start = useCallback(() => {
    lastToothRef.current = 0;
    void getContext()?.resume();
  }, [getContext]);

  const move = useCallback(
    (progress: number) => {
      const segment = tearSoundSegment(progress);
      if (segment <= lastToothRef.current) {
        // 往回拉不出聲；重新向右前進時，從新的位置重新計算下一格。
        lastToothRef.current = segment;
        return;
      }
      for (let next = lastToothRef.current + 1; next <= segment; next += 1) {
        if (shouldPlayTearTick(next)) playTooth();
      }
      lastToothRef.current = segment;
    },
    [playTooth],
  );

  const stop = useCallback(() => {
    lastToothRef.current = 0;
  }, []);

  useEffect(() => () => {
    void contextRef.current?.close();
  }, []);

  return { start, move, stop };
}
