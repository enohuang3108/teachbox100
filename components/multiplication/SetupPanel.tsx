"use client";

import { Button } from "@/components/atoms/shadcn/button";
import { DialogDescription } from "@/components/atoms/shadcn/dialog";
import { StepSetup } from "@/components/organisms/StepSetup";
import { QUESTION_COUNTS, useMultiplicationStore } from "@/lib/math/store";
import { TABLES } from "@/lib/math/multiplication";
import { Grid3x3, ListOrdered } from "lucide-react";

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
    <StepSetup
      title="九九乘法設定"
      blocker={tables.length === 0 ? "至少選一段乘法表" : null}
      startLabel="開始練習"
      onStart={onStart}
      steps={[
        {
          key: "tables",
          label: "範圍",
          icon: Grid3x3,
          summary:
            tables.length === TABLES.length
              ? "全部"
              : tables.length === 0
                ? "還沒選"
                : `${[...tables].sort((a, b) => a - b).join("、")} 的乘法`,
          done: tables.length > 0,
          content: (
            <section className="space-y-5">
              <header>
                <h3 className="text-h3 text-ink">要練哪幾段？</h3>
                <DialogDescription className="mt-1">
                  可以只挑一段，也可以混在一起練。
                </DialogDescription>
              </header>
              <div
                role="group"
                aria-label="要練哪幾段"
                className="flex flex-wrap gap-2"
              >
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
                className="text-muted-foreground hover:text-ink"
              >
                全部選起來
              </Button>
            </section>
          ),
        },
        {
          key: "count",
          label: "題數",
          icon: ListOrdered,
          summary: `${count} 題`,
          content: (
            <section className="space-y-5">
              <header>
                <h3 className="text-h3 text-ink">出幾題？</h3>
                <DialogDescription className="mt-1">
                  一輪答完會看到答對幾題。
                </DialogDescription>
              </header>
              <div
                role="group"
                aria-label="出幾題"
                className="flex flex-wrap gap-2"
              >
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
            </section>
          ),
        },
      ]}
    />
  );
}
