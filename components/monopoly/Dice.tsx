"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/atoms/shadcn/button";

const DiceScene = dynamic(() => import("./DiceScene"), { ssr: false });

export function Die({ value, onComplete }: { value: number; onComplete?: () => void }) {
  return <div className="w-72 max-w-full"><DiceScene values={[value]} onComplete={onComplete} /></div>;
}

export function Dice({ lastRoll, diceCount, rolling, rollSeq, disabled, onRoll, onComplete }: {
  lastRoll: number[] | null;
  diceCount: 1 | 2;
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
          <DiceScene still values={diceCount === 2 ? [5, 6] : [6]} />}
      </div>
      {/* 固定在棋盤中央區右下角（Board 的中央區是 relative），不跟骰子搶中間的位置 */}
      <Button size="lg" disabled={disabled || rolling} onClick={onRoll}
        className="absolute right-5 bottom-5 size-28 rounded-full bg-primary p-0 text-xl font-bold text-ink shadow-[0_6px_0_rgb(0_0_0/0.12)] transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-[3px] hover:shadow-[0_10px_24px_-8px_rgb(248_176_3/0.6)] active:translate-y-0 active:scale-[0.97] disabled:opacity-50 disabled:hover:translate-y-0">
        擲骰子
      </Button>
    </div>
  );
}
