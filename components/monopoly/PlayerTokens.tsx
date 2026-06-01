"use client";

import type { Player } from "@/lib/monopoly/types";

export function PlayerTokens({
  players,
  tileIndex,
}: {
  players: Player[];
  tileIndex: number;
}) {
  const here = players.filter((p) => !p.bankrupt && p.position === tileIndex);
  return (
    <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-0.5 p-1">
      {here.map((p) => (
        <span
          key={p.id}
          title={p.name}
          className="h-3 w-3 rounded-full border border-white shadow"
          style={{ background: p.color }}
        />
      ))}
    </div>
  );
}
