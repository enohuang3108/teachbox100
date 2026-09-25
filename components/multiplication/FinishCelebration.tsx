"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { StageConfetti } from "@/components/organisms/StageConfetti";
import {
  originOf,
  paperBurst,
  paperCannons,
} from "@/lib/helpers/confetti-effects";
import { useSound } from "@/lib/hooks/useSound";
import { celebration } from "@/lib/math/multiplication";

/**
 * 九九乘法一輪結束：分數從 0 一格一格跳上去，停住時彈一下、貼上紙膠帶。
 * 答對八成以上才撒紙屑，全對再補兩側的砲。要重播就換 key。
 */
export function FinishCelebration({
  correct,
  count,
  sound,
}: {
  correct: number;
  count: number;
  sound: boolean;
}) {
  const cheer = celebration(correct, count);
  const score = useRef<HTMLDivElement>(null);
  const { playVictorySound, playCountdownTick } = useSound();

  // 一題一格，最多 1.2 秒跳完；--hit 是停住的那一刻，彈跳、紙屑、音效、紙膠帶都對著它
  const step = Math.min(90, 1200 / Math.max(correct, 1));
  const hit = Math.round(step * correct) + 120;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const done = sound ? setTimeout(playVictorySound, hit) : undefined;
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      setShown(n);
      if (sound) playCountdownTick();
      if (n >= correct) clearInterval(id);
    }, step);
    if (correct === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      clearInterval(id);
      setShown(correct);
    }
    return () => {
      clearInterval(id);
      clearTimeout(done);
    };
    // 只在這一次揭曉時排一次，音量變動不重播
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="flex w-full flex-col items-center"
      style={{ "--hit": `${hit}ms` } as CSSProperties}
    >
      {cheer.confetti && (
        <StageConfetti
          onReady={(fire) => {
            const timers: ReturnType<typeof setTimeout>[] = [
              setTimeout(() => paperBurst(fire, originOf(score.current), 240, 200), hit),
            ];
            if (cheer.cannons)
              timers.push(setTimeout(() => timers.push(paperCannons(fire, 1200)), hit + 300));
            return () => timers.forEach(clearTimeout);
          }}
        />
      )}
      <div
        ref={score}
        className="cheer-pop font-display text-[clamp(5rem,16vw,10rem)] leading-none font-black tabular-nums text-foreground"
      >
        {shown}
        <span className="text-muted-foreground">/{count}</span>
      </div>
      <p className="victory-tape mt-6 w-[min(100%,36rem)] bg-primary px-6 py-3 text-center text-[clamp(2rem,5vw,3.5rem)] font-black leading-tight text-primary-foreground">
        {cheer.label}
      </p>
    </div>
  );
}
