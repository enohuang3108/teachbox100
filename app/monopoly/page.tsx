"use client";

import { useEffect, useState } from "react";
import { PlayerAvatar } from "@/components/monopoly/Avatar";
import { Board } from "@/components/monopoly/Board";
import { CardDialog } from "@/components/monopoly/CardDialog";
import { Dice } from "@/components/monopoly/Dice";
import { GameOverDialog } from "@/components/monopoly/GameOverDialog";
import { QuestionDialog } from "@/components/monopoly/QuestionDialog";
import { SetupPanel } from "@/components/monopoly/SetupPanel";
import { BOARD_SIZE } from "@/lib/monopoly/board";
import { realisticEffect } from "@/lib/helpers/confetti-effects";
import { useMonopolyStore } from "@/lib/monopoly/store";

const STEP_MS = 240; // 每走一格的間隔

export default function MonopolyPage() {
  const [hydrated, setHydrated] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
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
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-4 py-2">
      {/* 玩家清單：輪到的放大上色、其餘黑白 */}
      <div className="flex flex-wrap items-end justify-center gap-x-5 gap-y-2">
        {game.players.map((p, i) => {
          const active = i === game.currentPlayerIndex;
          return (
            <div
              key={p.id}
              className={`flex flex-col items-center gap-1 transition ${
                p.bankrupt ? "opacity-40" : ""
              }`}
            >
              <div className={active ? "" : "grayscale"}>
                <PlayerAvatar
                  id={p.id}
                  color={p.color}
                  size={active ? 84 : 44}
                />
              </div>
              <div className="text-center leading-tight">
                <div
                  className={`max-w-[5.5rem] truncate text-xs font-bold ${
                    active ? "text-zinc-900" : "text-zinc-400"
                  }`}
                >
                  {p.name}
                  {p.bankrupt && "（破產）"}
                </div>
                <div className="text-[11px] font-extrabold tabular-nums text-emerald-700">
                  ${p.money.toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Dice
        lastRoll={game.lastRoll}
        rolling={rolling}
        count={game.settings.diceCount}
        disabled={rollDisabled || animating}
        onRoll={handleRoll}
      />
    </div>
  );

  return (
    <main className="min-h-screen bg-amber-50/50 bg-[radial-gradient(circle_at_25%_15%,#fef3c7,transparent_55%),radial-gradient(circle_at_85%_85%,#d1fae5,transparent_55%)]">
      {/* 右上角控制：事件紀錄 trigger + 重新開始 */}
      <div className="fixed right-3 top-3 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setLogOpen(true)}
          title="事件紀錄"
          aria-label="事件紀錄"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-md ring-1 ring-black/5 transition hover:bg-zinc-50"
        >
          📜
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-white px-4 py-2 text-xs font-medium text-zinc-500 shadow-md ring-1 ring-black/5 transition hover:text-zinc-800"
        >
          重新開始
        </button>
      </div>

      <div className="flex min-h-screen items-center justify-center p-2">
        <Board
          players={game.players}
          currentIndex={game.currentPlayerIndex}
          walking={walk}
          center={center}
        />
      </div>

      {logOpen && (
        <LogDialog log={game.log} onClose={() => setLogOpen(false)} />
      )}

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

function LogDialog({ log, onClose }: { log: string[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[70vh] w-full max-w-md flex-col rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-800">事件紀錄</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="rounded-full px-2 text-zinc-400 transition hover:text-zinc-700"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto text-sm leading-snug text-zinc-600">
          {log.length === 0 ? (
            <p className="text-zinc-400">尚無紀錄</p>
          ) : (
            log.map((line, i) => (
              <div
                key={i}
                className={i === 0 ? "font-semibold text-zinc-800" : ""}
              >
                {line}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
