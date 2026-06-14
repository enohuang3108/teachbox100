"use client";

import { characterById } from "@/lib/monopoly/characters";

// 以選定角色的去背圖呈現玩家頭像，外圈用玩家代表色描邊。
export function PlayerAvatar({
  character,
  color,
  size = 32,
  ring = true,
  bold = false,
  ringWidth,
}: {
  character: string;
  color: string;
  size?: number;
  ring?: boolean;
  bold?: boolean; // 棋盤棋子用：更明顯的圈圈 ＋ 柔和投影
  ringWidth?: number; // 自訂圈圈粗細（純色描邊、無投影）
}) {
  const def = characterById(character);
  let boxShadow: string | undefined;
  if (bold) {
    const ringW = Math.max(3, Math.round(size * 0.085));
    boxShadow = `0 0 0 ${ringW}px ${color}, 0 ${Math.max(1, ringW / 2)}px ${ringW * 2}px rgba(0,0,0,0.25)`;
  } else if (ring) {
    boxShadow = `0 0 0 ${ringWidth ?? 2}px ${color}`;
  }
  return (
    <span
      className="inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-white"
      style={{
        width: size,
        height: size,
        boxShadow,
      }}
    >
      {/* 完整顯示整隻角色，留一點內距避免頂端被圓框切到 */}
      <img
        src={def.src}
        alt={def.label}
        draggable={false}
        className="h-[92%] w-[92%] object-contain"
      />
    </span>
  );
}
