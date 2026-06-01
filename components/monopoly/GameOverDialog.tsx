"use client";

import { Button } from "@/components/atoms/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/shadcn/dialog";
import { ranking } from "@/lib/monopoly/rules";
import type { GameState } from "@/lib/monopoly/types";

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
          {order.map((p, i) => (
            <li
              key={p.id}
              className="flex justify-between rounded border p-2"
              style={{ borderLeft: `4px solid ${p.color}` }}
            >
              <span>
                {i + 1}. {p.name}
              </span>
              <span>${p.money}</span>
            </li>
          ))}
        </ol>
        <Button className="w-full" onClick={onRestart}>
          回到設定，再玩一局
        </Button>
      </DialogContent>
    </Dialog>
  );
}
