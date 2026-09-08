"use client";

import { SEGMENTS, zoneOf } from "@/lib/noise/meter";

const ZONE_COLOR = {
  quiet: "var(--brand-green)",
  ok: "var(--brand-yellow)",
  loud: "var(--brand-red)",
} as const;

const ZONE_TEXT = {
  quiet: "很安靜",
  ok: "還可以",
  loud: "太吵了",
} as const;

/**
 * 24 格的音量柱。每格只切 opacity 與顏色（不動 layout），
 * 一秒 60 次更新才不會讓瀏覽器整頁重排。
 */
export function NoiseMeter({ level, limit }: { level: number; limit: number }) {
  const zone = zoneOf(level, limit);
  const lit = Math.round((level / 100) * SEGMENTS);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {/* 讀螢幕器只播這一句「很安靜／還可以／太吵了」。
          底下 24 根柱子是同一份資訊的視覺版，逐格報讀只會變成噪音，整組藏起來。 */}
      <output
        className="font-display text-[clamp(2.5rem,10vw,4rem)] leading-none font-black"
        style={{
          color: ZONE_COLOR[zone],
          transition: "color 200ms var(--ease-out)",
        }}
        aria-live="polite"
      >
        {ZONE_TEXT[zone]}
      </output>

      <div
        className="flex h-40 w-full items-end gap-[2px] sm:h-56"
        aria-hidden="true"
      >
        {Array.from({ length: SEGMENTS }, (_, i) => {
          const on = i < lit;
          const segZone = zoneOf(((i + 1) / SEGMENTS) * 100, limit);
          return (
            <div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                // 柱子高度固定，只有亮暗在變 —— 改 height 會觸發 layout
                height: `${30 + (i / SEGMENTS) * 70}%`,
                background: on ? ZONE_COLOR[segZone] : "var(--sand)",
                opacity: on ? 1 : 0.55,
                transition: "background-color 90ms linear, opacity 90ms linear",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
