"use client";

import { realisticEffect } from "@/lib/helpers/confetti-effects";
import { useSound } from "@/lib/hooks/useSound";
import { pickIndex, defaultRng } from "@/lib/monopoly/rng";
import { rotationFor, SPIN_MS } from "@/lib/wheel/game";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 一輪抽選的進行狀態。規則在 lib/wheel/game，這裡只管時序。
 * entries 是老師設定的完整名單；removed 記「已抽走」的原始 index，盤面只畫剩下的。
 */
export function useWheel(
  entries: string[],
  soundOn: boolean,
  removeOnPick: boolean,
) {
  const [rotation, setRotation] = useState(0);
  const [spinMs, setSpinMs] = useState(SPIN_MS);
  const [spinning, setSpinning] = useState(false);
  const [removed, setRemoved] = useState<ReadonlySet<number>>(new Set());
  /** 抽中的原始 index；null 表示沒有待處理的結果 */
  const [result, setResult] = useState<number | null>(null);
  const pending = useRef<number | null>(null);
  const pendingLabel = useRef<string | null>(null);
  /** 這一輪抽過的名字，照順序 */
  const [history, setHistory] = useState<string[]>([]);
  const { playSpinLoop, playBonusSound } = useSound();

  const active = entries
    .map((label, index) => ({ label, index }))
    .filter((e) => !removed.has(e.index));

  // 結果直接留在畫面上，不另外跳窗；下一次轉的時候才把上一個抽到的拿掉，
  // 所以這裡用「拿掉之後」的名單抽，不能用還沒重畫的 active
  const spin = useCallback(() => {
    if (spinning) return;
    const nextRemoved =
      result !== null && removeOnPick ? new Set(removed).add(result) : removed;
    const pool = entries
      .map((label, index) => ({ label, index }))
      .filter((e) => !nextRemoved.has(e.index));
    setRemoved(nextRemoved);
    setResult(null);
    if (pool.length < 2) return;
    const slot = pickIndex(pool.length, defaultRng);
    pending.current = pool[slot].index;
    pendingLabel.current = pool[slot].label;
    // 減少動態：不轉直接揭曉；transition 時間跟著歸零，指標還是會指對格
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setSpinMs(reduced ? 0 : SPIN_MS);
    setRotation((r) => rotationFor(slot, pool.length, r, defaultRng));
    setSpinning(true);
  }, [spinning, result, removeOnPick, removed, entries]);

  useEffect(() => {
    if (!spinning) return;
    const loop = soundOn ? playSpinLoop() : null;
    const t = window.setTimeout(() => {
      loop?.stop();
      setSpinning(false);
      setResult(pending.current);
      // 抽中當下就記名字，不在 effect deps 放 entries（每次 render 都是新陣列，計時會一直重來）
      const label = pendingLabel.current;
      if (label !== null) setHistory((h) => [...h, label]);
      if (soundOn) playBonusSound();
      realisticEffect();
    }, spinMs + 60);
    return () => {
      loop?.stop();
      window.clearTimeout(t);
    };
  }, [spinning, spinMs, soundOn, playSpinLoop, playBonusSound]);

  const restoreAll = () => {
    setRemoved(new Set());
    setResult(null);
    setHistory([]);
  };

  return {
    active,
    rotation,
    spinMs,
    spinning,
    result: result === null ? null : entries[result],
    removedCount: removed.size,
    history,
    spin,
    restoreAll,
  };
}
