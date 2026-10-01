"use client";

import { Button } from "@/components/atoms/shadcn/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/shadcn/popover";
import { isoDate } from "@/lib/timer/exam";
import { cn } from "@/lib/utils";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

const WEEK = ["日", "一", "二", "三", "四", "五", "六"];
const PRESS =
  "transition-[background-color,color,transform] duration-press ease-out active:scale-[0.97]";

const parse = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** 「今天」「明天」「後天」比日期本身更快讀懂；再遠就不加 */
function relative(iso: string, today: Date): string | null {
  const diff = Math.round(
    (parse(iso).getTime() - parse(isoDate(today)).getTime()) / 86_400_000,
  );
  return ["今天", "明天", "後天"][diff] ?? null;
}

/**
 * 考試日期。原生 <input type="date"> 的月曆跟著系統配色（暗底藍框、週末紅字），
 * 跟紙感的設定視窗對不起來，所以自己畫一個：只有月份切換、日期格與兩顆捷徑。
 */
export function DatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (iso: string) => void;
}) {
  const today = new Date();
  const todayIso = isoDate(today);
  const selected = value ? parse(value) : today;
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(
    () => new Date(selected.getFullYear(), selected.getMonth(), 1),
  );

  // 從週日開始排滿六週，每個月格子數一樣，切月份時視窗高度不跳
  const first = addDays(month, -month.getDay());
  const days = Array.from({ length: 42 }, (_, i) => addDays(first, i));
  const pick = (d: Date) => {
    onChange(isoDate(d));
    setOpen(false);
  };
  const rel = value ? relative(value, today) : null;

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        if (v)
          setMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
        setOpen(v);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-label="考試日期"
          className={cn("h-11 justify-start gap-2.5 rounded-xl px-4", PRESS)}
        >
          <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
          <span className="text-base font-semibold text-ink tabular-nums">
            {value
              ? `${selected.getMonth() + 1} 月 ${selected.getDate()} 日（週${WEEK[selected.getDay()]}）`
              : "選擇日期"}
          </span>
          {rel && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-caption text-ink">
              {rel}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto rounded-2xl p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="pl-2 font-semibold text-ink tabular-nums">
            {month.getFullYear()} 年 {month.getMonth() + 1} 月
          </span>
          <div className="flex">
            {[
              { label: "上個月", icon: ChevronLeft, step: -1 },
              { label: "下個月", icon: ChevronRight, step: 1 },
            ].map(({ label, icon: Icon, step }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                onClick={() =>
                  setMonth(
                    new Date(month.getFullYear(), month.getMonth() + step, 1),
                  )
                }
                className={cn(
                  "grid size-9 place-items-center rounded-xl text-muted-foreground hover:bg-accent hover:text-ink",
                  PRESS,
                )}
              >
                <Icon className="size-4" aria-hidden />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {WEEK.map((w) => (
            <span
              key={w}
              className="grid h-8 place-items-center text-caption text-muted-foreground"
            >
              {w}
            </span>
          ))}
          {days.map((d) => {
            const iso = isoDate(d);
            const inMonth = d.getMonth() === month.getMonth();
            const isSelected = iso === value;
            // 考試日期選過去沒有意義，擋掉；今天以後都能選
            const past = iso < todayIso;
            return (
              <button
                key={iso}
                type="button"
                disabled={past}
                aria-pressed={isSelected}
                aria-label={`${d.getMonth() + 1} 月 ${d.getDate()} 日`}
                onClick={() => pick(d)}
                className={cn(
                  "grid size-10 place-items-center rounded-xl text-sm font-semibold tabular-nums disabled:pointer-events-none",
                  PRESS,
                  isSelected
                    ? "bg-ink text-paper"
                    : past
                      ? "text-muted-foreground/40"
                      : inMonth
                        ? "text-ink hover:bg-accent"
                        : "text-muted-foreground hover:bg-accent",
                  iso === todayIso &&
                    !isSelected &&
                    "ring-1 ring-ink/30 ring-inset",
                )}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex gap-2 border-t border-border pt-3">
          {[
            { label: "今天", days: 0 },
            { label: "明天", days: 1 },
          ].map(({ label, days: n }) => (
            <Button
              key={label}
              variant="ghost"
              size="sm"
              className={cn("rounded-xl", PRESS)}
              onClick={() => pick(addDays(today, n))}
            >
              {label}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
