"use client";

import type { PendingAction, Player } from "@/lib/monopoly/types";
import { motion } from "motion/react";
import NextImage from "next/image";
import { SpotlightAvatar } from "./SpotlightAvatar";

const DECK_IMG: Record<"chance" | "fate", string> = {
  chance: "/images/monopoly/chance.webp",
  fate: "/images/monopoly/fate.webp",
};

export function CardDialog({
  pending,
  player,
  onResolve,
}: {
  pending: PendingAction;
  player: Player;
  onResolve: () => void;
}) {
  if (pending?.kind !== "drawCard") return null;

  const size = 96;
  const deckLabel = pending.deck === "chance" ? "機會" : "命運";

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-stone-950/55 px-4 backdrop-blur-sm">
      {/* 玩家頭像 ＋ 光暈（沿用過場聚光燈風格） */}
      <SpotlightAvatar player={player} size={size} name />

      <motion.div
        className="text-base font-bold tracking-wide text-white/85"
        style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.16 }}
      >
        {deckLabel}
      </motion.div>

      {/* 翻牌：卡圖 ＋ 內容 */}
      <motion.div
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ delay: 0.18, duration: 0.4 }}
        className="flex flex-col items-center gap-3"
      >
        <NextImage
          src={DECK_IMG[pending.deck]}
          alt={`${deckLabel}卡`}
          width={180}
          height={240}
          className="h-56 w-auto drop-shadow-[0_8px_20px_rgba(0,0,0,0.45)]"
        />
        <p
          className="max-w-[20rem] text-center text-xl font-extrabold text-white"
          style={{ textShadow: "0 2px 10px rgba(0,0,0,0.55)" }}
        >
          {pending.card.text}
        </p>
      </motion.div>

      <motion.button
        type="button"
        className="w-full max-w-sm rounded-xl bg-emerald-500 px-4 py-3 font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-600"
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={onResolve}
      >
        確定
      </motion.button>
    </div>
  );
}
