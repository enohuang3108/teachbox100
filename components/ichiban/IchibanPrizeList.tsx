"use client";

import { prizeTotal } from "@/lib/ichiban/prizes";
import { useIchibanStore } from "@/lib/ichiban/store";

/** 讓老師在撕票時一直看得到整套獎項與每一賞的張數。 */
export function IchibanPrizeList() {
  const prizes = useIchibanStore((state) => state.prizes);
  const drawn = useIchibanStore((state) => state.drawn);
  const total = prizeTotal(prizes);

  return (
    <aside
      aria-label="一番賞獎項"
      className="fixed top-20 left-4 z-(--z-sticky) max-h-[calc(100svh-6rem)] w-64 overflow-y-auto rounded-3xl bg-card/90 px-5 pt-5 pb-4 shadow-sm backdrop-blur-[2px] [#game-stage:fullscreen_&]:top-4"
    >
      <h2 className="font-display text-2xl font-extrabold text-ink">
        一番賞獎項
      </h2>
      <p className="mt-0.5 text-caption text-ink-soft tabular-nums">
        共 {total} 張
      </p>
      <ol className="mt-2 divide-y divide-border">
        {prizes.map((prize, index) => {
          const remaining = prize.quantity - (drawn[index] ?? 0);
          return (
            // 抽完的獎項整列劃掉、變淡，還留在列表上讓大家知道已經被抽走。
            <li
              key={`${prize.rank}-${index}`}
              className={`flex items-center justify-between gap-3 py-3 ${remaining === 0 ? "line-through decoration-2 opacity-45" : ""}`}
            >
              <span className="shrink-0 text-sm text-ink-soft">
                {prize.rank}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink">
                {prize.name}
              </span>
              <span className="shrink-0 text-sm text-ink-soft tabular-nums">
                {remaining} / {prize.quantity}
              </span>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
