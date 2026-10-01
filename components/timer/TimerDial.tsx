"use client";

import { formatTime, progress, WARN_AT } from "@/lib/timer/timer";
import { useState } from "react";

const R = 140;
const CIRC = 2 * Math.PI * R;

/**
 * 倒數錶面。數字本身不做任何動畫 —— 老師整堂課都在看它，
 * 每秒跳一次的縮放或淡入只會讓人覺得慢。會動的只有環、顏色，與開考那幾秒的實心圓。
 */
export function TimerDial({
  remaining,
  total,
  done,
  warnAt = WARN_AT,
  rest = false,
  announce = null,
  caption = null,
}: {
  remaining: number;
  total: number;
  done: boolean;
  /** 剩幾秒開始轉紅；考試模式讓老師自己設 */
  warnAt?: number;
  /** 考試模式不在考試的時候（等下一節、午休中）：環換成綠色，一眼分得出現在不是在考試 */
  rest?: boolean;
  /** 剛開考那幾秒：錶面換成實心圓，寫科目與「考試開始」 */
  announce?: string | null;
  /** 還沒開始時寫在數字上下：上面小字標籤（「下堂考試」），下面是科目 */
  caption?: { label: string; title: string } | null;
}) {
  // 退場淡出時 announce 已經是 null，留著上一個科目名，才不會淡出一個空的圓
  const [shown, setShown] = useState(announce);
  if (announce !== null && announce !== shown) setShown(announce);
  const warn = remaining <= warnAt && remaining > 0;
  const text = formatTime(remaining);
  const stroke =
    done || warn
      ? "var(--brand-red)"
      : rest
        ? "var(--rest)"
        : "var(--brand-blue)";

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[min(82vw,30rem)] [container-type:inline-size]"
      role="timer"
      aria-live="off"
    >
      <svg viewBox="0 0 320 320" className="h-full w-full -rotate-90">
        <circle
          cx="160"
          cy="160"
          r={R}
          fill="none"
          stroke="var(--sand)"
          strokeWidth="20"
        />
        <circle
          cx="160"
          cy="160"
          r={R}
          fill="none"
          stroke={stroke}
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - progress(remaining, total))}
          // 每 100ms 餵一次新值，用等長的 linear 轉場接起來就是連續的走針。
          // 非 linear 會在每個取樣點加減速，看起來一頓一頓的。
          style={{
            transition:
              "stroke-dashoffset 100ms linear, stroke 200ms var(--ease-out)",
          }}
        />
      </svg>

      <div
        // 開考那幾秒倒數帶點模糊淡出，跟實心圓交疊時看起來是同一個東西在變，而不是兩張圖換來換去
        className={`absolute inset-0 flex flex-col items-center justify-center transition-[opacity,filter] ease-out motion-reduce:blur-none ${announce !== null ? "opacity-0 blur-sm duration-(--duration-flip)" : "duration-(--duration-normal)"}`}
      >
        {caption && (
          <span className="mb-[2cqw] text-[6cqw] font-bold text-muted-foreground">
            {caption.label}
          </span>
        )}
        <span
          // H:MM:SS（隔天開考的倒數）比 MM:SS 長，縮字才塞得進環裡
          className={`font-display text-ink leading-none font-black tabular-nums ${text.length > 5 ? "text-[15cqw]" : "text-[24cqw]"}`}
          style={{
            color: done || warn ? "var(--brand-red)" : undefined,
            transition: "color 200ms var(--ease-out)",
          }}
        >
          {text}
        </span>
        {caption && (
          <span className="mt-[3cqw] max-w-[70%] truncate font-display text-[9cqw] leading-tight font-black text-ink">
            {caption.title}
          </span>
        )}
        {done && (
          <span className="text-brand-red mt-[2cqw] text-[7cqw] font-extrabold">
            時間到！
          </span>
        )}
      </div>

      {/* 一直掛著、用 data-on 切換：轉場可以中途反轉，開考畫面不會閃一下就斷掉。
          實心圓剛好蓋住環的外緣（半徑 150 / 320），看起來是環被填滿 */}
      <div
        data-on={announce !== null}
        aria-hidden={announce === null}
        // 一天只出現幾次的時刻，給長一點、軟一點的轉場：模糊微縮 → 清楚，退場比進場快。
        // 底色是很淡的放射漸層（中間稍亮），比一塊平塗的藍柔和
        className="absolute inset-[3.125%] flex scale-[0.96] flex-col items-center justify-center rounded-full text-paper opacity-0 blur-md transition-[opacity,transform,filter] duration-(--duration-normal) ease-out data-[on=true]:scale-100 data-[on=true]:opacity-100 data-[on=true]:blur-none data-[on=true]:duration-(--duration-flip) motion-reduce:scale-100 motion-reduce:blur-none"
        style={{
          background:
            "radial-gradient(circle at 50% 38%, color-mix(in oklab, var(--brand-blue) 82%, white) 0%, var(--brand-blue) 72%)",
        }}
      >
        <span className="max-w-[80%] truncate font-display text-[16cqw] leading-tight font-black">
          {shown}
        </span>
        <span className="mt-[2cqw] text-[8cqw] font-extrabold">考試開始</span>
      </div>
    </div>
  );
}
