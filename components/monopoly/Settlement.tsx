"use client";

import { Button } from "@/components/atoms/shadcn/button";
import { realisticEffect } from "@/lib/helpers/confetti-effects";
import { useSound } from "@/lib/hooks/useSound";
import { settle, type BonusAward, type SettlementRow } from "@/lib/monopoly/rules";
import { BONUS_LABEL, type GameState, type Player } from "@/lib/monopoly/types";
import { cn } from "@/lib/utils";
import { ArrowRight, RotateCcw } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlayerAvatar } from "./Avatar";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const PRESS = "transition-transform duration-press ease-out active:scale-[0.97]";
// 「最終結果是...」停多久才揭曉：三個點各一拍
const DRUM_MS = 1500;

function countText(a: BonusAward, count: number): string {
  switch (a.key) {
    case "land":
      return `${count} 塊地`;
    case "house":
      return `${count} 棟房`;
    case "mostCorrect":
      return `答對 ${count} 題`;
    case "mostJail":
      return `進監獄 ${count} 次`;
    case "mostChance":
      return `機會 ${count} 次`;
    case "mostFate":
      return `命運 ${count} 次`;
  }
}

const money = (n: number) => `$${n.toLocaleString()}`;

// 結算頁：取代棋盤的整頁畫面，老師按「繼續」一步步推進（投影時用遙控筆的 → 也行）。
// 第 0 幕現金排名 → 每項加分一幕（只公佈得獎者，中間不排名）→ 停頓 → 頒獎台。
// 結果由 settle() 算，不寫回 money：gameover 的局會 persist，重整不能再加一次。
export function Settlement({
  game,
  onRestart,
}: {
  game: GameState;
  onRestart: () => void;
}) {
  const { awards, rows } = useMemo(() => settle(game), [game]);
  const players = useMemo(() => game.players, [game.players]);
  const reduce = !!useReducedMotion();
  const { playBonusSound, playCountdownTick, playVictorySound } = useSound();
  // scene：0 現金、1..n 第幾項加分、n+1 最終結果
  const finalScene = awards.length + 1;
  const [scene, setScene] = useState(0);
  const [drumming, setDrumming] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const next = useCallback(() => {
    if (drumming || scene >= finalScene) return;
    const to = scene + 1;
    if (to < finalScene) {
      setScene(to);
      // 得獎者彈出來的那一刻響
      if (awards[to - 1].winners.length > 0) later(playBonusSound, reduce ? 0 : 380);
      return;
    }
    // 最後一步：先停頓「最終結果是...」，每個點一聲，再揭曉
    setDrumming(true);
    [0, 1, 2].forEach((d) => later(playCountdownTick, 300 + d * 400));
    later(() => {
      setDrumming(false);
      setScene(finalScene);
      later(() => {
        playVictorySound();
        realisticEffect();
      }, reduce ? 0 : 900);
    }, DRUM_MS);
    // later 只寫 ref，不必列進依賴
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drumming, scene, finalScene, awards, reduce, playBonusSound, playCountdownTick, playVictorySound]);

  // 遙控筆／鍵盤翻頁：焦點在按鈕上時讓按鈕自己處理 Enter／空白，免得一次跳兩幕
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!["ArrowRight", "PageDown", " ", "Enter"].includes(e.key)) return;
      if ((e.target as HTMLElement).closest("button, input, textarea, select")) return;
      e.preventDefault();
      next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next]);

  const enter = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, transform: "translateY(16px)" },
        animate: { opacity: 1, transform: "translateY(0px)" },
        exit: { opacity: 0, transform: "translateY(-8px)", transition: { duration: 0.16, ease: EASE_OUT } },
      };
  const done = scene === finalScene;
  const nextLabel =
    scene + 1 < finalScene
      ? scene === 0
        ? "公佈加分"
        : "下一項加分"
      : "公佈最終結果";

  return (
    <section className="flex min-h-[calc(100svh-5rem)] w-full max-w-5xl flex-col gap-6 px-2 py-4 sm:px-6">
      <Progress awards={awards} scene={scene} />

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {drumming ? (
            <motion.div key="drum" {...enter} transition={{ duration: 0.26, ease: EASE_OUT }}>
              <DrumRoll />
            </motion.div>
          ) : (
            <motion.div
              key={scene}
              {...enter}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className="flex w-full flex-col items-center"
            >
              {scene === 0 && <CashScene rows={rows} reduce={reduce} />}
              {scene > 0 && !done && (
                <AwardScene award={awards[scene - 1]} index={scene - 1} total={awards.length} players={players} reduce={reduce} />
              )}
              {done && <FinalScene rows={rows} reduce={reduce} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-end gap-3">
        {done ? (
          <Button size="lg" className={cn("h-14 rounded-full px-8 text-lg font-bold", PRESS)} onClick={onRestart}>
            <RotateCcw className="size-5" />
            回到設定，再玩一局
          </Button>
        ) : (
          <Button
            size="lg"
            disabled={drumming}
            className={cn("h-14 rounded-full px-8 text-lg font-bold", PRESS)}
            onClick={next}
          >
            {nextLabel}
            <ArrowRight className="size-5" />
          </Button>
        )}
      </div>
    </section>
  );
}

// 上方進度點：現金 → 各項加分 → 結果，老師一眼知道還剩幾項；名稱在每一幕的標題上
function Progress({ awards, scene }: { awards: BonusAward[]; scene: number }) {
  const steps = ["現金排名", ...awards.map((a) => BONUS_LABEL[a.key].title), "最終結果"];
  return (
    <ol className="flex items-center justify-center gap-2" aria-label="結算進度">
      {steps.map((label, i) => (
        <li
          key={label}
          aria-label={label}
          aria-current={i === scene ? "step" : undefined}
          className={cn(
            "h-2 rounded-full transition-[width,background-color] duration-enter ease-out",
            i === scene ? "w-8 bg-ink" : i < scene ? "w-2 bg-ink-soft/50" : "w-2 bg-border",
          )}
        />
      ))}
    </ol>
  );
}

function SceneTitle({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <header className="mb-8 flex flex-col items-center gap-3 text-center">
      {/* 紙膠帶標籤：從左往右貼上 */}
      <span className="-rotate-2 bg-brand-yellow px-4 py-1 text-base font-black text-ink motion-safe:animate-[tape-in_360ms_var(--ease-out)_both]">
        {eyebrow}
      </span>
      <h2 className="font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-tight font-black text-ink">{title}</h2>
      {sub && <p className="text-body-lg text-ink-soft">{sub}</p>}
    </header>
  );
}

function CashScene({ rows, reduce }: { rows: SettlementRow[]; reduce: boolean }) {
  const order = [...rows].sort((a, b) => b.money - a.money);
  return (
    <>
      <SceneTitle eyebrow="遊戲結束" title="先看手上的錢" />
      <ol className={cn("grid w-full gap-2", order.length > 8 ? "sm:grid-cols-2" : "mx-auto max-w-2xl")}>
        {order.map((r, i) => (
          <motion.li
            key={r.player.id}
            initial={reduce ? false : { opacity: 0, transform: "translateY(10px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.3, ease: EASE_OUT, delay: 0.15 + Math.min(i, 12) * 0.05 }}
            className="flex items-center gap-3 rounded-2xl bg-card px-4 py-2.5 ring-1 ring-ink/[0.06]"
          >
            <span className="w-7 shrink-0 text-center text-lg font-bold text-ink-soft tabular-nums">{i + 1}</span>
            <PlayerAvatar character={r.player.character} color={r.player.color} size={40} />
            <span className="min-w-0 flex-1 truncate text-lg font-bold text-ink">{r.player.name}</span>
            <span className="shrink-0 text-xl font-extrabold text-brand-green tabular-nums">{money(r.money)}</span>
          </motion.li>
        ))}
      </ol>
    </>
  );
}

function AwardScene({
  award,
  index,
  total,
  players,
  reduce,
}: {
  award: BonusAward;
  index: number;
  total: number;
  players: Player[];
  reduce: boolean;
}) {
  const label = BONUS_LABEL[award.key];
  const winners = [...award.winners].sort((a, b) => b.amount - a.amount);
  // 一到三位得獎者給大舞台，多的時候（每塊地、每棟房）縮成卡片牆
  const big = winners.length <= 3;
  return (
    <>
      <SceneTitle
        eyebrow={`加分 ${index + 1} / ${total}`}
        title={label.title}
        sub={`${label.unit} +${money(award.amount)}`}
      />
      {winners.length === 0 ? (
        <p className="rounded-2xl bg-muted px-6 py-4 text-body-lg text-ink-soft">這一項沒有人拿到</p>
      ) : (
        <ul className={cn("flex w-full flex-wrap justify-center", big ? "gap-10" : "gap-3")}>
          {winners.map((w, i) => {
            const p = players.find((x) => x.id === w.playerId)!;
            return (
              <motion.li
                key={w.playerId}
                initial={reduce ? false : { opacity: 0, transform: "translateY(12px) scale(0.85)" }}
                animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
                transition={{ type: "spring", duration: 0.55, bounce: 0.35, delay: 0.3 + Math.min(i, 12) * 0.06 }}
                className={cn(
                  "flex flex-col items-center text-center",
                  big ? "gap-2" : "w-36 gap-1 rounded-2xl bg-card px-3 py-3 ring-1 ring-ink/[0.06]",
                )}
              >
                <PlayerAvatar character={p.character} color={p.color} size={big ? 136 : 56} ringWidth={big ? 5 : undefined} />
                <span className={cn("max-w-full truncate font-black text-ink", big ? "mt-1 text-h2" : "text-base")}>
                  {p.name}
                </span>
                <span className={cn("text-muted-foreground", big ? "text-body-lg" : "text-caption")}>
                  {countText(award, w.count)}
                </span>
                <span className={cn("font-black text-brand-green tabular-nums", big ? "text-4xl" : "text-lg")}>
                  +{money(w.amount)}
                </span>
              </motion.li>
            );
          })}
        </ul>
      )}
    </>
  );
}

function DrumRoll() {
  return (
    <p className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-black text-ink">
      最終結果是
      {[0, 1, 2].map((d) => (
        <motion.span
          key={d}
          className="inline-block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 + d * 0.4, duration: 0.15 }}
        >
          .
        </motion.span>
      ))}
    </p>
  );
}

// 頒獎台：三、二、一依序升起，冠軍最後上台；其餘名次列在下面，附現金＋加分
const PODIUM = [
  { rank: 1, order: "order-2", height: "h-40 sm:h-48", medal: "🥇", bar: "bg-brand-yellow", delay: 0.75 },
  { rank: 2, order: "order-1", height: "h-28 sm:h-32", medal: "🥈", bar: "bg-stone", delay: 0.4 },
  { rank: 3, order: "order-3", height: "h-20 sm:h-24", medal: "🥉", bar: "bg-sand", delay: 0.1 },
];

function FinalScene({ rows, reduce }: { rows: SettlementRow[]; reduce: boolean }) {
  const rest = rows.slice(3);
  return (
    <>
      <SceneTitle eyebrow="最終結果" title={`${rows[0].player.name} 獲勝！`} />
      <div className="flex w-full max-w-3xl items-end justify-center gap-3 sm:gap-5">
        {PODIUM.filter((s) => rows[s.rank - 1]).map((s) => {
          const r = rows[s.rank - 1];
          return (
            <div key={s.rank} className={cn("flex w-1/3 max-w-56 flex-col items-center", s.order)}>
              <motion.div
                className="mb-2 flex flex-col items-center gap-1 text-center"
                initial={reduce ? false : { opacity: 0, transform: "translateY(16px) scale(0.9)" }}
                animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
                transition={{ type: "spring", duration: 0.6, bounce: 0.35, delay: s.delay + 0.25 }}
              >
                <PlayerAvatar
                  character={r.player.character}
                  color={r.player.color}
                  size={s.rank === 1 ? 104 : 72}
                  ringWidth={s.rank === 1 ? 5 : undefined}
                />
                <span className={cn("max-w-full truncate font-black text-ink", s.rank === 1 ? "text-h2" : "text-h3 max-sm:text-body")}>
                  {r.player.name}
                </span>
                <span className={cn("font-extrabold text-brand-green tabular-nums", s.rank === 1 ? "text-3xl max-sm:text-2xl" : "text-xl max-sm:text-lg")}>
                  {money(r.total)}
                </span>
                {/* 手機台上擠不下明細 */}
                {r.bonus > 0 && (
                  <span className="text-caption text-muted-foreground tabular-nums max-sm:hidden">
                    {money(r.money)}＋加分 {money(r.bonus)}
                  </span>
                )}
              </motion.div>
              {/* 台子從底下升上來：外層裁切，裡面整塊位移，不動高度 */}
              <div className={cn("w-full overflow-hidden rounded-t-2xl", s.height)}>
                <motion.div
                  className={cn("flex h-full w-full items-start justify-center pt-3 text-4xl", s.bar)}
                  initial={reduce ? false : { transform: "translateY(100%)" }}
                  animate={{ transform: "translateY(0%)" }}
                  transition={{ duration: 0.5, ease: EASE_OUT, delay: s.delay }}
                >
                  {s.medal}
                </motion.div>
              </div>
            </div>
          );
        })}
      </div>

      {rest.length > 0 && (
        <motion.ol
          className={cn("mt-6 grid w-full gap-2", rest.length > 6 ? "sm:grid-cols-2" : "mx-auto max-w-2xl")}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1.4 }}
        >
          {rest.map((r, i) => (
            <li key={r.player.id} className="flex items-center gap-3 rounded-2xl bg-card px-4 py-2 ring-1 ring-ink/[0.06]">
              <span className="w-7 shrink-0 text-center font-bold text-ink-soft tabular-nums">{i + 4}</span>
              <PlayerAvatar character={r.player.character} color={r.player.color} size={32} />
              <span className="min-w-0 flex-1 truncate font-bold text-ink">{r.player.name}</span>
              <span className="shrink-0 text-right">
                <span className="block font-extrabold text-brand-green tabular-nums">{money(r.total)}</span>
                {r.bonus > 0 && (
                  <span className="block text-caption text-muted-foreground tabular-nums">
                    {money(r.money)}＋{money(r.bonus)}
                  </span>
                )}
              </span>
            </li>
          ))}
        </motion.ol>
      )}
    </>
  );
}
