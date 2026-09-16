"use client";

import { cn } from "@/lib/utils";
import * as SliderPrimitive from "@radix-ui/react-slider";

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
  const ticks = Array.from(
    { length: Math.floor((max - min) / 5) + 1 },
    (_, i) => min + i * 5,
  );

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
        <SliderPrimitive.Root
          orientation="vertical"
          value={[sensitivity]}
          min={min}
          max={max}
          step={5}
          onValueChange={([v]) => onChange(min + max - v)}
          className="relative flex h-full w-10 touch-none select-none flex-col items-center"
        >
          <SliderPrimitive.Track className="relative h-full w-full">
            {/* 刻度純裝飾：值由拉把的 aria-valuenow 報讀 */}
            {ticks.map((t) => (
              <span
                key={t}
                aria-hidden
                className={cn(
                  "absolute left-1/2 h-[2px] -translate-x-1/2 translate-y-1/2 rounded-full",
                  (t - min) % 25 === 0 ? "w-5 bg-ink/45" : "w-3.5 bg-ink/15",
                )}
                style={{ bottom: `${((t - min) / (max - min)) * 100}%` }}
              />
            ))}
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            aria-label="敏感度"
            className="group block h-4 w-10 cursor-grab touch-none focus-visible:outline-none active:cursor-grabbing"
          >
            {/* 一條粗線就是拉把 */}
            <span className="absolute top-1/2 left-1/2 block h-2.5 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink transition-transform duration-press ease-out group-active:scale-x-110 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2" />
          </SliderPrimitive.Thumb>
        </SliderPrimitive.Root>
      </div>
    </div>
  );
}
