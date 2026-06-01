"use client";

import { BOARD } from "@/lib/monopoly/board";
import { isProperty, type Player } from "@/lib/monopoly/types";
import { PlayerTokens } from "./PlayerTokens";

const TYPE_STYLE: Record<string, string> = {
  start: "bg-emerald-200",
  property: "bg-white",
  chance: "bg-amber-200",
  fate: "bg-rose-200",
  jail: "bg-zinc-300",
};

export function Board({
  players,
  currentIndex,
}: {
  players: Player[];
  currentIndex: number;
}) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {BOARD.map((tile) => {
        const owner = isProperty(tile)
          ? players.find((p) => p.ownedTiles.includes(tile.index))
          : undefined;
        return (
          <div
            key={tile.index}
            className={`relative aspect-square rounded border p-1 text-[10px] leading-tight ${TYPE_STYLE[tile.type]}`}
            style={
              owner ? { boxShadow: `inset 0 -4px 0 ${owner.color}` } : undefined
            }
          >
            <div className="font-medium">{tile.name}</div>
            {isProperty(tile) && (
              <div className="text-zinc-500">${tile.price}</div>
            )}
            {owner && isProperty(tile) && (
              <div className="text-zinc-700">🏠{owner.houses[tile.index] ?? 0}</div>
            )}
            <PlayerTokens players={players} tileIndex={tile.index} />
          </div>
        );
      })}
      <span className="sr-only">目前玩家：{players[currentIndex]?.name}</span>
    </div>
  );
}
