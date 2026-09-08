"use client";

import { formatTime, progress, WARN_AT } from "@/lib/timer/timer";

const R = 140;
const CIRC = 2 * Math.PI * R;

/**
 * 倒數錶面。數字本身不做任何動畫 —— 老師整堂課都在看它，
 * 每秒跳一次的縮放或淡入只會讓人覺得慢。會動的只有環與顏色。
 */
export function TimerDial({
  remaining,
  total,
  done,
}: {
  remaining: number;
  total: number;
  done: boolean;
}) {
  const warn = remaining <= WARN_AT && remaining > 0;
  const stroke = done || warn ? "var(--brand-red)" : "var(--brand-blue)";

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[min(78vw,26rem)]"
      role="timer"
      aria-live="off"
    >
      <svg viewBox="0 0 320 320" className="h-full w-full -rotate-90">
        <circle
          cx="160"
          cy="160"
          r={R}
          fill="none"
          stroke="var(--sand)"
          strokeWidth="20"
        />
        <circle
          cx="160"
          cy="160"
          r={R}
          fill="none"
          stroke={stroke}
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - progress(remaining, total))}
          // 每 100ms 餵一次新值，用等長的 linear 轉場接起來就是連續的走針。
          // 非 linear 會在每個取樣點加減速，看起來一頓一頓的。
          style={{
            transition:
              "stroke-dashoffset 100ms linear, stroke 200ms var(--ease-out)",
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display text-ink text-[clamp(3.5rem,17vw,6.5rem)] leading-none font-black tabular-nums"
          style={{
            color: done || warn ? "var(--brand-red)" : undefined,
            transition: "color 200ms var(--ease-out)",
          }}
        >
          {formatTime(remaining)}
        </span>
        {done && (
          <span className="text-brand-red mt-3 text-xl font-extrabold">
            時間到！
          </span>
        )}
      </div>
    </div>
  );
}
