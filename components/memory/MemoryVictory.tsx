"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { Button } from "@/components/atoms/shadcn/button";
import { StageConfetti } from "@/components/organisms/StageConfetti";
import {
  originOf,
  paperBurst,
  paperCannons,
} from "@/lib/helpers/confetti-effects";
import { useSound } from "@/lib/hooks/useSound";

/** 最後一對配上後稍等一下，讓那對的彈跳先做完；紙屑、音效、紙膠帶都對著它 */
const HIT_MS = 420;

/**
 * 全部配對完成：跟圈叉搶答同一套收尾 —— 盤面淡成紙色、紙膠帶貼上來、紙屑從膠帶炸開再補兩側的砲，
 * 底下是再玩一次與設定。放在 @container 的盤面上，尺寸跟著盤面走。
 */
export function MemoryVictory({
  sound,
  onRestart,
  onSettings,
}: {
  sound: boolean;
  onRestart: () => void;
  onSettings: () => void;
}) {
  const tape = useRef<HTMLParagraphElement>(null);
  const { playVictorySound } = useSound();

  useEffect(() => {
    if (!sound) return;
    const t = setTimeout(playVictorySound, HIT_MS);
    return () => clearTimeout(t);
    // 只在這次揭曉排一次，音量變動不重播
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="absolute inset-0 z-10"
      style={{ "--hit": `${HIT_MS}ms` } as CSSProperties}
    >
      <StageConfetti
        onReady={(fire) => {
          const timers: ReturnType<typeof setTimeout>[] = [
            setTimeout(
              () => paperBurst(fire, originOf(tape.current), 240, 200),
              HIT_MS,
            ),
            setTimeout(
              () => timers.push(paperCannons(fire, 1200)),
              HIT_MS + 300,
            ),
          ];
          return () => timers.forEach(clearTimeout);
        }}
      />
      <div
        aria-hidden
        className="morris-win-fade bg-paper/70 absolute inset-0"
      />

      <div className="absolute inset-0 grid place-items-center p-[4cqw]">
        <div className="flex flex-col items-center">
          <p
            ref={tape}
            className="victory-tape bg-primary text-primary-foreground font-display px-[4cqw] py-[1cqw] text-[clamp(2rem,6cqw,5.5rem)] leading-tight font-extrabold"
          >
            全部配對完成！
          </p>
          <div className="victory-late mt-[2cqw] flex gap-[1cqw]">
            <Button
              size="lg"
              className="rounded-full active:scale-[0.97]"
              onClick={onRestart}
            >
              再玩一次
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full active:scale-[0.97]"
              onClick={onSettings}
            >
              設定
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
