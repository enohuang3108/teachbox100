"use client";

import NextImage from "next/image";
import { BOARD } from "@/lib/monopoly/board";
import { isProperty, type Player } from "@/lib/monopoly/types";
import { PlayerTokens } from "./PlayerTokens";

const HOUSE_IMG = "/images/monopoly/house.webp";

const TYPE_STYLE: Record<string, string> = {
  start: "bg-emerald-200",
  property: "bg-white",
  chance: "bg-amber-100",
  fate: "bg-rose-100",
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
        const houses = owner ? (owner.houses[tile.index] ?? 0) : 0;
        return (
          <div
            key={tile.index}
            className={`relative flex aspect-square flex-col rounded border p-1 text-[10px] leading-tight ${TYPE_STYLE[tile.type]}`}
            style={
              owner ? { boxShadow: `inset 0 -4px 0 ${owner.color}` } : undefined
            }
          >
            <div className="z-10 font-medium">{tile.name}</div>
            {tile.image && (
              <div className="pointer-events-none absolute inset-x-1 bottom-3 top-3">
                <NextImage
                  src={tile.image}
                  alt={tile.name}
                  fill
                  sizes="80px"
                  className="object-contain"
                />
              </div>
            )}
            {isProperty(tile) && (
              <div className="z-10 mt-auto text-zinc-600">${tile.price}</div>
            )}
            {houses > 0 && (
              <div className="absolute right-0.5 top-0.5 z-10 flex">
                {Array.from({ length: houses }).map((_, i) => (
                  <NextImage
                    key={i}
                    src={HOUSE_IMG}
                    alt="房子"
                    width={12}
                    height={12}
                  />
                ))}
              </div>
            )}
            <PlayerTokens players={players} tileIndex={tile.index} />
          </div>
        );
      })}
      <span className="sr-only">目前玩家：{players[currentIndex]?.name}</span>
    </div>
  );
}
