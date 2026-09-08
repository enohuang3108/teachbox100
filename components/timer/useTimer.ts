"use client";

import { useSound } from "@/lib/hooks/useSound";
import { addSeconds, MAX_SECONDS } from "@/lib/timer/timer";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 倒數以 deadline（絕對時間）為準，每 100ms 只是重新讀時鐘。
 * 用累加 tick 的話，分頁切到背景被瀏覽器節流，回來就少算好幾秒。
 */
export function useTimer(soundOn: boolean) {
  const [total, setTotal] = useState(300);
  const [remaining, setRemaining] = useState(300);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const deadline = useRef(0);
  const { playBonusSound } = useSound();

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const left = (deadline.current - Date.now()) / 1000;
      if (left <= 0) {
        setRemaining(0);
        setRunning(false);
        setDone(true);
      } else {
        setRemaining(left);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [running]);

  // 響鈴：三聲，間隔 520ms。開關關掉就整段不播。
  useEffect(() => {
    if (!done || !soundOn) return;
    const ids = [0, 520, 1040].map((d) => window.setTimeout(playBonusSound, d));
    return () => ids.forEach(window.clearTimeout);
  }, [done, soundOn, playBonusSound]);

  const start = useCallback(() => {
    if (remaining <= 0) return;
    deadline.current = Date.now() + remaining * 1000;
    setDone(false);
    setRunning(true);
  }, [remaining]);

  const pause = useCallback(() => setRunning(false), []);

  const setSeconds = useCallback((s: number) => {
    const v = Math.min(MAX_SECONDS, Math.max(0, s));
    setRunning(false);
    setDone(false);
    setTotal(v);
    setRemaining(v);
  }, []);

  /** 加時間：走到一半也能加，running 時同步把 deadline 往後推 */
  const bump = useCallback(
    (delta: number) => {
      setDone(false);
      setRemaining((prev) => {
        const next = addSeconds(prev, delta);
        if (running) deadline.current = Date.now() + next * 1000;
        return next;
      });
      setTotal((prev) => Math.max(prev, addSeconds(remaining, delta)));
    },
    [running, remaining],
  );

  /** 響完鈴後的「再一次」：回到設定的長度並立刻開始，不用按兩下 */
  const restart = useCallback(() => {
    deadline.current = Date.now() + total * 1000;
    setRemaining(total);
    setDone(false);
    setRunning(true);
  }, [total]);

  const reset = useCallback(() => {
    setRunning(false);
    setDone(false);
    setRemaining(total);
  }, [total]);

  return {
    total,
    remaining,
    running,
    done,
    start,
    pause,
    setSeconds,
    bump,
    reset,
    restart,
  };
}
