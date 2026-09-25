"use client";

import { TickSlider } from "@/components/atoms/TickSlider";

/**
 * 「敏感度」直立刻度尺，固定在螢幕最右邊、垂直置中。
 * 存的是「太吵的門檻」，畫面上反過來給老師看：往上 = 越敏感 = 門檻越低，一點聲音就算太吵。
 * 刻度每 5 一格、每 25 加深；粗線本身就是拉把，數字放在標題下面。
 */
export function ThresholdSlider({
  value,
  onChange,
  min = 20,
  max = 95,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  // 門檻與敏感度互為反向：同一個範圍裡鏡射
  // 只停在 5 的倍數；舊存檔可能留著 67 這種值，顯示時一併對齊
  const sensitivity = Math.round((min + max - value) / 5) * 5;
  return (
    <div className="fixed top-1/2 right-4 z-(--z-sticky) flex h-[60vh] -translate-y-1/2 flex-col items-center gap-2">
      <div className="flex flex-col items-center leading-none">
        <span className="text-caption font-semibold text-muted-foreground">
          敏感度
        </span>
        <output className="mt-1 text-h3 font-bold text-ink tabular-nums">
          {sensitivity}
        </output>
      </div>
      <div className="min-h-0 flex-1 rounded-2xl border border-border bg-card/60 px-2 py-4">
        <TickSlider
          orientation="vertical"
          value={sensitivity}
          min={min}
          max={max}
          step={5}
          tickEvery={5}
          majorEvery={25}
          label="敏感度"
          onChange={(v) => onChange(min + max - v)}
          className="h-full"
        />
      </div>
    </div>
  );
}
