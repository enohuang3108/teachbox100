"use client";

import type { GameState } from "@/lib/monopoly/types";

export function PlayerPanel({ game }: { game: GameState }) {
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="space-y-1 overflow-y-auto">
        {game.players.map((p, i) => (
          <div
            key={p.id}
            className={`rounded border p-2 ${i === game.currentPlayerIndex ? "ring-2 ring-primary" : ""} ${p.bankrupt ? "opacity-40" : ""}`}
            style={{ borderLeft: `4px solid ${p.color}` }}
          >
            <div className="flex justify-between font-medium">
              <span>
                {p.name}
                {p.bankrupt && "（破產）"}
              </span>
              <span>${p.money}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              地 {p.ownedTiles.length}　房{" "}
              {Object.values(p.houses).reduce((a, b) => a + b, 0)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto max-h-40 overflow-y-auto rounded border bg-muted/40 p-2 text-xs">
        {game.log.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
}
