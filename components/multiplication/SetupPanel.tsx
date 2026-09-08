"use client";

import { Button } from "@/components/atoms/shadcn/button";
import { QUESTION_COUNTS, useMultiplicationStore } from "@/lib/math/store";
import { TABLES } from "@/lib/math/multiplication";

/** 圓角膠囊選項，選中是實心墨色。按下縮 0.97 給即時回饋。 */
const chip = (active: boolean) =>
  `rounded-full border px-4 py-2 text-base font-semibold tabular-nums transition-[background-color,color,border-color,transform] duration-150 ease-out active:scale-[0.97] ${
    active
      ? "bg-ink border-ink text-paper"
      : "bg-paper-warm border-ink/10 text-ink-soft hover:text-ink"
  }`;

export function SetupPanel({ onStart }: { onStart: () => void }) {
  const { tables, count, toggleTable, setAllTables, setCount } =
    useMultiplicationStore();

  return (
    <div className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-3">
        <legend className="text-ink font-semibold">要練哪幾段</legend>
        <div className="flex flex-wrap gap-2">
          {TABLES.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={tables.includes(n)}
              onClick={() => toggleTable(n)}
              className={chip(tables.includes(n))}
            >
              {n} 的乘法
            </button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={setAllTables}
          className="text-muted-foreground hover:text-ink self-start"
        >
          全部選起來
        </Button>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-ink font-semibold">出幾題</legend>
        <div className="flex flex-wrap gap-2">
          {QUESTION_COUNTS.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={count === n}
              onClick={() => setCount(n)}
              className={chip(count === n)}
            >
              {n} 題
            </button>
          ))}
        </div>
      </fieldset>

      {tables.length === 0 && (
        <p className="text-brand-red text-sm font-medium">至少選一段乘法表。</p>
      )}
      <Button size="lg" disabled={tables.length === 0} onClick={onStart}>
        開始練習
      </Button>
    </div>
  );
}
