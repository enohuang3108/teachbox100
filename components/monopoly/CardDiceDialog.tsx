"use client";

import { useSound } from "@/lib/hooks/useSound";
import type { PendingAction, Player } from "@/lib/monopoly/types";
import { motion } from "motion/react";
import { Die } from "./Dice";
import { SpotlightAvatar } from "./SpotlightAvatar";

// 互動擲骰卡：抽到擲骰類卡片後，讓玩家親自擲一顆骰，再依點數結算。
export function CardDiceDialog({
  pending,
  player,
  onRoll,
  onResolve,
}: {
  pending: PendingAction;
  player: Player;
  onRoll: () => void;
  onResolve: () => void;
}) {
  const { playDiceSound } = useSound();
  if (pending?.kind !== "cardDice") return null;

  const { card, rolled } = pending;
  const deckLabel = card.deck === "chance" ? "機會" : "命運";

  // 依骰出的點數描述結果，讓玩家在按確定前先看懂會發生什麼
  function outcomeText(v: number): string {
    switch (card.effect.kind) {
      case "diceReward": {
        const amt = v * card.effect.perPip;
        return amt >= 0 ? `獲得 $${amt.toLocaleString()}` : `罰款 $${(-amt).toLocaleString()}`;
      }
      case "diceMove":
        return `前進 ${v} 格`;
      case "diceBet":
        return v % 2 === 1
          ? `單數！贏得 $${card.effect.amount.toLocaleString()}`
          : `雙數…賠 $${card.effect.amount.toLocaleString()}`;
      default:
        return "";
    }
  }

  const win =
    rolled !== null &&
    (card.effect.kind === "diceMove" ||
      (card.effect.kind === "diceReward" && rolled * card.effect.perPip >= 0) ||
      (card.effect.kind === "diceBet" && rolled % 2 === 1));

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-stone-950/55 px-4 backdrop-blur-sm">
      <SpotlightAvatar player={player} size={96} name />

      <motion.div
        className="text-base font-bold tracking-wide text-white/85"
        style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.16 }}
      >
        {deckLabel}
      </motion.div>

      <motion.p
        className="max-w-[22rem] text-center text-xl font-extrabold text-white"
        style={{ textShadow: "0 2px 10px rgba(0,0,0,0.55)" }}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {card.text}
      </motion.p>

      {/* 擲骰區：未擲顯示按鈕，擲出後顯示骰子與結果 */}
      {rolled === null ? (
        <motion.button
          type="button"
          className="rounded-full bg-amber-500 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-amber-500/30 transition hover:-translate-y-0.5 hover:bg-amber-600 active:translate-y-0 active:scale-95"
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => {
            playDiceSound();
            onRoll();
          }}
        >
          🎲 擲骰子
        </motion.button>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <Die value={rolled} />
          <motion.div
            key={rolled}
            className={`text-2xl font-extrabold ${win ? "text-emerald-300" : "text-rose-300"}`}
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.55)" }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 360, damping: 16, delay: 0.5 }}
          >
            擲出 {rolled}，{outcomeText(rolled)}
          </motion.div>
          <motion.button
            type="button"
            className="w-full max-w-sm rounded-xl bg-emerald-500 px-4 py-3 font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            onClick={onResolve}
          >
            確定
          </motion.button>
        </div>
      )}
    </div>
  );
}
