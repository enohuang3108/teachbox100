"use client";

import { useEffect, useId, useRef } from "react";
import { StageConfetti } from "@/components/organisms/StageConfetti";
import {
  originOf,
  paperBurst,
  paperCannons,
} from "@/lib/helpers/confetti-effects";
import { useSound } from "@/lib/hooks/useSound";

/** 鎖撐到這一刻炸開；搖晃、音效、紙屑都對著它排。改了要一起改 globals.css 的 --open */
const OPEN_MS = 820;
/** 搖晃期間的滴答，越來越密 */
const TENSION_TICKS = [150, 400, 580, 700];

/**
 * 破解成功：鎖越搖越兇、撐不住炸開 —— 鎖扣飛走、鎖身裂成兩半，
 * 密碼從中間彈出來，紙屑從鎖的位置炸開，再補兩側的砲與一條紙膠帶。
 */
export function WinCelebration({
  secret,
  sound,
}: {
  secret: number;
  sound: boolean;
}) {
  const lock = useRef<HTMLDivElement>(null);
  const clip = useId();
  const { playCountdownTick, playUnlockSound } = useSound();

  // 降低動態效果不等於靜音：畫面直接給結果，聲音照樣走完
  useEffect(() => {
    if (!sound) return;
    const timers = [
      ...TENSION_TICKS.map((ms) => setTimeout(playCountdownTick, ms)),
      setTimeout(playUnlockSound, OPEN_MS),
    ];
    return () => timers.forEach(clearTimeout);
    // 只在這一次揭曉時排一次，音量變動不重播
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sound]);

  return (
    <div className="password-win relative flex w-full flex-col items-center">
      <StageConfetti
        onReady={(fire) => {
          const timers: ReturnType<typeof setTimeout>[] = [
            setTimeout(
              () => paperBurst(fire, originOf(lock.current), 320, 360),
              OPEN_MS,
            ),
            setTimeout(
              () => timers.push(paperCannons(fire, 1200)),
              OPEN_MS + 340,
            ),
          ];
          return () => timers.forEach(clearTimeout);
        }}
      />
      <div className="relative grid size-56 place-items-center sm:size-64">
        <div ref={lock} className="unlock-tension absolute inset-0">
          <svg
            viewBox="0 0 120 140"
            className="size-full overflow-visible"
            aria-hidden="true"
          >
            <defs>
              <clipPath id={`${clip}l`}>
                <rect x="0" y="0" width="60" height="140" />
              </clipPath>
              <clipPath id={`${clip}r`}>
                <rect x="60" y="0" width="60" height="140" />
              </clipPath>
            </defs>
            <path
              className="unlock-fly"
              d="M32 64 V42 a28 28 0 0 1 56 0 V64"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            {(["l", "r"] as const).map((side) => (
              <g
                key={side}
                className={`unlock-half-${side}`}
                clipPath={`url(#${clip}${side})`}
              >
                <rect x="10" y="60" width="100" height="78" rx="16" fill="var(--brand-yellow)" />
                <circle cx="60" cy="92" r="10" fill="var(--ink)" />
                <rect x="55" y="96" width="10" height="22" rx="4" fill="var(--ink)" />
              </g>
            ))}
          </svg>
        </div>
        <p className="unlock-reveal relative text-[clamp(5rem,18vw,11rem)] font-black leading-none tabular-nums text-foreground">
          {secret}
        </p>
      </div>
      <p className="password-win-tape unlock-late mt-6 w-[min(100%,40rem)] bg-primary px-6 py-3 text-center text-[clamp(2rem,5vw,3.5rem)] font-black leading-tight text-primary-foreground">
        破解成功！
      </p>
    </div>
  );
}
