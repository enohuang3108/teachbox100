"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Player } from "@/lib/monopoly/types";
import { PlayerAvatar } from "./Avatar";

// 回合轉場：暗場聚光燈。背景變暗、頭像帶代表色放射光暈彈入，白字置中，無卡片。
export function TurnBanner({ player }: { player: Player | null }) {
  return (
    <AnimatePresence>
      {player && (
        <motion.div
          key="turn-backdrop"
          className="fixed inset-0 z-40 bg-stone-950/55 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        />
      )}
      {player && (
        <motion.div
          key={player.id}
          className="pointer-events-none fixed inset-x-0 top-[30%] z-50 flex flex-col items-center px-4"
          initial={{ y: -20, scale: 0.85, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 16, scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
        >
          {/* 頭像 ＋ 後方放射光暈 */}
          <div className="relative flex items-center justify-center">
            <motion.span
              className="pointer-events-none absolute rounded-full"
              style={{
                width: 260,
                height: 260,
                background: `radial-gradient(circle, ${player.color}b3 0%, ${player.color}40 38%, ${player.color}00 70%)`,
                filter: "blur(6px)",
              }}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.85, 1.08, 1], opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.04 }}
            />
            <motion.div
              className="relative"
              initial={{ scale: 0, rotate: -25 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 360,
                damping: 16,
                delay: 0.08,
              }}
            >
              <PlayerAvatar
                character={player.character}
                color={player.color}
                size={96}
                ringWidth={5}
              />
            </motion.div>
          </div>

          {/* 文字置中、白色、加陰影確保暗場可讀 */}
          <div
            className="mt-12 flex flex-col items-center gap-1 leading-tight"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.55)" }}
          >
            <div className="text-sm font-bold uppercase tracking-[0.3em] text-white/70">
              換你了
            </div>
            <div className="max-w-[16rem] truncate text-5xl font-extrabold text-white">
              {player.name}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
