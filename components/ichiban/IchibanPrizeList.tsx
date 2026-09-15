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
      aria-label="一番賞列表"
      className="border-ink/10 bg-paper-warm/70 rounded-2xl border p-4 shadow-[0_12px_32px_-24px_rgb(2_13_21/0.45)]"
    >
      <div className="flex items-baseline justify-between gap-3 border-b border-ink/10 pb-3">
        <h2 className="font-display text-ink text-xl font-extrabold">
          一番賞列表
        </h2>
        <span className="text-ink-soft text-sm font-bold tabular-nums">
          共 {total} 張
        </span>
      </div>
      <p className="text-ink-soft mt-2 text-sm">目前可抽的獎項</p>
      <ol className="mt-3 divide-y divide-dashed divide-ink/15">
        {prizes.map((prize, index) => {
          const remaining = prize.quantity - (drawn[index] ?? 0);
          return (
            // 抽完的獎項整列劃掉、變淡，還留在列表上讓大家知道已經被抽走。
            <li
              key={`${prize.rank}-${index}`}
              className={`grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3 first:pt-1 ${remaining === 0 ? "line-through decoration-2 opacity-45" : ""}`}
            >
              <span className="bg-paper border-ink/10 text-ink rounded-full border px-2.5 py-1 text-sm font-extrabold whitespace-nowrap">
                {prize.rank}
              </span>
              <span className="text-ink min-w-0 truncate font-bold">
                {prize.name}
              </span>
              <span className="text-ink-soft text-sm font-bold tabular-nums whitespace-nowrap">
                {remaining} / {prize.quantity}
              </span>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
