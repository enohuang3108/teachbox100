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
export function useWheel(entries: string[], soundOn: boolean) {
  const [rotation, setRotation] = useState(0);
  const [spinMs, setSpinMs] = useState(SPIN_MS);
  const [spinning, setSpinning] = useState(false);
  const [removed, setRemoved] = useState<ReadonlySet<number>>(new Set());
  /** 抽中的原始 index；null 表示沒有待處理的結果 */
  const [result, setResult] = useState<number | null>(null);
  const pending = useRef<number | null>(null);
  const { playCorrectSound } = useSound();

  const active = entries
    .map((label, index) => ({ label, index }))
    .filter((e) => !removed.has(e.index));

  const spin = useCallback(() => {
    if (spinning || active.length < 2) return;
    const slot = pickIndex(active.length, defaultRng);
    pending.current = active[slot].index;
    // 減少動態：不轉直接揭曉；transition 時間跟著歸零，指標還是會指對格
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setSpinMs(reduced ? 0 : SPIN_MS);
    setRotation((r) => rotationFor(slot, active.length, r, defaultRng));
    setSpinning(true);
  }, [spinning, active]);

  useEffect(() => {
    if (!spinning) return;
    const t = window.setTimeout(() => {
      setSpinning(false);
      setResult(pending.current);
      if (soundOn) playCorrectSound();
      realisticEffect();
    }, spinMs + 60);
    return () => window.clearTimeout(t);
  }, [spinning, spinMs, soundOn, playCorrectSound]);

  /** 收掉結果；removeIt 為 true 就把這個人從盤面拿掉 */
  const dismiss = (removeIt: boolean) => {
    if (result !== null && removeIt) setRemoved((s) => new Set(s).add(result));
    setResult(null);
  };

  const restoreAll = () => {
    setRemoved(new Set());
    setResult(null);
  };

  return {
    active,
    rotation,
    spinMs,
    spinning,
    result: result === null ? null : entries[result],
    removedCount: removed.size,
    spin,
    dismiss,
    restoreAll,
  };
}
