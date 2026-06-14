"use client";

import { motion } from "motion/react";
import { RotateCcw, ScrollText, Target } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PlayerAvatar } from "@/components/monopoly/Avatar";
import { AudioSettings } from "@/components/monopoly/AudioSettings";
import { BgmController } from "@/components/monopoly/BgmController";
import { Board, HouseMarker, HotelMarker } from "@/components/monopoly/Board";
import { CardDialog } from "@/components/monopoly/CardDialog";
import { CardDiceDialog } from "@/components/monopoly/CardDiceDialog";
import { Countdown } from "@/components/monopoly/Countdown";
import { Dice } from "@/components/monopoly/Dice";
import { GameOverDialog } from "@/components/monopoly/GameOverDialog";
import { MoneyCutscene } from "@/components/monopoly/MoneyCutscene";
import { MoneyDisplay } from "@/components/monopoly/MoneyDisplay";
import { QuestionDialog } from "@/components/monopoly/QuestionDialog";
import { SetupPanel } from "@/components/monopoly/SetupPanel";
import { SpotlightAvatar } from "@/components/monopoly/SpotlightAvatar";
import { TurnBanner } from "@/components/monopoly/TurnBanner";
import { BOARD, BOARD_SIZE } from "@/lib/monopoly/board";
import type { CutsceneEvent, Player, PropertyTile } from "@/lib/monopoly/types";
import { buildCostFor, isProperty } from "@/lib/monopoly/types";
import { realisticEffect } from "@/lib/helpers/confetti-effects";
import { useSound } from "@/lib/hooks/useSound";
import { useMonopolyStore } from "@/lib/monopoly/store";

const STEP_MS = 240; // 每走一格的間隔
const ROLL_MS = 1333; // 擲骰 Lottie 動畫長度（80 幀 @ 60fps）
const CUTSCENE_MS = 2500; // 金流／監獄／通過起點等過場顯示時間
const BANNER_MS = 2000; // 「換你了」橫幅顯示時間

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
  const [crossPaused, setCrossPaused] = useState(false); // 棋子走到起點那格暫停、等加碼題作答
  const banneredIdx = useRef<number | null>(null);
  const pendingIdx = useRef<number | null>(null); // 換場演完後要切到的角色 index
  const lastEventSeq = useRef<number>(0);
  // 暫停在起點時保存的走路進度，供答完加碼題後續走
  const walkDescRef = useRef<{
    fromPos: number;
    steps: number;
    moverId: string;
    color: string;
    startStep: number;
  } | null>(null);
  const synthSeq = useRef<number>(0); // UI 自製過場（過起點 🏁）的遞減 seq
  const resumePendingRef = useRef(false); // 🏁 過場播完後要續走
  const {
    game,
    roll,
    answer,
    answerPassStart,
    confirm,
    resolveCard,
    rollCardDice,
    resolveCardDice,
    answerCardQuiz,
    endIfTimeUp,
    reset,
  } = useMonopolyStore();
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

  // 過起點 🏁 加錢過場播完後，從起點那格續走到目的地
  useEffect(() => {
    if (cutscene) return;
    if (!resumePendingRef.current) return;
    resumePendingRef.current = false;
    resumeWalk();
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

    // 等擲骰動畫落定後，棋子再一格一格走（走到起點那格會暫停跳出加碼題）
    window.setTimeout(() => {
      setRolling(false);
      if (steps <= 0) {
        setWalk(null); // 暫停回合等情況：不走格
        return;
      }
      runWalk({ fromPos, steps, moverId, color: mover.color, startStep: 0 });
    }, ROLL_MS);
  }

  // 走完最後一步：解除走路狀態，並在落點脈動一圈代表色光環
  function finishWalk(pos: number, color: string) {
    window.setTimeout(() => {
      setWalk(null);
      setLanding({ pos, color });
      window.setTimeout(() => setLanding(null), 560);
    }, STEP_MS);
  }

  // 棋子一格一格走；走到起點那格（pos 歸 0）就暫停，讓過起點加碼題當場跳出，
  // 答完由 resumeWalk 從暫停點續走到目的地，再由 pendingAction 接續落地。
  function runWalk(desc: {
    fromPos: number;
    steps: number;
    moverId: string;
    color: string;
    startStep: number;
  }) {
    const { fromPos, steps, moverId, color } = desc;
    const passStep = fromPos + steps >= BOARD_SIZE ? BOARD_SIZE - fromPos : -1;
    let step = desc.startStep;
    const advance = () => {
      step += 1;
      const pos = (fromPos + step) % BOARD_SIZE;
      setWalk({ playerId: moverId, pos });
      // 走到起點那格：暫停腳步，加碼題（takeTurn 已設好的 pendingAction）當場跳出
      if (step === passStep) {
        walkDescRef.current = { ...desc, startStep: step };
        setCrossPaused(true);
        return;
      }
      if (step >= steps) {
        finishWalk(pos, color);
        return;
      }
      window.setTimeout(advance, STEP_MS);
    };
    advance();
  }

  // 答完過起點加碼題：解除暫停，從起點那格續走到目的地（剛好停在起點則直接收尾）
  function resumeWalk() {
    const desc = walkDescRef.current;
    walkDescRef.current = null;
    setCrossPaused(false);
    if (!desc) return;
    if (desc.startStep >= desc.steps) {
      finishWalk((desc.fromPos + desc.steps) % BOARD_SIZE, desc.color);
      return;
    }
    runWalk(desc);
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
                  size={active ? 104 : 56}
                  ringWidth={active ? 6 : 4}
                />
              </motion.div>
              <div className="text-center leading-tight">
                <div
                  className={`max-w-[7rem] truncate font-bold ${
                    active
                      ? "text-base text-stone-800"
                      : "text-sm text-stone-400"
                  }`}
                >
                  {p.name}
                  {p.bankrupt && "（破產）"}
                </div>
                <div
                  className={`font-extrabold tabular-nums ${
                    active ? "text-base" : "text-sm"
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
        {game.phase === "playing" && ec.type === "moneyGoal" && (
          <div
            className="flex h-10 items-center gap-1.5 rounded-full bg-stone-50 px-4 text-sm font-bold tabular-nums text-emerald-700 shadow-md ring-1 ring-stone-900/5"
            title="目標金額"
            aria-label="目標金額"
          >
            <Target className="h-4 w-4" />${ec.amount.toLocaleString()}
          </div>
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
      {!busy && pa?.kind === "cardQuiz" && (
        <QuestionDialog
          pending={pa}
          question={pa.question}
          player={game.players[game.currentPlayerIndex]}
          onAnswered={answerCardQuiz}
        />
      )}
      {(crossPaused || !busy) && pa?.kind === "passStartQuestion" && (
        <QuestionDialog
          pending={pa}
          question={pa.question}
          player={game.players[game.currentPlayerIndex]}
          onAnswered={(correct) => {
            const player = game.players[game.currentPlayerIndex];
            const reward = correct ? pa.rewardRight : pa.rewardWrong;
            answerPassStart(correct);
            // 棋子仍停在起點，當場播 🏁 加錢過場；演完才由 effect 觸發續走
            synthSeq.current -= 1;
            resumePendingRef.current = true;
            setCrossPaused(false);
            setCutscene({
              seq: synthSeq.current,
              kind: "passStart",
              playerId: player.id,
              amount: reward,
            });
          }}
        />
      )}
      {!busy && pa?.kind === "cardDice" && (
        <CardDiceDialog
          pending={pa}
          player={game.players[game.currentPlayerIndex]}
          onRoll={rollCardDice}
          onResolve={resolveCardDice}
        />
      )}
      {!busy &&
        (pa?.kind === "confirmBuy" || pa?.kind === "confirmBuild") &&
        (() => {
          const tile = BOARD[pa.tileIndex];
          if (!isProperty(tile)) return null;
          return (
            <PurchaseConfirm
              kind={pa.kind}
              tile={tile}
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
  kind,
  tile,
  player,
  onConfirm,
}: {
  kind: "confirmBuy" | "confirmBuild";
  tile: PropertyTile;
  player: Player;
  onConfirm: (accept: boolean) => void;
}) {
  const size = 96;
  const isBuy = kind === "confirmBuy";
  // 蓋房：目前等級 → 蓋完等級；買地：成交後為空地（0）。蓋滿房子後再蓋即升旅館。
  const currentLevel = player.houses[tile.index] ?? 0;
  const afterLevel = isBuy ? 0 : currentLevel + 1;
  const toHotel = !isBuy && afterLevel > tile.maxHouses;
  const amount = isBuy ? tile.price : buildCostFor(tile, currentLevel);
  const affordable = player.money >= amount;
  const label = isBuy
    ? `購買${tile.name}？`
    : toHotel
      ? `在${tile.name}蓋旅館？`
      : `在${tile.name}蓋一棟房子？`;
  const confirmText = isBuy ? "購買" : toHotel ? "蓋旅館" : "蓋房子";
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-stone-950/55 px-4 backdrop-blur-sm">
      {/* 玩家頭像 ＋ 光暈（沿用過場聚光燈風格） */}
      <SpotlightAvatar player={player} size={size} name />

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
        <p
          className="text-base font-semibold tabular-nums text-white/75"
          style={{ textShadow: "0 1px 6px rgba(0,0,0,0.5)" }}
        >
          目前存款 ${player.money.toLocaleString()}
        </p>
      </motion.div>

      {/* 過路費階梯：別人踩到要付的金額，蓋越多房子越高（標出成交後的等級） */}
      <TollSchedule
        toll={tile.toll}
        highlight={afterLevel}
        maxHouses={tile.maxHouses}
        isBuy={isBuy}
        color={player.color}
      />

      <motion.div
        className="flex w-full max-w-sm gap-3"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.28 }}
      >
        {affordable ? (
          <>
            <button
              type="button"
              className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600"
              onClick={() => onConfirm(true)}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="flex-1 rounded-xl bg-white px-4 py-3 font-medium text-stone-600 shadow-lg transition hover:bg-stone-100"
              onClick={() => onConfirm(false)}
            >
              跳過
            </button>
          </>
        ) : (
          <button
            type="button"
            className="flex-1 rounded-xl bg-stone-200 px-4 py-3 font-bold text-stone-500 shadow-lg transition hover:bg-stone-300"
            onClick={() => onConfirm(false)}
          >
            存款不足
          </button>
        )}
      </motion.div>
    </div>
  );
}

// 過路費階梯：每個建設等級對應的過路費（toll[等級]）。
// 等級 0=空地、1..maxHouses=房子、最高一級=旅館。
// highlight = 成交後的等級，會被框起來標示「踩到要付這麼多」。
function TollSchedule({
  toll,
  highlight,
  maxHouses,
  isBuy,
  color,
}: {
  toll: number[];
  highlight: number;
  maxHouses: number;
  isBuy: boolean;
  color: string;
}) {
  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.24 }}
    >
      <p
        className="text-xs font-medium text-white/70"
        style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}
      >
        {isBuy
          ? "別人踩到要付的過路費（蓋房子、旅館越多越高）"
          : "蓋好後別人踩到要付的過路費"}
      </p>
      <div className="flex items-end gap-1.5">
        {toll.map((t, level) => {
          const on = level === highlight;
          const isHotel = level > maxHouses;
          return (
            <div key={level} className="flex items-center gap-1.5">
              {level > 0 && <span className="text-sm text-white/35">›</span>}
              <div
                className={`flex min-w-[3.5rem] flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 transition ${
                  on
                    ? "bg-amber-400/20 ring-2 ring-amber-300"
                    : "bg-white/5 ring-1 ring-white/10"
                }`}
              >
                {level === 0 ? (
                  <span className="text-[11px] leading-none text-white/70">
                    空地
                  </span>
                ) : isHotel ? (
                  <span className="flex h-[18px] items-center gap-0.5">
                    <HotelMarker color={color} size={18} />
                  </span>
                ) : (
                  <span className="flex h-[18px] items-center gap-0.5">
                    {Array.from({ length: level }).map((_, i) => (
                      <HouseMarker key={i} color={color} size={14} />
                    ))}
                  </span>
                )}
                <span
                  className={`text-sm font-extrabold tabular-nums leading-none ${
                    on ? "text-amber-300" : "text-white/60"
                  }`}
                >
                  ${t.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
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
