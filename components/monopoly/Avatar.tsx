"use client";

import { characterById } from "@/lib/monopoly/characters";

// 以選定角色的去背圖呈現玩家頭像，外圈用玩家代表色描邊。
export function PlayerAvatar({
  character,
  color,
  size = 32,
  ring = true,
}: {
  character: string;
  color: string;
  size?: number;
  ring?: boolean;
}) {
  const def = characterById(character);
  return (
    <span
      className="inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-white"
      style={{
        width: size,
        height: size,
        boxShadow: ring ? `0 0 0 2px ${color}` : undefined,
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
