"use client";

import { motion } from "motion/react";
import type { Player } from "@/lib/monopoly/types";
import { PlayerAvatar } from "./Avatar";

// 過場聚光燈頭像：玩家代表色放射光暈 ＋ 旋轉彈入的角色頭像，可選在下方顯示名字。
// 收租過場、回合橫幅、抽卡、購買／答題對話框等暗場聚光燈共用同一套進場動畫。
export function SpotlightAvatar({
  player,
  size = 96,
  haloSize = size * 2.5,
  grayscale = false,
  name = false,
  nameClassName = "max-w-[8rem] text-base font-bold text-white/85",
}: {
  player: Player;
  size?: number;
  haloSize?: number;
  grayscale?: boolean; // 監獄／暫停：頭像轉灰
  name?: boolean; // 是否在頭像下方顯示玩家名字
  nameClassName?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center">
        <motion.span
          className="pointer-events-none absolute rounded-full"
          style={{
            width: haloSize,
            height: haloSize,
            background: `radial-gradient(circle, ${player.color}99 0%, ${player.color}33 40%, ${player.color}00 70%)`,
            filter: "blur(6px)",
          }}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [0.85, 1.08, 1], opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.04 }}
        />
        <motion.div
          className={grayscale ? "relative grayscale" : "relative"}
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
      {name && (
        <div
          className={`truncate ${nameClassName}`}
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
        >
          {player.name}
        </div>
      )}
    </div>
  );
}
