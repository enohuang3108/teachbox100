"use client";

import Lottie from "lottie-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/atoms/shadcn/button";

// 每個點數對應一支落定在該數字的 Lottie 擲骰動畫（放在 public/lottie/dice）
const dicePath = (value: number) => `/lottie/dice/dice-${value}.json`;

// 動畫資料快取，每個點數只下載一次
const animCache: Record<number, unknown> = {};

function loadDiceAnim(value: number): Promise<unknown> {
  if (animCache[value]) return Promise.resolve(animCache[value]);
  return fetch(dicePath(value))
    .then((r) => r.json())
    .then((data) => {
      animCache[value] = data;
      return data;
    });
}

// 單顆骰子：載入並播放對應點數的動畫，播完停在該數字
export function Die({ value }: { value: number }) {
  const [data, setData] = useState<unknown>(animCache[value] ?? null);

  useEffect(() => {
    let alive = true;
    loadDiceAnim(value)
      .then((d) => {
        if (alive) setData(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [value]);

  if (!data) return <div className="h-20 w-20" />;
  return (
    <Lottie animationData={data} loop={false} autoplay className="h-20 w-20" />
  );
}

export function Dice({
  lastRoll,
  rolling,
  rollSeq,
  disabled,
  onRoll,
}: {
  lastRoll: number[] | null;
  rolling: boolean;
  rollSeq: number;
  disabled: boolean;
  onRoll: () => void;
}) {
  // 首次互動前先把 6 支動畫預載進快取，避免第一次擲骰要等下載
  useEffect(() => {
    for (let v = 1; v <= 6; v += 1) {
      loadDiceAnim(v).catch(() => {});
    }
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex min-h-[5rem] items-center gap-2">
        {lastRoll && lastRoll.length > 0 ? (
          lastRoll.map((d, i) => <Die key={`${rollSeq}-${i}`} value={d} />)
        ) : (
          <span className="text-sm text-emerald-700/50">
            擲骰子開始你的回合
          </span>
        )}
      </div>
      <Button
        size="lg"
        disabled={disabled || rolling}
        onClick={onRoll}
        className="rounded-full bg-amber-500 px-10 py-6 text-lg font-bold text-white shadow-lg shadow-amber-500/30 transition duration-150 ease-out hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow-xl hover:shadow-amber-500/40 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {rolling ? "擲骰中…" : "🎲 擲骰子"}
      </Button>
    </div>
  );
}
