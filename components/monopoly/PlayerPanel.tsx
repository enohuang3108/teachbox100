"use client";

import type { GameState } from "@/lib/monopoly/types";

export function PlayerPanel({ game }: { game: GameState }) {
  const leader = Math.max(...game.players.map((p) => (p.bankrupt ? -1 : p.money)));

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="space-y-2">
        {game.players.map((p, i) => {
          const active = i === game.currentPlayerIndex;
          const isLeader = !p.bankrupt && p.money === leader;
          const houseTotal = Object.values(p.houses).reduce((a, b) => a + b, 0);
          return (
            <div
              key={p.id}
              className={`flex items-center gap-3 rounded-xl bg-white px-3 py-2 shadow-sm transition ${
                active ? "ring-2 ring-amber-400" : "ring-1 ring-black/5"
              } ${p.bankrupt ? "opacity-40 grayscale" : ""}`}
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold text-white shadow-inner"
                style={{ background: p.color }}
              >
                {p.name.slice(0, 1)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-bold text-zinc-800">
                    {p.name}
                  </span>
                  {isLeader && <span title="目前領先">👑</span>}
                  {p.bankrupt && (
                    <span className="text-[10px] text-rose-500">破產</span>
                  )}
                </div>
                <div className="text-[11px] text-zinc-400">
                  地 {p.ownedTiles.length}　房 {houseTotal}
                </div>
              </div>
              <span className="shrink-0 text-base font-extrabold tabular-nums text-emerald-700">
                ${p.money.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-xl bg-white/70 p-3 ring-1 ring-black/5">
        <div className="mb-1 text-xs font-bold tracking-wide text-zinc-400">
          事件紀錄
        </div>
        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto text-[11px] leading-snug text-zinc-600">
          {game.log.map((line, i) => (
            <div
              key={i}
              className={i === 0 ? "font-semibold text-zinc-800" : ""}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
