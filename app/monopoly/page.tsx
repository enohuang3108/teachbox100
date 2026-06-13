"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { PlayerAvatar } from "@/components/monopoly/Avatar";
import { Board } from "@/components/monopoly/Board";
import { CardDialog } from "@/components/monopoly/CardDialog";
import { Dice } from "@/components/monopoly/Dice";
import { GameOverDialog } from "@/components/monopoly/GameOverDialog";
import { MoneyDisplay } from "@/components/monopoly/MoneyDisplay";
import { QuestionDialog } from "@/components/monopoly/QuestionDialog";
import { SetupPanel } from "@/components/monopoly/SetupPanel";
import { TurnBanner } from "@/components/monopoly/TurnBanner";
import { BOARD_SIZE } from "@/lib/monopoly/board";
import type { Player } from "@/lib/monopoly/types";
import { realisticEffect } from "@/lib/helpers/confetti-effects";
import { useMonopolyStore } from "@/lib/monopoly/store";

const STEP_MS = 240; // 每走一格的間隔
const ROLL_MS = 1333; // 擲骰 Lottie 動畫長度（80 幀 @ 60fps）

export default function MonopolyPage() {
  const [hydrated, setHydrated] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [rollSeq, setRollSeq] = useState(0);
  const [logOpen, setLogOpen] = useState(false);
  const [walk, setWalk] = useState<{ playerId: string; pos: number } | null>(
    null,
  );
  const [landing, setLanding] = useState<{ pos: number; color: string } | null>(
    null,
  );
  const [turnPlayer, setTurnPlayer] = useState<Player | null>(null);
  const banneredIdx = useRef<number | null>(null);
  const { game, roll, answer, confirm, resolveCard, reset } =
    useMonopolyStore();

  const pa = game?.pendingAction ?? null;
  const animating = rolling || walk !== null;

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (game?.phase === "gameover") realisticEffect();
  }, [game?.phase]);

  // 回合轉場：棋子走完、無待處理事件的閒置時刻才彈橫幅（首次掛載不彈）
  // 並等金額滾動動畫跑完再彈，避免蓋住正在跳動的金額
  useEffect(() => {
    if (!game || game.phase !== "playing") {
      banneredIdx.current = null;
      return;
    }
    if (animating || pa !== null) return;
    const idx = game.currentPlayerIndex;
    if (banneredIdx.current === idx) return;
    const first = banneredIdx.current === null;
    banneredIdx.current = idx;
    if (first) return;
    const t = window.setTimeout(() => {
      // 觸發前再次確認：仍是同一位、無待處理事件才彈（避免下一位已搶先操作）
      const g = useMonopolyStore.getState().game;
      if (
        g?.phase === "playing" &&
        g.currentPlayerIndex === idx &&
        !g.pendingAction
      ) {
        setTurnPlayer(g.players[idx]);
      }
    }, 850);
    return () => window.clearTimeout(t);
  }, [game, animating, pa]);

  // 橫幅自動消失
  useEffect(() => {
    if (!turnPlayer) return;
    const t = window.setTimeout(() => setTurnPlayer(null), 1600);
    return () => window.clearTimeout(t);
  }, [turnPlayer]);

  if (!hydrated) return null;

  if (!game || game.phase === "setup") {
    return <SetupPanel />;
  }

  const rollDisabled = pa !== null;

  // 擲骰流程：翻滾動畫 → 結算 → 棋子一格一格走 → 結束後才觸發後續事件
  function handleRoll() {
    if (!game || rollDisabled || animating) return;
    const moverIdx = game.currentPlayerIndex;
    const mover = game.players[moverIdx];
    const fromPos = mover.position;
    const moverId = mover.id;

    // 先把棋子釘在起點並啟動擲骰動畫，接著立刻擲骰取得實際點數
    // （動畫期間 walk 已設值，animating 為真，買地／問答對話框不會提早跳出）
    setWalk({ playerId: moverId, pos: fromPos });
    setRolling(true);
    setRollSeq((s) => s + 1);
    roll();

    const next = useMonopolyStore.getState().game;
    const dice = next?.lastRoll;
    const steps = dice ? dice.reduce((a, b) => a + b, 0) : 0;

    // 等擲骰動畫落定後，棋子再一格一格走
    window.setTimeout(() => {
      setRolling(false);
      if (steps <= 0) {
        setWalk(null); // 暫停回合等情況：不走格
        return;
      }

      let step = 0;
      const advance = () => {
        step += 1;
        setWalk({ playerId: moverId, pos: (fromPos + step) % BOARD_SIZE });
        if (step >= steps) {
          // 最後一步落定後解除，並在落點脈動一圈代表色光環
          window.setTimeout(() => {
            setWalk(null);
            setLanding({
              pos: (fromPos + steps) % BOARD_SIZE,
              color: mover.color,
            });
            window.setTimeout(() => setLanding(null), 560);
          }, STEP_MS);
          return;
        }
        window.setTimeout(advance, STEP_MS);
      };
      advance();
    }, ROLL_MS);
  }

  const center = (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-4 py-2">
      {/* 玩家清單：輪到的放大上色、其餘黑白 */}
      <div className="flex flex-wrap items-end justify-center gap-x-5 gap-y-2">
        {game.players.map((p, i) => {
          const active = i === game.currentPlayerIndex;
          return (
            <motion.div
              key={p.id}
              layout
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className={`flex flex-col items-center gap-1 ${
                p.bankrupt ? "opacity-40" : ""
              }`}
            >
              <motion.div
                layout
                className={
                  active ? "" : "opacity-70 grayscale transition duration-300"
                }
              >
                <PlayerAvatar
                  character={p.character}
                  color={p.color}
                  size={active ? 84 : 44}
                />
              </motion.div>
              <div className="text-center leading-tight">
                <div
                  className={`max-w-[6rem] truncate font-bold ${
                    active ? "text-sm text-stone-800" : "text-xs text-stone-400"
                  }`}
                >
                  {p.name}
                  {p.bankrupt && "（破產）"}
                </div>
                <div
                  className={`font-extrabold tabular-nums ${
                    active ? "text-sm" : "text-xs"
                  }`}
                >
                  <MoneyDisplay value={p.money} className="text-emerald-700" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <Dice
        lastRoll={game.lastRoll}
        rolling={rolling}
        rollSeq={rollSeq}
        disabled={rollDisabled || animating}
        onRoll={handleRoll}
      />
    </div>
  );

  return (
    <main className="min-h-screen bg-[#fbf6ec] bg-[radial-gradient(circle_at_22%_12%,oklch(0.95_0.05_85),transparent_55%),radial-gradient(circle_at_88%_90%,oklch(0.94_0.04_160),transparent_55%)]">
      {/* 右上角控制：事件紀錄 trigger + 重新開始 */}
      <div className="fixed right-3 top-3 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setLogOpen(true)}
          title="事件紀錄"
          aria-label="事件紀錄"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-50 text-lg shadow-md ring-1 ring-stone-900/5 transition hover:bg-stone-100"
        >
          📜
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-stone-50 px-4 py-2 text-xs font-medium text-stone-500 shadow-md ring-1 ring-stone-900/5 transition hover:text-stone-800"
        >
          重新開始
        </button>
      </div>

      <div className="flex min-h-screen items-center justify-center p-2">
        <Board
          players={game.players}
          currentIndex={game.currentPlayerIndex}
          walking={walk}
          landing={landing}
          center={center}
        />
      </div>

      <TurnBanner player={turnPlayer} />

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-[2px]">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 24 }}
        className="w-full max-w-sm space-y-4 rounded-2xl bg-stone-50 p-6 shadow-2xl ring-1 ring-stone-900/5"
      >
        <p className="text-center text-lg font-bold text-stone-800">{label}</p>
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
            className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 font-medium text-stone-500 transition hover:bg-stone-100"
            onClick={() => onConfirm(false)}
          >
            跳過
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function LogDialog({ log, onClose }: { log: string[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-[2px]">
      <div className="flex max-h-[70vh] w-full max-w-md flex-col rounded-2xl bg-stone-50 p-5 shadow-2xl ring-1 ring-stone-900/5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-stone-800">事件紀錄</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="rounded-full px-2 text-stone-400 transition hover:text-stone-700"
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto text-sm leading-snug text-stone-600">
          {log.length === 0 ? (
            <p className="text-stone-400">尚無紀錄</p>
          ) : (
            log.map((line, i) => (
              <div
                key={i}
                className={
                  i === 0 ? "font-semibold text-stone-800" : "text-stone-500"
                }
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
