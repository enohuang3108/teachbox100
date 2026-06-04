"use client";

import { motion } from "motion/react";
import { useEffect, useState } from "react";
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

function DieFace({ value }: { value: number }) {
  const on = new Set(PIPS[value] ?? []);
  return (
    <div className="grid h-12 w-12 grid-cols-3 grid-rows-3 gap-0.5 rounded-xl border border-black/10 bg-white p-2 shadow-md">
      {Array.from({ length: 9 }).map((_, i) => (
        <span
          key={i}
          className={`m-auto h-2 w-2 rounded-full ${on.has(i) ? "bg-zinc-800" : "bg-transparent"}`}
        />
      ))}
    </div>
  );
}

// 翻滾中：持續旋轉＋跳動，面數快速亂跳
function RollingDie() {
  const [face, setFace] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setFace(Math.floor(Math.random() * 6) + 1), 90);
    return () => clearInterval(id);
  }, []);
  return (
    <motion.div
      animate={{ rotate: 360, y: [0, -12, 0] }}
      transition={{
        rotate: { repeat: Infinity, duration: 0.5, ease: "linear" },
        y: { repeat: Infinity, duration: 0.45, ease: "easeInOut" },
      }}
    >
      <DieFace value={face} />
    </motion.div>
  );
}

// 落定：彈簧效果現出結果
function SettledDie({ value }: { value: number }) {
  return (
    <motion.div
      initial={{ rotate: -160, scale: 0.4, opacity: 0 }}
      animate={{ rotate: 0, scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 280, damping: 16 }}
    >
      <DieFace value={value} />
    </motion.div>
  );
}

export function Dice({
  lastRoll,
  rolling,
  count,
  disabled,
  onRoll,
}: {
  lastRoll: number[] | null;
  rolling: boolean;
  count: number;
  disabled: boolean;
  onRoll: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex min-h-[3rem] items-center gap-2">
        {rolling ? (
          Array.from({ length: count }).map((_, i) => <RollingDie key={i} />)
        ) : lastRoll && lastRoll.length > 0 ? (
          lastRoll.map((d, i) => <SettledDie key={`${i}-${d}`} value={d} />)
        ) : (
          <span className="text-xs text-emerald-700/50">擲骰子開始你的回合</span>
        )}
      </div>
      <Button
        size="lg"
        disabled={disabled || rolling}
        onClick={onRoll}
        className="rounded-full bg-amber-500 px-8 font-bold text-white shadow-lg shadow-amber-500/30 transition hover:bg-amber-600 disabled:opacity-50"
      >
        {rolling ? "擲骰中…" : "🎲 擲骰子"}
      </Button>
    </div>
  );
}
