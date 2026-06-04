"use client";

import { useEffect, useState } from "react";
import { Board } from "@/components/monopoly/Board";
import { CardDialog } from "@/components/monopoly/CardDialog";
import { Dice } from "@/components/monopoly/Dice";
import { GameOverDialog } from "@/components/monopoly/GameOverDialog";
import { PlayerPanel } from "@/components/monopoly/PlayerPanel";
import { QuestionDialog } from "@/components/monopoly/QuestionDialog";
import { SetupPanel } from "@/components/monopoly/SetupPanel";
import { BOARD_SIZE } from "@/lib/monopoly/board";
import { realisticEffect } from "@/lib/helpers/confetti-effects";
import { useMonopolyStore } from "@/lib/monopoly/store";

const STEP_MS = 240; // 每走一格的間隔

export default function MonopolyPage() {
  const [hydrated, setHydrated] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [walk, setWalk] = useState<{ playerId: string; pos: number } | null>(
    null,
  );
  const { game, roll, answer, confirm, resolveCard, reset } =
    useMonopolyStore();

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (game?.phase === "gameover") realisticEffect();
  }, [game?.phase]);

  if (!hydrated) return null;

  if (!game || game.phase === "setup") {
    return <SetupPanel />;
  }

  const pa = game.pendingAction;
  const rollDisabled = pa !== null;
  const current = game.players[game.currentPlayerIndex];
  const animating = rolling || walk !== null;

  // 擲骰流程：翻滾動畫 → 結算 → 棋子一格一格走 → 結束後才觸發後續事件
  function handleRoll() {
    if (!game || rollDisabled || animating) return;
    const moverIdx = game.currentPlayerIndex;
    const mover = game.players[moverIdx];
    const fromPos = mover.position;
    const moverId = mover.id;

    setRolling(true);
    window.setTimeout(() => {
      setRolling(false);
      roll();

      const next = useMonopolyStore.getState().game;
      const dice = next?.lastRoll;
      const steps = dice ? dice.reduce((a, b) => a + b, 0) : 0;
      if (steps <= 0) return; // 暫停回合等情況：不走格

      let step = 0;
      const advance = () => {
        step += 1;
        setWalk({ playerId: moverId, pos: (fromPos + step) % BOARD_SIZE });
        if (step >= steps) {
          window.setTimeout(() => setWalk(null), STEP_MS); // 最後一步落定後解除
          return;
        }
        window.setTimeout(advance, STEP_MS);
      };
      advance();
    }, 700);
  }

  const center = (
    <div className="flex w-full max-w-[18rem] flex-col items-center gap-3 text-center">
      <div className="text-[11px] font-black tracking-[0.3em] text-emerald-700/60">
        TEACHBOX 大富翁
      </div>
      <div className="flex items-center gap-2 rounded-full bg-white px-4 py-1.5 shadow-sm ring-1 ring-black/5">
        <span
          className="h-3 w-3 rounded-full"
          style={{ background: current?.color }}
        />
        <span className="text-sm font-bold text-zinc-800">
          輪到 {current?.name}
        </span>
      </div>
      <Dice
        lastRoll={game.lastRoll}
        rolling={rolling}
        count={game.settings.diceCount}
        disabled={rollDisabled || animating}
        onRoll={handleRoll}
      />
      <div className="w-full space-y-0.5 rounded-xl bg-white/70 p-2 text-left text-[11px] leading-snug text-zinc-500 ring-1 ring-black/5">
        {game.log.slice(0, 3).map((line, i) => (
          <div key={i} className={i === 0 ? "font-semibold text-zinc-800" : ""}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-amber-50/50 bg-[radial-gradient(circle_at_25%_15%,#fef3c7,transparent_55%),radial-gradient(circle_at_85%_85%,#d1fae5,transparent_55%)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 lg:flex-row lg:items-start lg:justify-center">
        <div className="flex min-w-0 flex-1 justify-center">
          <Board
            players={game.players}
            currentIndex={game.currentPlayerIndex}
            walking={walk}
            center={center}
          />
        </div>

        <aside className="flex w-full flex-col gap-3 lg:h-[min(820px,calc(100vh-2rem))] lg:w-80">
          <div className="flex items-center justify-between px-1">
            <h1 className="text-xl font-black text-emerald-800">大富翁</h1>
            <button
              type="button"
              className="rounded-full px-3 py-1 text-xs font-medium text-zinc-400 transition hover:bg-white hover:text-zinc-600"
              onClick={reset}
            >
              重新開始
            </button>
          </div>
          <PlayerPanel game={game} />
        </aside>
      </div>

      {!animating &&
        (pa?.kind === "buyQuestion" || pa?.kind === "buildQuestion") && (
          <QuestionDialog
            pending={pa}
            question={pa.question}
            onAnswered={answer}
          />
        )}
      {!animating &&
        (pa?.kind === "confirmBuy" || pa?.kind === "confirmBuild") && (
          <PurchaseConfirm
            label={
              pa.kind === "confirmBuy" ? "購買這塊地？" : "在這裡蓋一棟房子？"
            }
            onConfirm={confirm}
          />
        )}
      {!animating && pa?.kind === "drawCard" && (
        <CardDialog pending={pa} onResolve={resolveCard} />
      )}

      <GameOverDialog game={game} onRestart={reset} />
    </main>
  );
}

function PurchaseConfirm({
  label,
  onConfirm,
}: {
  label: string;
  onConfirm: (accept: boolean) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
        <p className="text-center text-lg font-bold text-zinc-800">{label}</p>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 rounded-xl bg-emerald-500 px-4 py-2.5 font-bold text-white shadow-md shadow-emerald-500/30 transition hover:bg-emerald-600"
            onClick={() => onConfirm(true)}
          >
            購買
          </button>
          <button
            type="button"
            className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 font-medium text-zinc-500 transition hover:bg-zinc-50"
            onClick={() => onConfirm(false)}
          >
            跳過
          </button>
        </div>
      </div>
    </div>
  );
}
