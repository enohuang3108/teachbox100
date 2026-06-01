"use client";

import { Board } from "@/components/monopoly/Board";
import { CardDialog } from "@/components/monopoly/CardDialog";
import { Dice } from "@/components/monopoly/Dice";
import { GameOverDialog } from "@/components/monopoly/GameOverDialog";
import { PlayerPanel } from "@/components/monopoly/PlayerPanel";
import { QuestionDialog } from "@/components/monopoly/QuestionDialog";
import { SetupPanel } from "@/components/monopoly/SetupPanel";
import { realisticEffect } from "@/lib/helpers/confetti-effects";
import { useMonopolyStore } from "@/lib/monopoly/store";
import { useEffect, useState } from "react";

export default function MonopolyPage() {
  const [hydrated, setHydrated] = useState(false);
  const { game, roll, answer, confirm, resolveCard, reset } = useMonopolyStore();

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (game?.phase === "gameover") realisticEffect();
  }, [game?.phase]);

  if (!hydrated) return null;

  if (!game || game.phase === "setup") {
    return <SetupPanel />;
  }

  const pa = game.pendingAction;
  const rollDisabled = pa !== null;

  return (
    <main className="mx-auto grid max-w-6xl gap-4 p-4 lg:grid-cols-[1fr_320px]">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            輪到：{game.players[game.currentPlayerIndex]?.name}
          </h2>
          <button
            className="text-sm text-muted-foreground underline"
            onClick={reset}
          >
            重新開始
          </button>
        </div>
        <Board players={game.players} currentIndex={game.currentPlayerIndex} />
        <Dice lastRoll={game.lastRoll} disabled={rollDisabled} onRoll={roll} />
      </section>

      <aside className="h-[70vh]">
        <PlayerPanel game={game} />
      </aside>

      {(pa?.kind === "buyQuestion" || pa?.kind === "buildQuestion") && (
        <QuestionDialog pending={pa} question={pa.question} onAnswered={answer} />
      )}
      {(pa?.kind === "confirmBuy" || pa?.kind === "confirmBuild") && (
        <PurchaseConfirm
          label={pa.kind === "confirmBuy" ? "購買這塊地？" : "在這裡蓋一棟房子？"}
          onConfirm={confirm}
        />
      )}
      {pa?.kind === "drawCard" && (
        <CardDialog pending={pa} onResolve={resolveCard} />
      )}

      <GameOverDialog game={game} onRestart={reset} />
    </main>
  );
}

function PurchaseConfirm({
  label,
  onConfirm,
}: {
  label: string;
  onConfirm: (accept: boolean) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="space-y-4 rounded-lg bg-background p-6 shadow-lg">
        <p className="text-lg font-medium">{label}</p>
        <div className="flex gap-2">
          <button
            className="flex-1 rounded bg-primary px-4 py-2 text-primary-foreground"
            onClick={() => onConfirm(true)}
          >
            是
          </button>
          <button
            className="flex-1 rounded border px-4 py-2"
            onClick={() => onConfirm(false)}
          >
            否
          </button>
        </div>
      </div>
    </div>
  );
}
