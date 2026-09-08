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
      <DialogContent hideClose>
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-extrabold">
            遊戲結束 — 最終排名
          </DialogTitle>
        </DialogHeader>
        <ol className="space-y-2">
          {order.map((p, i) => {
            const champion = i === 0;
            return (
              <li
                key={p.id}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2 ring-1 ${
                  champion
                    ? "bg-brand-yellow/15 ring-brand-yellow/50"
                    : "bg-sand/50 ring-ink/[0.06]"
                }`}
              >
                <span className="w-6 shrink-0 text-center text-lg tabular-nums">
                  {MEDAL[i] ?? (
                    <span className="text-ink-soft/60">{i + 1}</span>
                  )}
                </span>
                <PlayerAvatar
                  character={p.character}
                  color={p.color}
                  size={champion ? 40 : 32}
                />
                <span
                  className={`flex-1 truncate font-bold ${
                    champion ? "text-ink" : "text-ink-soft"
                  }`}
                >
                  {p.name}
                </span>
                <span className="shrink-0 font-extrabold tabular-nums text-brand-green">
                  ${p.money.toLocaleString()}
                </span>
              </li>
            );
          })}
        </ol>
        <Button
          className="w-full rounded-full transition-transform duration-150 ease-out active:scale-[0.97]"
          onClick={onRestart}
        >
          回到設定，再玩一局
        </Button>
      </DialogContent>
    </Dialog>
  );
}
