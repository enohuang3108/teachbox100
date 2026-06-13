"use client";

import { Button } from "@/components/atoms/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/shadcn/dialog";
import { PlayerAvatar } from "./Avatar";
import { ranking } from "@/lib/monopoly/rules";
import type { GameState } from "@/lib/monopoly/types";

const MEDAL = ["🥇", "🥈", "🥉"];

export function GameOverDialog({
  game,
  onRestart,
}: {
  game: GameState;
  onRestart: () => void;
}) {
  const order = ranking(game);
  return (
    <Dialog open={game.phase === "gameover"}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>遊戲結束 — 最終排名</DialogTitle>
        </DialogHeader>
        <ol className="space-y-2">
          {order.map((p, i) => {
            const champion = i === 0;
            return (
              <li
                key={p.id}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition ${
                  champion
                    ? "border-amber-300 bg-amber-50 ring-1 ring-amber-200"
                    : "border-stone-200 bg-stone-50/60"
                }`}
              >
                <span className="w-6 shrink-0 text-center text-lg tabular-nums">
                  {MEDAL[i] ?? <span className="text-stone-400">{i + 1}</span>}
                </span>
                <PlayerAvatar
                  character={p.character}
                  color={p.color}
                  size={champion ? 40 : 32}
                />
                <span
                  className={`flex-1 truncate font-bold ${
                    champion ? "text-stone-900" : "text-stone-600"
                  }`}
                >
                  {p.name}
                </span>
                <span className="shrink-0 font-extrabold tabular-nums text-emerald-700">
                  ${p.money.toLocaleString()}
                </span>
              </li>
            );
          })}
        </ol>
        <Button className="w-full" onClick={onRestart}>
          回到設定，再玩一局
        </Button>
      </DialogContent>
    </Dialog>
  );
}
