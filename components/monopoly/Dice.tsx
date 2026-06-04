"use client";

import { motion } from "motion/react";
import { Button } from "@/components/atoms/shadcn/button";

// 各點數的 pip 位置（3×3 格索引）
const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function Die({ value }: { value: number }) {
  const on = new Set(PIPS[value] ?? []);
  return (
    <motion.div
      initial={{ rotate: -120, scale: 0.5, opacity: 0 }}
      animate={{ rotate: 0, scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      className="grid h-12 w-12 grid-cols-3 grid-rows-3 gap-0.5 rounded-xl border border-black/10 bg-white p-2 shadow-md"
    >
      {Array.from({ length: 9 }).map((_, i) => (
        <span
          key={i}
          className={`m-auto h-2 w-2 rounded-full ${on.has(i) ? "bg-zinc-800" : "bg-transparent"}`}
        />
      ))}
    </motion.div>
  );
}

export function Dice({
  lastRoll,
  disabled,
  onRoll,
}: {
  lastRoll: number[] | null;
  disabled: boolean;
  onRoll: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex min-h-[3rem] items-center gap-2">
        {lastRoll && lastRoll.length > 0 ? (
          lastRoll.map((d, i) => <Die key={`${i}-${d}`} value={d} />)
        ) : (
          <span className="text-xs text-emerald-700/50">擲骰子開始你的回合</span>
        )}
      </div>
      <Button
        size="lg"
        disabled={disabled}
        onClick={onRoll}
        className="rounded-full bg-amber-500 px-8 font-bold text-white shadow-lg shadow-amber-500/30 hover:bg-amber-600"
      >
        🎲 擲骰子
      </Button>
    </div>
  );
}
