"use client";

import { realisticEffect } from "@/lib/helpers/confetti-effects";
import { useSound } from "@/lib/hooks/useSound";
import {
  buildBoard,
  isMatch,
  PREVIEW_MS,
  WRONG_PAIR_MS,
  type Card,
  type PairGroup,
} from "@/lib/memory/game";
import { defaultRng } from "@/lib/monopoly/rng";
import { useCallback, useEffect, useState } from "react";

/** 一局的進行狀態：翻開哪些、配到哪些、翻了幾次。規則在 lib/memory/game，這裡只管時序。 */
export function useMemoryGame(deck: PairGroup[], previewOn: boolean, soundOn: boolean) {
  const [cards, setCards] = useState<Card[]>([]);
  const [faceUp, setFaceUp] = useState<string[]>([]);
  const [matched, setMatched] = useState<ReadonlySet<string>>(new Set());
  const [flips, setFlips] = useState(0);
  const [previewing, setPreviewing] = useState(false);
  const { playCorrectSound, playWrongSound } = useSound();

  const start = useCallback(() => {
    setCards(buildBoard(deck, defaultRng));
    setFaceUp([]);
    setMatched(new Set());
    setFlips(0);
    setPreviewing(previewOn);
  }, [deck, previewOn]);

  useEffect(() => {
    if (!previewing) return;
    const t = window.setTimeout(() => setPreviewing(false), PREVIEW_MS);
    return () => window.clearTimeout(t);
  }, [previewing]);

  // 第二張翻開就判定：對了立刻收進 matched（牌留著），錯了留 900ms 再蓋回去
  useEffect(() => {
    if (faceUp.length !== 2) return;
    const [a, b] = faceUp.map((id) => cards.find((c) => c.id === id)!);
    const hit = isMatch(a, b);
    if (soundOn) (hit ? playCorrectSound : playWrongSound)();
    if (hit) {
      setMatched((m) => new Set(m).add(a.groupId));
      setFaceUp([]);
      return;
    }
    const t = window.setTimeout(() => setFaceUp([]), WRONG_PAIR_MS);
    return () => window.clearTimeout(t);
  }, [faceUp, cards, soundOn, playCorrectSound, playWrongSound]);

  const done = cards.length > 0 && matched.size === deck.length;
  useEffect(() => {
    if (done) realisticEffect();
  }, [done]);

  const select = (card: Card) => {
    if (previewing || faceUp.length === 2) return;
    if (matched.has(card.groupId) || faceUp.includes(card.id)) return;
    const next = [...faceUp, card.id];
    if (next.length === 2) setFlips((f) => f + 1);
    setFaceUp(next);
  };

  const touched = flips > 0 || faceUp.length > 0;

  return { cards, faceUp, matched, flips, previewing, done, touched, start, select };
}
