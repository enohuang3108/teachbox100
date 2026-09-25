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
import type { Side } from "@/lib/morris/game";
import { cn } from "@/lib/utils";

/** 大圈叉畫完的那一刻；紙屑、音效、紙膠帶都對著它。改了要一起改 globals.css 的 morris-win-mark */
const HIT_MS = 620;

const TEAM_BG: Record<Side, string> = { red: "bg-brand-red", blue: "bg-brand-blue" };
const TEAM_TEXT: Record<Side, string> = { red: "text-brand-red", blue: "text-brand-blue" };
/** 紅隊在左、藍隊在右，紙屑砲從獲勝那一側發 */
const TEAM_EDGE: Record<Side, "left" | "right"> = { red: "left", blue: "right" };
const TEAM_CONFETTI: Record<Side, string[]> = {
  red: [BRAND.red, BRAND.red, BRAND.paperWarm, BRAND.yellow],
  blue: [BRAND.blue, BRAND.blue, BRAND.paperWarm, BRAND.yellow],
};

/**
 * 圈叉搶答連線獲勝：畫面中央用隊色一筆一筆畫出大大的 ○ 或 ×，畫完從它炸開紙屑，
 * 再從獲勝那一側連發，隊色紙膠帶寫「x 獲勝！」。放在 @container 的舞台裡，尺寸跟著舞台走。
 */
export function MorrisVictory({
  winner,
  winnerName,
  sound,
  onRestart,
  onSettings,
}: {
  winner: Side;
  winnerName: string;
  sound: boolean;
  onRestart: () => void;
  onSettings: () => void;
}) {
  const mark = useRef<HTMLDivElement>(null);
  const colors = TEAM_CONFETTI[winner];
  const { playVictorySound } = useSound();

  useEffect(() => {
    if (!sound) return;
    const t = setTimeout(playVictorySound, HIT_MS);
    return () => clearTimeout(t);
    // 只在這次揭曉排一次，音量變動不重播
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute inset-0" style={{ "--hit": `${HIT_MS}ms` } as CSSProperties}>
      <StageConfetti
        onReady={(fire) => {
          const timers: ReturnType<typeof setTimeout>[] = [
            setTimeout(() => paperBurst(fire, originOf(mark.current), 240, 200, colors), HIT_MS),
            setTimeout(
              () => timers.push(paperCannons(fire, 1400, { colors, sides: [TEAM_EDGE[winner]] })),
              HIT_MS + 300,
            ),
          ];
          return () => timers.forEach(clearTimeout);
        }}
      />
      <div aria-hidden className="morris-win-fade absolute inset-0 bg-paper/70" />

      <div className="absolute inset-0 grid place-items-center p-[4cqw]">
        <div className="flex flex-col items-center">
          <div ref={mark} className="morris-win-mark size-[clamp(8rem,20cqw,18rem)]">
            <svg viewBox="0 0 100 100" className={cn("size-full", TEAM_TEXT[winner])} aria-hidden>
              {winner === "red" ? (
                <circle cx="50" cy="50" r="38" pathLength={1} fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
              ) : (
                <>
                  <line x1="18" y1="18" x2="82" y2="82" pathLength={1} stroke="currentColor" strokeWidth="13" strokeLinecap="round" />
                  <line x1="82" y1="18" x2="18" y2="82" pathLength={1} stroke="currentColor" strokeWidth="13" strokeLinecap="round" />
                </>
              )}
            </svg>
          </div>
          <p
            className={cn(
              "victory-tape mt-[1.5cqw] px-[4cqw] py-[1cqw] font-display text-[clamp(2rem,6cqw,5.5rem)] leading-tight font-extrabold text-paper",
              TEAM_BG[winner],
            )}
          >
            {winnerName} 獲勝！
          </p>
          <div className="victory-late mt-[2cqw] flex gap-[1cqw]">
            <Button size="lg" className="rounded-full active:scale-[0.97]" onClick={onRestart}>
              再玩一次
            </Button>
            <Button size="lg" variant="outline" className="rounded-full active:scale-[0.97]" onClick={onSettings}>
              設定
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
