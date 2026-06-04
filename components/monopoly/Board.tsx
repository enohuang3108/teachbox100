"use client";

import { LayoutGroup, motion } from "motion/react";
import NextImage from "next/image";
import type { ReactNode } from "react";
import { BOARD } from "@/lib/monopoly/board";
import { isProperty, type Player, type Tile } from "@/lib/monopoly/types";

const HOUSE_IMG = "/images/monopoly/house.webp";

// 24 格沿 7×7 方框邊緣排列（1-indexed row/col）。起點(0)在左上角，順時針。
function tilePos(i: number): { row: number; col: number } {
  if (i <= 6) return { row: 1, col: i + 1 }; // 上排 0..6
  if (i <= 12) return { row: i - 5, col: 7 }; // 右排 7..12
  if (i <= 18) return { row: 7, col: 7 - (i - 12) }; // 下排 13..18
  return { row: 7 - (i - 18), col: 1 }; // 左排 19..23
}

// 大富翁式分組色帶：每 3 個地產一組
const GROUP_COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#a855f7"];
const PROPERTY_ORDER = BOARD.filter(isProperty).map((t) => t.index);
function bandColor(index: number): string {
  const pos = PROPERTY_ORDER.indexOf(index);
  return GROUP_COLORS[Math.floor(pos / 3) % GROUP_COLORS.length];
}

const SPECIAL: Record<string, { bg: string; emoji?: string }> = {
  start: { bg: "bg-emerald-100", emoji: "🏁" },
  jail: { bg: "bg-zinc-200", emoji: "🚔" },
  chance: { bg: "bg-amber-50" },
  fate: { bg: "bg-violet-50" },
};

// 玩家棋子（頭＋身體的 pawn 造型）
function Pawn({ color }: { color: string }) {
  return (
    <span className="flex flex-col items-center leading-none drop-shadow">
      <span
        className="block h-2 w-2 rounded-full ring-1 ring-white"
        style={{ background: color }}
      />
      <span
        className="-mt-[3px] block h-2.5 w-3 rounded-t-[45%] rounded-b-[25%] ring-1 ring-white"
        style={{ background: color }}
      />
    </span>
  );
}

interface Walking {
  playerId: string;
  pos: number;
}

function TileCard({
  tile,
  players,
  walking,
}: {
  tile: Tile;
  players: Player[];
  walking?: Walking | null;
}) {
  const property = isProperty(tile);
  const owner = property
    ? players.find((p) => p.ownedTiles.includes(tile.index))
    : undefined;
  const houses = owner ? (owner.houses[tile.index] ?? 0) : 0;
  const renderPos = (p: Player) =>
    walking && walking.playerId === p.id ? walking.pos : p.position;
  const here = players.filter((p) => !p.bankrupt && renderPos(p) === tile.index);
  const special = SPECIAL[tile.type];

  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-lg border border-black/5 shadow-sm ${property ? "bg-white" : (special?.bg ?? "bg-white")}`}
      style={
        owner
          ? { outline: `2px solid ${owner.color}`, outlineOffset: "-2px" }
          : undefined
      }
    >
      {property && (
        <div
          className="h-2 w-full shrink-0"
          style={{ background: bandColor(tile.index) }}
        />
      )}
      <div className="flex items-center justify-between gap-0.5 px-1 pt-0.5">
        <span className="truncate text-[10px] font-bold text-zinc-700">
          {tile.name}
        </span>
        {houses > 0 && (
          <span className="flex shrink-0">
            {Array.from({ length: houses }).map((_, i) => (
              <NextImage key={i} src={HOUSE_IMG} alt="" width={10} height={10} />
            ))}
          </span>
        )}
      </div>
      <div className="relative min-h-0 flex-1">
        {tile.image ? (
          <NextImage
            src={tile.image}
            alt={tile.name}
            fill
            sizes="110px"
            className="object-contain p-0.5"
          />
        ) : special?.emoji ? (
          <div className="flex h-full items-center justify-center text-2xl">
            {special.emoji}
          </div>
        ) : null}
      </div>
      {property && (
        <div className="px-1 pb-0.5 text-[9px] font-semibold text-zinc-400">
          ${tile.price}
        </div>
      )}
      {here.length > 0 && (
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-center gap-0.5 bg-white/75 p-0.5 backdrop-blur-sm">
          {here.map((p) =>
            walking && walking.playerId === p.id ? (
              <motion.span
                key={p.id}
                layoutId={`pawn-${p.id}`}
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
              >
                <Pawn color={p.color} />
              </motion.span>
            ) : (
              <span key={p.id} title={p.name}>
                <Pawn color={p.color} />
              </span>
            ),
          )}
        </div>
      )}
    </div>
  );
}

export function Board({
  players,
  currentIndex,
  walking,
  center,
}: {
  players: Player[];
  currentIndex: number;
  walking?: Walking | null;
  center?: ReactNode;
}) {
  return (
    <div className="aspect-square w-full max-w-[820px]">
      <LayoutGroup>
        <div className="grid h-full w-full grid-cols-7 grid-rows-7 gap-1.5 rounded-[20px] border-[6px] border-amber-950/10 bg-[#fdf4e3] p-1.5 shadow-[0_18px_50px_-18px_rgba(120,80,20,0.5)]">
          {BOARD.map((tile) => {
            const pos = tilePos(tile.index);
            return (
              <div
                key={tile.index}
                style={{ gridRow: pos.row, gridColumn: pos.col }}
              >
                <TileCard tile={tile} players={players} walking={walking} />
              </div>
            );
          })}
          <div
            className="m-1 flex items-center justify-center rounded-2xl bg-emerald-50/70 p-3 ring-1 ring-emerald-900/10"
            style={{ gridColumn: "2 / 7", gridRow: "2 / 7" }}
          >
            {center}
          </div>
        </div>
      </LayoutGroup>
      <span className="sr-only">目前玩家：{players[currentIndex]?.name}</span>
    </div>
  );
}
