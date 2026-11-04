"use client";

import { useEffect, useRef } from "react";
import { StageConfetti } from "@/components/organisms/StageConfetti";
import { PasswordLock } from "@/components/ultimate-password/WinCelebration";
import { BRAND } from "@/lib/design-tokens";
import { originOf, paperBurst } from "@/lib/helpers/confetti-effects";
import { useSound } from "@/lib/hooks/useSound";

/** 引信燒到這一刻爆炸；改了要一起改 globals.css .password-boom 的 --open */
const BOOM_MS = 700;
/** 引信的滴答，越來越急 */
const FUSE_TICKS = [0, 200, 360, 480, 570, 630, 670];
/** 爆炸碎片：焦黑、火紅、火光黃、灰燼 */
const DEBRIS = [BRAND.ink, BRAND.red, BRAND.yellow, BRAND.stone, BRAND.inkSoft];

/** 剪紙爆炸雲：尖角長短交錯，固定數值讓每次炸開的形狀一樣 */
function starburst(spikes: number, outer: number[], inner: number) {
  return Array.from({ length: spikes * 2 }, (_, i) => {
    const r = i % 2 ? inner : outer[(i / 2) % outer.length];
    const a = (Math.PI * i) / spikes - Math.PI / 2;
    return `${(100 + r * Math.cos(a)).toFixed(1)},${(100 + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}
const BLAST_OUTER = starburst(12, [96, 78, 90, 70, 98, 82], 52);
const BLAST_INNER = starburst(10, [64, 52, 60, 48, 66], 34);

/**
 * 時間到：鎖跟著越來越急的滴答抖到撐不住，炸成一朵剪紙爆炸雲 ——
 * 鎖身碎開、畫面重震、焦黑碎片噴出來、煙散掉，然後揭曉密碼並貼上紅色紙膠帶。
 */
export function TimeUpExplosion({
  secret,
  sound,
}: {
  secret: number;
  sound: boolean;
}) {
  const lock = useRef<HTMLDivElement>(null);
  const { playCountdownTick, playWrongSound } = useSound();

  useEffect(() => {
    if (!sound) return;
    const timers = [
      ...FUSE_TICKS.map((ms) => setTimeout(playCountdownTick, ms)),
      setTimeout(playWrongSound, BOOM_MS),
    ];
    return () => timers.forEach(clearTimeout);
    // 只在這一次爆炸排一次，音量變動不重播
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sound]);

  return (
    <div className="password-boom relative flex w-full flex-col items-center">
      <StageConfetti
        onReady={(fire) => {
          const timer = setTimeout(
            () => paperBurst(fire, originOf(lock.current), 260, 360, DEBRIS),
            BOOM_MS,
          );
          return () => clearTimeout(timer);
        }}
      />
      <div className="relative grid size-56 place-items-center sm:size-64">
        <svg
          viewBox="0 0 200 200"
          className="pointer-events-none absolute -inset-1/3 size-[166%] overflow-visible"
          aria-hidden="true"
        >
          <g className="boom-smoke" fill="var(--stone)">
            <circle cx="60" cy="70" r="34" />
            <circle cx="140" cy="62" r="30" />
            <circle cx="100" cy="40" r="28" />
            <circle cx="150" cy="130" r="32" />
            <circle cx="52" cy="135" r="30" />
          </g>
          <g className="boom-blast">
            <polygon points={BLAST_OUTER} fill="var(--brand-red)" />
            <polygon points={BLAST_INNER} fill="var(--brand-yellow)" />
          </g>
        </svg>
        <PasswordLock ref={lock} />
        <p className="unlock-reveal relative text-[clamp(5rem,18vw,11rem)] font-black leading-none tabular-nums text-foreground">
          {secret}
        </p>
      </div>
      <p className="password-win-tape unlock-late mt-6 w-[min(100%,40rem)] bg-brand-red px-6 py-3 text-center text-[clamp(2rem,5vw,3.5rem)] font-black leading-tight text-paper">
        時間到，爆炸了！
      </p>
    </div>
  );
}
