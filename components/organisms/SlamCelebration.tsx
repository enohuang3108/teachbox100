"use client";

import { useRef } from "react";
import { StageConfetti } from "@/components/organisms/StageConfetti";
import { originOf, paperBurst } from "@/lib/helpers/confetti-effects";

/**
 * 揭曉大數字的慶祝：數字從 3 倍大砸下來、整塊震一下、紙屑從數字炸開，
 * 再貼上一條黃色紙膠帶寫 label。終極密碼試過，留給之後其他單元用。
 * 要重播就換 key。
 */
export function SlamCelebration({
  value,
  label = "破解成功！",
}: {
  value: React.ReactNode;
  label?: string;
}) {
  const number = useRef<HTMLDivElement>(null);

  return (
    <div className="slam-celebration flex w-full flex-col items-center">
      <StageConfetti
        onReady={(fire) => {
          const timers = [
            setTimeout(() => paperBurst(fire, originOf(number.current), 260, 180), 260),
            setTimeout(() => {
              paperBurst(fire, { x: 0.15, y: 0.9 }, 120, 70);
              paperBurst(fire, { x: 0.85, y: 0.9 }, 120, 70);
            }, 700),
          ];
          return () => timers.forEach(clearTimeout);
        }}
      />
      <div
        ref={number}
        className="slam-number text-[clamp(8rem,28vw,18rem)] font-black leading-none tabular-nums text-foreground"
      >
        {value}
      </div>
      <p className="slam-tape mt-4 w-[min(100%,44rem)] bg-primary px-6 py-4 text-center text-[clamp(2rem,5vw,3.5rem)] font-black leading-tight text-primary-foreground">
        {label}
      </p>
    </div>
  );
}
