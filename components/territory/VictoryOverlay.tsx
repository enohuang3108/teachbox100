"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { Button } from "@/components/atoms/shadcn/button";
import { StageConfetti } from "@/components/organisms/StageConfetti";
import { BRAND } from "@/lib/design-tokens";
import {
  originOf,
  paperBurst,
  paperCannons,
} from "@/lib/helpers/confetti-effects";
import { useSound } from "@/lib/hooks/useSound";
import type { Side } from "@/lib/territory/rules";
import { cn } from "@/lib/utils";

const TEAM_BG: Record<Side, string> = {
  left: "bg-brand-blue",
  right: "bg-brand-red",
};
const TEAM_FILL: Record<Side, string> = {
  left: "var(--brand-blue)",
  right: "var(--brand-red)",
};
/** 紙屑以獲勝隊色為主，摻一點米白與黃；平手兩隊各半 */
const TEAM_CONFETTI: Record<Side | "tie", string[]> = {
  left: [BRAND.blue, BRAND.blue, BRAND.paperWarm, BRAND.yellow],
  right: [BRAND.red, BRAND.red, BRAND.paperWarm, BRAND.yellow],
  tie: [BRAND.blue, BRAND.red, BRAND.paperWarm, BRAND.yellow],
};
/** 旗子落地（620ms 掉落動畫的 70%）；紙屑、音效、畫面震動都對著它。改了要一起改 globals.css 的 victory-flag */
const FLAG_LAND_MS = 435;
const TIE_HIT_MS = 200;

const TITLE =
  "font-display text-[clamp(2rem,7cqw,6.5rem)] font-extrabold leading-tight";
const DETAIL = "text-[clamp(1rem,1.8cqw,1.75rem)] font-bold tabular-nums";
const RESTART =
  "h-auto rounded-full px-[3cqw] py-[1cqw] text-[clamp(1rem,1.8cqw,1.75rem)] transition-transform duration-press ease-out active:scale-[0.97]";

/**
 * 三角旗面：上下 y=10–52，旗尖在 (78, 31)。跟棋盤兩側的隊旗同一個造型，放大。
 * 旗面從旗桿中線（x=14）起算，靠旗桿那條描邊整段藏在旗桿後面，才不會多一條黑線
 */
const POLE_X = 14;
const TIP_X = 78;
const STEPS = 24;
/** 旗尖的最大擺幅（viewBox 單位）與一道波走完的時間 */
const WAVE_AMP = 3.2;
const WAVE_PERIOD_MS = 1600;

/**
 * 旗面形狀：風從旗桿往外推出一道波，上下兩邊一起起伏，越靠近旗尖擺得越大。
 * ramp 0–1 是擺幅的放大量，落地後慢慢放大，不會突然開始飄。
 */
function clothPath(ms: number, ramp: number) {
  const top: string[] = [];
  const bottom: string[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const u = i / STEPS;
    const x = POLE_X + u * (TIP_X - POLE_X);
    const off =
      ramp * WAVE_AMP * u ** 1.3 * Math.sin(2 * Math.PI * (u * 0.9 - ms / WAVE_PERIOD_MS));
    top.push(`${x.toFixed(2)} ${(10 + 21 * u + off).toFixed(2)}`);
    bottom.unshift(`${x.toFixed(2)} ${(52 - 21 * u + off).toFixed(2)}`);
  }
  return `M${top.join(" L")} L${bottom.slice(1).join(" L")} Z`;
}

/** 剪紙風的勝利旗：墨色旗桿、隊色三角旗面 */
function Flag({ side, waveAt }: { side: Side; waveAt: number }) {
  const cloth = useRef<SVGPathElement>(null);

  // 每一幀直接改 d，不經過 React state；降低動態效果時旗子不飄
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = performance.now() + waveAt;
    let frame = requestAnimationFrame(function tick(now) {
      const t = now - start;
      if (t > 0) {
        const ramp = Math.min(1, t / 600);
        cloth.current?.setAttribute("d", clothPath(t, ramp * ramp * (3 - 2 * ramp)));
      }
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [waveAt]);

  return (
    <svg viewBox="0 0 80 104" className="w-full overflow-visible" aria-hidden>
      <path
        ref={cloth}
        d={clothPath(0, 0)}
        fill={TEAM_FILL[side]}
        stroke="var(--ink)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect x="11" y="4" width="6" height="96" rx="3" fill="var(--ink)" />
    </svg>
  );
}

/**
 * 一局結束：獲勝隊的大旗從天上掉下來插進棋盤、畫面震一下、隊色紙屑從旗子炸開，
 * 再從獲勝那一側連發，隊色紙膠帶寫「x 獲勝！」。平手沒有誰的旗子，給一張中性卡。
 */
export function VictoryOverlay({
  winner,
  winnerName,
  detail,
  sound,
  onRestart,
}: {
  winner: Side | null;
  winnerName: string;
  /** 題目出完、比格數分勝負時的說明；吃光對手時不給 */
  detail: string | null;
  sound: boolean;
  onRestart: () => void;
}) {
  const anchor = useRef<HTMLDivElement>(null);
  const { playVictorySound } = useSound();
  const hitAt = winner ? FLAG_LAND_MS : TIE_HIT_MS;

  useEffect(() => {
    if (!sound) return;
    const t = setTimeout(playVictorySound, hitAt);
    return () => clearTimeout(t);
    // 只在這次揭曉排一次，音量變動不重播
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sound]);

  return (
    <div
      className="victory absolute inset-0"
      data-kind={winner ? "flag" : "tie"}
      style={{ "--hit": `${hitAt}ms` } as CSSProperties}
    >
      <StageConfetti
        onReady={(fire) => {
          const colors = TEAM_CONFETTI[winner ?? "tie"];
          const timers: ReturnType<typeof setTimeout>[] = [
            setTimeout(() => paperBurst(fire, originOf(anchor.current), 260, 160, colors), hitAt),
            setTimeout(() => {
              timers.push(
                paperCannons(fire, 1400, {
                  colors,
                  sides: winner ? [winner] : ["left", "right"],
                }),
              );
            }, hitAt + 300),
          ];
          return () => timers.forEach(clearTimeout);
        }}
      />

      <div className="absolute inset-0 isolate grid place-items-center p-[4cqw]">
        {winner ? (
          <div className="flex flex-col items-center">
            <div aria-hidden className="victory-late absolute inset-0 -z-10 bg-paper/60" />
            <div ref={anchor} className="victory-flag relative w-[clamp(7rem,20cqw,18rem)]">
              <Flag side={winner} waveAt={hitAt} />
            </div>
            <p className={cn("victory-tape mt-[1.5cqw] px-[4cqw] py-[1cqw] text-paper", TITLE, TEAM_BG[winner])}>
              {winnerName} 獲勝！
            </p>
            {detail && (
              <p className={cn("victory-late mt-[1.5cqw] rounded-full bg-card px-[2cqw] py-[0.5cqw] text-muted-foreground", DETAIL)}>
                {detail}
              </p>
            )}
            <Button size="lg" className={cn("victory-late mt-[2cqw]", RESTART)} onClick={onRestart}>
              再來一局
            </Button>
          </div>
        ) : (
          <div ref={anchor} className="quiz-enter flex flex-col items-center gap-[2cqw] rounded-[2cqw] bg-card px-[5cqw] py-[3.5cqw] text-center shadow-lg">
            <p className={cn("text-ink", TITLE)}>平手！</p>
            {detail && <p className={cn("text-muted-foreground", DETAIL)}>{detail}</p>}
            <Button size="lg" className={RESTART} onClick={onRestart}>
              再來一局
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
