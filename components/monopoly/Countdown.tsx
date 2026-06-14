"use client";

import { Timer } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const TICK_MS = 250;

function format(remainingMs: number): string {
  const totalSec = Math.ceil(remainingMs / 1000);
  const mm = Math.floor(totalSec / 60);
  const ss = totalSec % 60;
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

/**
 * 倒數計時膠囊（時間到結束條件專用）。
 * 依 endsAt（截止時刻 ms 時戳）每 250ms 重算剩餘時間，
 * 歸零時呼叫一次 onExpire 讓上層結束遊戲。
 */
export function Countdown({
  endsAt,
  onExpire,
}: {
  endsAt: number;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, endsAt - Date.now()),
  );
  const expired = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    expired.current = false;
    const tick = () => setRemaining(Math.max(0, endsAt - Date.now()));
    tick();
    const id = window.setInterval(tick, TICK_MS);
    return () => window.clearInterval(id);
  }, [endsAt]);

  useEffect(() => {
    if (remaining <= 0 && !expired.current) {
      expired.current = true;
      onExpireRef.current();
    }
  }, [remaining]);

  // 剩 60 秒內轉紅警示
  const urgent = remaining <= 60_000;

  return (
    <div
      className={`flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-bold tabular-nums shadow-md ring-1 transition ${
        urgent
          ? "animate-pulse bg-rose-500 text-white ring-rose-600/20"
          : "bg-stone-50 text-stone-700 ring-stone-900/5"
      }`}
      title="剩餘時間"
      aria-label="剩餘時間"
    >
      <Timer className="h-4 w-4" />
      {format(remaining)}
    </div>
  );
}
