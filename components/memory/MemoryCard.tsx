"use client";

import { cn } from "@/lib/utils";
import { CARD_BACK_INK, CardBack } from "./CardBack";

/**
 * 一張牌。翻面靠 .memory-card 那組 CSS（styles/globals.css）：
 * 一般是 360ms 的 3D 水平翻轉，prefers-reduced-motion 改成 150ms 淡入淡出。
 */
export function MemoryCard({
  face,
  faceUp,
  matched,
  disabled,
  onSelect,
}: {
  face: string;
  faceUp: boolean;
  matched: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-label={faceUp ? face : "蓋著的牌"}
      aria-pressed={faceUp}
      data-face-up={faceUp}
      data-matched={matched}
      className="memory-card aspect-[3/4] w-full cursor-pointer rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-brand-yellow/60 disabled:cursor-default"
    >
      <span className="memory-card-inner">
        <span
          className="memory-face flex items-center justify-center"
          style={{ backgroundColor: CARD_BACK_INK }}
        >
          <CardBack />
        </span>
        <span
          className={cn(
            "memory-face memory-face-front bg-paper border-ink/10 text-ink font-display flex items-center justify-center border px-2 text-center font-extrabold break-words",
            face.length > 8 ? "text-base sm:text-lg" : "text-xl sm:text-2xl",
            matched && "border-brand-green/60 border-2",
          )}
        >
          {face}
        </span>
      </span>
    </button>
  );
}
