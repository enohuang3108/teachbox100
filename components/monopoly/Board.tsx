"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import NextImage from "next/image";
import type { ReactNode } from "react";
import { BOARD } from "@/lib/monopoly/board";
import { isProperty, type Player, type Tile } from "@/lib/monopoly/types";
import { PlayerAvatar } from "./Avatar";

// 玩家顏色的小房子（買地/蓋房後放在土地前方），可隨玩家顏色上色
function HouseMarker({ color, size }: { color: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden
      style={{ filter: "drop-shadow(0 1px 1.5px rgba(0,0,0,0.35))" }}
    >
      <path
        d="M5 15 L16 4.5 L27 15 V28 H5 Z"
        fill={color}
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M5 15 L16 4.5 L27 15 Z" fill="#000000" fillOpacity="0.18" />
      <rect
        x="12.5"
        y="19.5"
        width="7"
        height="8.5"
        rx="1"
        fill="#ffffff"
        fillOpacity="0.9"
      />
    </svg>
  );
}

// 34 格沿 12×7 方框邊緣排列（1-indexed row/col）。起點(0)在左上角，順時針。
function tilePos(i: number): { row: number; col: number } {
  if (i <= 11) return { row: 1, col: i + 1 }; // 上排 0..11（第 1..12 欄）
  if (i <= 17) return { row: i - 10, col: 12 }; // 右排 12..17（第 2..7 列）
  if (i <= 28) return { row: 7, col: 29 - i }; // 下排 18..28（第 11..1 欄）
  return { row: 35 - i, col: 1 }; // 左排 29..33（第 6..2 列）
}

// 房子放在土地「靠近遊戲中心」的內側邊緣（依格子在環上的位置決定方向）
function innerEdge(i: number): { cell: string; stack: string } {
  if (i <= 11)
    return {
      cell: "items-end justify-center",
      stack: "flex-row translate-y-[130%]",
    }; // 上排：底邊朝中心
  if (i <= 17)
    return {
      cell: "items-center justify-start",
      stack: "flex-col -translate-x-[130%]",
    }; // 右排：左邊朝中心
  if (i <= 28)
    return {
      cell: "items-start justify-center",
      stack: "flex-row -translate-y-[130%]",
    }; // 下排：頂邊朝中心
  return {
    cell: "items-center justify-end",
    stack: "flex-col translate-x-[130%]",
  }; // 左排：右邊朝中心
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
  jail: { bg: "bg-stone-200", emoji: "🚔" },
  chance: { bg: "bg-amber-50", emoji: "❓" },
  fate: { bg: "bg-violet-50", emoji: "✨" },
};

interface Walking {
  playerId: string;
  pos: number;
}

// 格子（僅美術；棋子畫在獨立覆蓋層）
function TileCard({ tile, players }: { tile: Tile; players: Player[] }) {
  const property = isProperty(tile);
  const owner = property
    ? players.find((p) => p.ownedTiles.includes(tile.index))
    : undefined;
  const special = SPECIAL[tile.type];

  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-lg border border-stone-900/[0.06] shadow-sm ${property ? "bg-[#fffdf8]" : (special?.bg ?? "bg-[#fffdf8]")}`}
      style={
        owner
          ? {
              outline: `2.5px solid ${owner.color}`,
              outlineOffset: "-2.5px",
              boxShadow: `0 0 0 1px ${owner.color}33, var(--tw-shadow, 0 0 #0000)`,
            }
          : undefined
      }
    >
      {property && (
        <div
          className="h-2 w-full shrink-0"
          style={{ background: bandColor(tile.index) }}
        />
      )}
      <div className="px-1 pt-0.5">
        <span className="block truncate text-[10px] font-bold text-stone-700">
          {tile.name}
        </span>
      </div>
      <div className="relative min-h-0 flex-1">
        {tile.image ? (
          <NextImage
            src={tile.image}
            alt={tile.name}
            fill
            sizes="90px"
            className="object-contain p-0.5"
          />
        ) : special?.emoji ? (
          <div className="flex h-full items-center justify-center text-2xl">
            {special.emoji}
          </div>
        ) : null}
      </div>
      {property && (
        <div className="px-1 pb-0.5 text-[9px] font-semibold tabular-nums text-stone-400">
          ${tile.price.toLocaleString()}
        </div>
      )}
    </div>
  );
}

export function Board({
  players,
  currentIndex,
  walking,
  landing,
  center,
}: {
  players: Player[];
  currentIndex: number;
  walking?: Walking | null;
  landing?: { pos: number; color: string } | null;
  center?: ReactNode;
}) {
  const renderPos = (p: Player) =>
    walking && walking.playerId === p.id ? walking.pos : p.position;

  return (
    <div className="aspect-[12/7] w-[min(98vw,calc((100vh_-_1.5rem)*1.714))]">
      <LayoutGroup>
        <div className="relative grid h-full w-full grid-cols-[repeat(12,minmax(0,1fr))] grid-rows-[repeat(7,minmax(0,1fr))] gap-1 rounded-[22px] border-[6px] border-amber-950/[0.08] bg-[#fdf4e3] bg-[radial-gradient(circle_at_50%_38%,#fefaf0,transparent_70%)] p-1 shadow-[0_2px_0_0_rgba(255,255,255,0.6)_inset,0_22px_55px_-20px_rgba(120,80,20,0.55)]">
          {BOARD.map((tile) => {
            const pos = tilePos(tile.index);
            return (
              <div
                key={tile.index}
                style={{ gridRow: pos.row, gridColumn: pos.col }}
              >
                <TileCard tile={tile} players={players} />
              </div>
            );
          })}

          <div
            className="m-1 flex items-center justify-center rounded-2xl bg-emerald-50/80 bg-[radial-gradient(circle_at_50%_30%,oklch(0.97_0.03_160),transparent_75%)] p-3 shadow-[0_1px_0_0_rgba(255,255,255,0.7)_inset] ring-1 ring-emerald-900/[0.08]"
            style={{ gridColumn: "2 / 12", gridRow: "2 / 7" }}
          >
            {center}
          </div>

          {/* 房子覆蓋層：擁有的土地在靠近中心的內側邊緣放上玩家顏色的房子 */}
          <div className="pointer-events-none absolute inset-0 grid grid-cols-[repeat(12,minmax(0,1fr))] grid-rows-[repeat(7,minmax(0,1fr))] gap-1 p-1">
            {BOARD.map((tile) => {
              if (!isProperty(tile)) return null;
              const owner = players.find((p) =>
                p.ownedTiles.includes(tile.index),
              );
              if (!owner) return null;
              const count = Math.min(
                Math.max(owner.houses[tile.index] ?? 0, 1),
                4,
              );
              const pos = tilePos(tile.index);
              const edge = innerEdge(tile.index);
              return (
                <div
                  key={tile.index}
                  className={`flex ${edge.cell}`}
                  style={{ gridRow: pos.row, gridColumn: pos.col }}
                >
                  <div className={`flex gap-0.5 ${edge.stack}`}>
                    {Array.from({ length: count }).map((_, i) => (
                      // 新蓋的房子從 0 彈跳出現（overshoot），既有的維持不動
                      <motion.span
                        key={i}
                        className="inline-block"
                        initial={{ scale: 0, y: -8 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 480,
                          damping: 14,
                        }}
                      >
                        <HouseMarker
                          color={owner.color}
                          size={count > 2 ? 24 : 32}
                        />
                      </motion.span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 棋子覆蓋層：每位玩家一個固定元素（穩定 key，頭像不會每格重新掛載），
              靠 layout spring 平滑滑到目標格，走路時持續輕微擺動，避免一格一格卡頓 */}
          <div className="pointer-events-none absolute inset-0 grid grid-cols-[repeat(12,minmax(0,1fr))] grid-rows-[repeat(7,minmax(0,1fr))] gap-1 p-1">
            {players
              .filter((p) => !p.bankrupt)
              .map((p) => {
                const tileIndex = renderPos(p);
                const pos = tilePos(tileIndex);
                const isWalking = walking?.playerId === p.id;
                // 同格多人時縮小並左右排開，間距 ≥ 頭像寬度，邊緣不重疊
                const mates = players.filter(
                  (q) => !q.bankrupt && renderPos(q) === tileIndex,
                );
                const n = mates.length;
                const order = mates.findIndex((q) => q.id === p.id);
                const pawnSize = n <= 1 ? 46 : n === 2 ? 38 : n === 3 ? 32 : 28;
                const spacing = pawnSize + 3;
                const offsetX = (order - (n - 1) / 2) * spacing;
                return (
                  <motion.div
                    key={p.id}
                    layout
                    transition={{
                      type: "spring",
                      stiffness: 360,
                      damping: 30,
                    }}
                    className="flex items-center justify-center"
                    style={{
                      gridRow: pos.row,
                      gridColumn: pos.col,
                      zIndex: isWalking ? 20 : 10,
                    }}
                  >
                    <motion.span
                      className="inline-block"
                      animate={{
                        x: offsetX,
                        y: isWalking ? [0, -9, 0] : 0,
                        scale: isWalking ? 1.1 : 1,
                      }}
                      transition={
                        isWalking
                          ? {
                              y: {
                                duration: 0.4,
                                ease: "easeInOut",
                                repeat: Infinity,
                              },
                              x: { duration: 0.2 },
                              scale: { duration: 0.2 },
                            }
                          : { duration: 0.2 }
                      }
                    >
                      <PlayerAvatar
                        character={p.character}
                        color={p.color}
                        size={pawnSize}
                        bold
                      />
                    </motion.span>
                  </motion.div>
                );
              })}
          </div>

          {/* 落地光環：棋子走完最後一格時，在落點脈動一圈玩家代表色 */}
          <div className="pointer-events-none absolute inset-0 grid grid-cols-[repeat(12,minmax(0,1fr))] grid-rows-[repeat(7,minmax(0,1fr))] gap-1 p-1">
            <AnimatePresence>
              {landing && (
                <motion.div
                  key={`${landing.pos}-${landing.color}`}
                  className="flex items-center justify-center"
                  style={{
                    gridRow: tilePos(landing.pos).row,
                    gridColumn: tilePos(landing.pos).col,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.span
                    className="block rounded-full"
                    style={{
                      width: 38,
                      height: 38,
                      border: `3px solid ${landing.color}`,
                    }}
                    initial={{ scale: 0.35, opacity: 0.7 }}
                    animate={{ scale: 1.9, opacity: 0 }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </LayoutGroup>
      <span className="sr-only">目前玩家：{players[currentIndex]?.name}</span>
    </div>
  );
}
