"use client";

import { motion } from "motion/react";
import { RotateCcw, ScrollText } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PlayerAvatar } from "@/components/monopoly/Avatar";
import { AudioSettings } from "@/components/monopoly/AudioSettings";
import { BgmController } from "@/components/monopoly/BgmController";
import { Board } from "@/components/monopoly/Board";
import { CardDialog } from "@/components/monopoly/CardDialog";
import { Countdown } from "@/components/monopoly/Countdown";
import { Dice } from "@/components/monopoly/Dice";
import { GameOverDialog } from "@/components/monopoly/GameOverDialog";
import { MoneyCutscene } from "@/components/monopoly/MoneyCutscene";
import { MoneyDisplay } from "@/components/monopoly/MoneyDisplay";
import { QuestionDialog } from "@/components/monopoly/QuestionDialog";
import { SetupPanel } from "@/components/monopoly/SetupPanel";
import { TurnBanner } from "@/components/monopoly/TurnBanner";
import { BOARD, BOARD_SIZE } from "@/lib/monopoly/board";
import type { CutsceneEvent, Player } from "@/lib/monopoly/types";
import { isProperty } from "@/lib/monopoly/types";
import { realisticEffect } from "@/lib/helpers/confetti-effects";
import { useSound } from "@/lib/hooks/useSound";
import { useMonopolyStore } from "@/lib/monopoly/store";

const STEP_MS = 240; // 每走一格的間隔
const ROLL_MS = 1333; // 擲骰 Lottie 動畫長度（80 幀 @ 60fps）
const CUTSCENE_MS = 2500; // 金流／監獄／通過起點等過場顯示時間
const BANNER_MS = 2000; // 「換你了」橫幅顯示時間
const PASS_MS = CUTSCENE_MS; // 通過起點時暫停腳步、播 +2000 過場的時間

export default function MonopolyPage() {
  const [hydrated, setHydrated] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
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
  const [cutscene, setCutscene] = useState<CutsceneEvent | null>(null);
  const [queue, setQueue] = useState<CutsceneEvent[]>([]);
  const [displayIndex, setDisplayIndex] = useState(0); // 中央 HUD 高亮的角色（換場演完才切）
  const [displayMoney, setDisplayMoney] = useState<Record<string, number>>({}); // HUD 顯示用金額（過場演完才同步）
  const banneredIdx = useRef<number | null>(null);
  const pendingIdx = useRef<number | null>(null); // 換場演完後要切到的角色 index
  const lastEventSeq = useRef<number>(0);
  const synthSeq = useRef<number>(0); // page 自製過場（通過起點）的遞減 seq
  const { game, roll, answer, confirm, resolveCard, endIfTimeUp, reset } =
    useMonopolyStore();
  const { playDiceSound } = useSound();

  const pa = game?.pendingAction ?? null;
  const animating = rolling || walk !== null;
  // 棋子走動／過場播放中／還有待播過場 都算「忙碌」：暫不彈對話框、回合轉場、擲骰
  const busy = animating || cutscene !== null || queue.length > 0;

  useEffect(() => {
    setHydrated(true);
    // 進場時把已看過的事件 seq 設為當前最大值，避免重整後重播
    const evs = useMonopolyStore.getState().game?.cutsceneEvents ?? [];
    lastEventSeq.current = evs.length ? evs[evs.length - 1].seq : 0;
  }, []);

  // 收集規則產生的新過場事件，依序排入佇列（落地／結算類，走完棋再播）
  useEffect(() => {
    if (!game || game.phase !== "playing") return;
    const evs = game.cutsceneEvents ?? [];
    const fresh = evs.filter((e) => e.seq > lastEventSeq.current);
    if (fresh.length === 0) return;
    lastEventSeq.current = evs[evs.length - 1].seq;
    setQueue((q) => [...q, ...fresh]);
  }, [game]);

  // 逐一播放佇列：沒有正在播、棋子也走完時，取下一個來播
  useEffect(() => {
    if (cutscene || animating) return;
    if (queue.length === 0) return;
    setCutscene(queue[0]);
    setQueue((q) => q.slice(1));
  }, [queue, cutscene, animating]);

  // 過場自動消失（收租雙方演久一點）
  useEffect(() => {
    if (!cutscene) return;
    const t = window.setTimeout(() => setCutscene(null), CUTSCENE_MS);
    return () => window.clearTimeout(t);
  }, [cutscene]);

  useEffect(() => {
    if (game?.phase === "gameover") realisticEffect();
  }, [game?.phase]);

  // HUD 顯示用金額：只在「走棋＋過場都結束」的閒置時刻才同步到真實金額，
  // 走棋／支付過場期間維持舊值，讓金額在支付過場演完後才滾動到新值
  useEffect(() => {
    if (!game || busy) return;
    setDisplayMoney(
      Object.fromEntries(game.players.map((p) => [p.id, p.money])),
    );
  }, [game, busy]);

  // 回合轉場：棋子走完、無待處理事件的閒置時刻才彈橫幅（首次掛載不彈）
  // 並等金額滾動動畫跑完再彈，避免蓋住正在跳動的金額
  useEffect(() => {
    if (!game || game.phase !== "playing") {
      banneredIdx.current = null;
      return;
    }
    if (busy || pa !== null) return;
    const idx = game.currentPlayerIndex;
    if (banneredIdx.current === idx) return;
    // 首位／重整：沒有換場橫幅，HUD 直接同步到目前角色
    if (banneredIdx.current === null) {
      banneredIdx.current = idx;
      setDisplayIndex(idx);
      return;
    }
    const t = window.setTimeout(() => {
      // 觸發前再次確認：仍是同一位、無待處理事件才彈（避免下一位已搶先操作）
      const g = useMonopolyStore.getState().game;
      if (
        g?.phase === "playing" &&
        g.currentPlayerIndex === idx &&
        !g.pendingAction
      ) {
        // 只有「真的要彈」這一刻才標記去重，避免提早被取消的排程永久卡住
        banneredIdx.current = idx;
        pendingIdx.current = idx; // 等橫幅演完才把 HUD 切到這位
        setTurnPlayer(g.players[idx]);
      }
    }, 300);
    return () => window.clearTimeout(t);
  }, [game, busy, pa]);

  // 橫幅自動消失；消失的那一刻才把中央 HUD 切到新角色
  useEffect(() => {
    if (!turnPlayer) return;
    const t = window.setTimeout(() => {
      setTurnPlayer(null);
      if (pendingIdx.current !== null) setDisplayIndex(pendingIdx.current);
    }, BANNER_MS);
    return () => window.clearTimeout(t);
  }, [turnPlayer]);

  if (!hydrated) return null;

  if (!game || game.phase === "setup") {
    return <SetupPanel />;
  }

  const rollDisabled = pa !== null;

  // 時間到結束條件：算出截止時刻，右上角顯示倒數
  const ec = game.settings.endCondition;
  const timeEndsAt =
    ec.type === "time" && game.startedAt !== null
      ? game.startedAt + ec.minutes * 60_000
      : null;

  // 擲骰流程：翻滾動畫 → 結算 → 棋子一格一格走 → 結束後才觸發後續事件
  function handleRoll() {
    if (!game || rollDisabled || busy) return;
    const moverIdx = game.currentPlayerIndex;
    const mover = game.players[moverIdx];
    const fromPos = mover.position;
    const moverId = mover.id;

    // 先把棋子釘在起點並啟動擲骰動畫，接著立刻擲骰取得實際點數
    // （動畫期間 walk 已設值，animating 為真，買地／問答對話框不會提早跳出）
    setWalk({ playerId: moverId, pos: fromPos });
    setRolling(true);
    setRollSeq((s) => s + 1);
    playDiceSound();
    roll();

    const next = useMonopolyStore.getState().game;
    const dice = next?.lastRoll;
    const steps = dice ? dice.reduce((a, b) => a + b, 0) : 0;

    // 被暫停（監獄／跳過）：沒有點數，不播骰子動畫，直接讓「暫停一回合」過場接手
    if (!dice) {
      setRolling(false);
      setWalk(null);
      return;
    }

    // 通過起點的那一步（cumulative 首次達到一圈）；用來在該瞬間觸發 +2000 過場
    const bonus = game.settings.passStartBonus;
    const passStep = fromPos + steps >= BOARD_SIZE ? BOARD_SIZE - fromPos : -1;

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
        const pos = (fromPos + step) % BOARD_SIZE;
        setWalk({ playerId: moverId, pos });
        // 走到起點那一刻：暫停腳步、播 +2000 過場，演完再續走
        const crossing = passStep > 0 && step === passStep && bonus > 0;
        if (crossing) {
          synthSeq.current -= 1;
          setCutscene({
            seq: synthSeq.current,
            kind: "passStart",
            playerId: moverId,
            amount: bonus,
          });
        }
        const delay = crossing ? PASS_MS : STEP_MS;
        if (step >= steps) {
          // 最後一步落定後解除，並在落點脈動一圈代表色光環
          window.setTimeout(() => {
            setWalk(null);
            setLanding({ pos, color: mover.color });
            window.setTimeout(() => setLanding(null), 560);
          }, delay);
          return;
        }
        window.setTimeout(advance, delay);
      };
      advance();
    }, ROLL_MS);
  }

  const center = (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-4 py-2">
      {/* 玩家清單：輪到的放大上色、其餘黑白 */}
      <div className="flex flex-wrap items-end justify-center gap-x-5 gap-y-2">
        {game.players.map((p, i) => {
          const active = i === displayIndex;
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
                  <MoneyDisplay
                    value={displayMoney[p.id] ?? p.money}
                    className="text-emerald-700"
                  />
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
        disabled={rollDisabled || busy}
        onRoll={handleRoll}
      />
    </div>
  );

  return (
    <main className="min-h-screen bg-[#fbf6ec] bg-[radial-gradient(circle_at_22%_12%,oklch(0.95_0.05_85),transparent_55%),radial-gradient(circle_at_88%_90%,oklch(0.94_0.04_160),transparent_55%)]">
      {/* 右上角控制：事件紀錄 trigger + 重新開始 */}
      <BgmController phase={game.phase} />

      <div className="fixed right-3 top-3 z-40 flex items-center gap-2">
        {game.phase === "playing" && timeEndsAt !== null && (
          <Countdown endsAt={timeEndsAt} onExpire={endIfTimeUp} />
        )}
        <AudioSettings />
        <button
          type="button"
          onClick={() => setLogOpen(true)}
          title="事件紀錄"
          aria-label="事件紀錄"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-50 text-stone-600 shadow-md ring-1 ring-stone-900/5 transition hover:bg-stone-100 hover:text-stone-900"
        >
          <ScrollText className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setResetConfirmOpen(true)}
          title="重新開始"
          aria-label="重新開始"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-50 text-stone-600 shadow-md ring-1 ring-stone-900/5 transition hover:bg-stone-100 hover:text-stone-900"
        >
          <RotateCcw className="h-5 w-5" />
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

      <MoneyCutscene event={cutscene} players={game.players} />
      <TurnBanner player={turnPlayer} />

      {logOpen && (
        <LogDialog log={game.log} onClose={() => setLogOpen(false)} />
      )}

      {resetConfirmOpen && (
        <ResetConfirm
          onConfirm={() => {
            setResetConfirmOpen(false);
            reset();
          }}
          onCancel={() => setResetConfirmOpen(false)}
        />
      )}

      {!busy &&
        (pa?.kind === "buyQuestion" || pa?.kind === "buildQuestion") && (
          <QuestionDialog
            pending={pa}
            question={pa.question}
            player={game.players[game.currentPlayerIndex]}
            onAnswered={answer}
          />
        )}
      {!busy &&
        (pa?.kind === "confirmBuy" || pa?.kind === "confirmBuild") &&
        (() => {
          const tile = BOARD[pa.tileIndex];
          const amount = isProperty(tile)
            ? pa.kind === "confirmBuy"
              ? tile.price
              : tile.houseCost
            : 0;
          return (
            <PurchaseConfirm
              label={
                pa.kind === "confirmBuy"
                  ? `購買${tile.name}？`
                  : `在${tile.name}蓋一棟房子？`
              }
              amount={amount}
              player={game.players[game.currentPlayerIndex]}
              onConfirm={confirm}
            />
          );
        })()}
      {!busy && pa?.kind === "drawCard" && (
        <CardDialog
          pending={pa}
          player={game.players[game.currentPlayerIndex]}
          onResolve={resolveCard}
        />
      )}

      <GameOverDialog game={game} onRestart={reset} />
    </main>
  );
}

function PurchaseConfirm({
  label,
  amount,
  player,
  onConfirm,
}: {
  label: string;
  amount: number;
  player: Player;
  onConfirm: (accept: boolean) => void;
}) {
  const size = 96;
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-stone-950/55 px-4 backdrop-blur-sm">
      {/* 玩家頭像 ＋ 光暈（沿用過場聚光燈風格） */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative flex items-center justify-center">
          <motion.span
            className="pointer-events-none absolute rounded-full"
            style={{
              width: size * 2.5,
              height: size * 2.5,
              background: `radial-gradient(circle, ${player.color}99 0%, ${player.color}33 40%, ${player.color}00 70%)`,
              filter: "blur(6px)",
            }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.85, 1.08, 1], opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.04 }}
          />
          <motion.div
            className="relative"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 360,
              damping: 16,
              delay: 0.06,
            }}
          >
            <PlayerAvatar
              character={player.character}
              color={player.color}
              size={size}
              ringWidth={5}
            />
          </motion.div>
        </div>
        <div
          className="max-w-[8rem] truncate text-base font-bold text-white/85"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
        >
          {player.name}
        </div>
      </div>

      <motion.div
        className="flex flex-col items-center gap-1.5 text-center"
        initial={{ y: 10, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 340,
          damping: 18,
          delay: 0.18,
        }}
      >
        <p
          className="text-2xl font-extrabold text-white"
          style={{ textShadow: "0 2px 10px rgba(0,0,0,0.55)" }}
        >
          {label}
        </p>
        <p
          className="text-3xl font-extrabold tabular-nums text-amber-300"
          style={{ textShadow: "0 2px 10px rgba(0,0,0,0.55)" }}
        >
          ${amount.toLocaleString()}
        </p>
      </motion.div>

      <motion.div
        className="flex w-full max-w-sm gap-3"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.28 }}
      >
        <button
          type="button"
          className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600"
          onClick={() => onConfirm(true)}
        >
          購買
        </button>
        <button
          type="button"
          className="flex-1 rounded-xl bg-white px-4 py-3 font-medium text-stone-600 shadow-lg transition hover:bg-stone-100"
          onClick={() => onConfirm(false)}
        >
          跳過
        </button>
      </motion.div>
    </div>
  );
}

function ResetConfirm({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-[2px]">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 24 }}
        className="w-full max-w-sm space-y-5 rounded-2xl bg-stone-50 p-6 shadow-2xl ring-1 ring-stone-900/5"
      >
        <div className="space-y-1.5 text-center">
          <p className="text-lg font-bold text-stone-800">重新開始遊戲？</p>
          <p className="text-sm text-stone-500">
            目前的進度將會清除，回到遊戲設定畫面。
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 rounded-xl bg-rose-500 px-4 py-2.5 font-bold text-white shadow-md shadow-rose-500/30 transition hover:bg-rose-600"
            onClick={onConfirm}
          >
            重新開始
          </button>
          <button
            type="button"
            className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 font-medium text-stone-500 transition hover:bg-stone-100"
            onClick={onCancel}
          >
            取消
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
