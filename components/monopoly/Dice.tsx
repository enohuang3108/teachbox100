"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/atoms/shadcn/button";

const DiceScene = dynamic(() => import("./DiceScene"), { ssr: false });

export function Die({ value, onComplete }: { value: number; onComplete?: () => void }) {
  return <div className="w-72 max-w-full"><DiceScene values={[value]} onComplete={onComplete} /></div>;
}

export function Dice({ lastRoll, rolling, rollSeq, disabled, onRoll, onComplete }: {
  lastRoll: number[] | null;
  rolling: boolean;
  rollSeq: number;
  disabled: boolean;
  onRoll: () => void;
  onComplete: () => void;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="flex min-h-[5rem] w-full items-center justify-center">
        {lastRoll?.length ? <DiceScene key={rollSeq} values={lastRoll} onComplete={onComplete} /> :
          <span className="text-sm text-ink-soft/70">擲骰子開始你的回合</span>}
      </div>
      <Button size="lg" disabled={disabled || rolling} onClick={onRoll}
        className="rounded-full bg-primary px-10 py-6 text-lg font-bold text-ink transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-[3px] hover:shadow-[0_10px_24px_-8px_rgb(248_176_3/0.6)] active:translate-y-0 active:scale-[0.97] disabled:opacity-50 disabled:hover:translate-y-0">
        {rolling ? "擲骰中…" : "擲骰子"}
      </Button>
    </div>
  );
}
