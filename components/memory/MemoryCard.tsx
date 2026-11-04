"use client";

import { isImageFace } from "@/lib/memory/game";
import { faceFontScale } from "@/lib/memory/layout";
import { cn } from "@/lib/utils";
import { CardBack } from "./CardBack";

/**
 * 一張牌。翻面靠 .memory-card 那組 CSS（styles/globals.css）：
 * 一般是 360ms 的 3D 水平翻轉，prefers-reduced-motion 改成 150ms 淡入淡出。
 */
export function MemoryCard({
  face,
  back,
  faceUp,
  matched,
  disabled,
  onSelect,
}: {
  face: string;
  /** CARD_BACKS 的 id */
  back: string;
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
      aria-label={faceUp ? (isImageFace(face) ? "圖片牌" : face) : "蓋著的牌"}
      aria-pressed={faceUp}
      data-face-up={faceUp}
      data-matched={matched}
      className="memory-card aspect-[3/4] w-full cursor-pointer rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-brand-yellow/60 disabled:cursor-default"
    >
      <span className="memory-card-inner">
        <span className="memory-face overflow-hidden">
          <CardBack id={back} />
        </span>
        <span
          className={cn(
            "memory-face memory-face-front bg-paper border-ink/10 text-ink font-display flex items-center justify-center overflow-hidden border px-2 text-center leading-[1.25] font-extrabold break-words @container",
            matched && "border-brand-green/60 border-2",
          )}
        >
          {/* 字級跟著牌寬走（cqw）：字少就大、字多自動縮，全螢幕放大也同比例 */}
          {isImageFace(face) ? (
            // 縮圖是 data URL，不走 next/image
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={face}
              alt=""
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <span style={{ fontSize: `${faceFontScale(face) * 100}cqw` }}>
              {face}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}
