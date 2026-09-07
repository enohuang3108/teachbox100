"use client";

import { pages, type PageWithKey } from "@/app/pages.config";
import { RefreshCWIcon } from "@/components/atoms/ani-icons/refresh-cw";
import { SettingsGearIcon } from "@/components/atoms/ani-icons/settings-gear";
import { FullscreenButton } from "@/components/atoms/FullscreenButton";
import { Button } from "@/components/atoms/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/shadcn/dialog";
import { TooltipProvider } from "@/components/atoms/shadcn/tooltip";
import { MemoryCard } from "@/components/memory/MemoryCard";
import { SetupPanel } from "@/components/memory/SetupPanel";
import { useMemoryGame } from "@/components/memory/useMemoryGame";
import { ACTION_BTN, Tip } from "@/components/templates/GamePageTemplate";
import { GAME_STAGE_ID, PageTemplate } from "@/components/templates/PageTemplate";
import { useMemoryStore } from "@/lib/memory/store";
import { useEffect, useState } from "react";

/** 讓盤面盡量排成整齊的矩形：先取 √n，除不盡就再多一欄試試，上限 6 */
function columnsFor(n: number) {
  const base = Math.min(6, Math.max(2, Math.ceil(Math.sqrt(n))));
  return n % base !== 0 && base < 6 && n % (base + 1) === 0 ? base + 1 : base;
}

const pageInfo: PageWithKey = { ...pages.memory, key: "memory" };

export default function MemoryPage() {
  // persist 要等 client 才有資料；SEO 區塊在 PageTemplate 裡照常 SSR，只擋遊戲本體
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const [mode, setMode] = useState<"setup" | "play">("setup");
  const [confirmLeave, setConfirmLeave] = useState(false);
  const { deck, preview, sound } = useMemoryStore();
  const game = useMemoryGame(deck, preview, sound);

  const begin = () => {
    game.start();
    setMode("play");
  };
  const openSettings = () => {
    if (game.touched && !game.done) setConfirmLeave(true);
    else setMode("setup");
  };

  const cols = columnsFor(game.cards.length);

  const actions = mode === "play" && (
    <TooltipProvider delayDuration={350} skipDelayDuration={600}>
      <Tip label="再玩一次">
        <RefreshCWIcon className={ACTION_BTN} size={20} aria-label="再玩一次" onClick={game.start} />
      </Tip>
      <Tip label="設定">
        <button type="button" aria-label="設定" onClick={openSettings} className="rounded-full">
          <SettingsGearIcon className={ACTION_BTN} size={20} />
        </button>
      </Tip>
      <Tip label="全螢幕">
        <FullscreenButton targetId={GAME_STAGE_ID} className={ACTION_BTN} />
      </Tip>
    </TooltipProvider>
  );

  return (
    <PageTemplate page={pageInfo} actions={actions || undefined}>
      {!hydrated ? null : mode === "setup" ? (
        <SetupPanel onStart={begin} />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="text-ink flex flex-wrap items-center gap-x-6 gap-y-1 text-lg font-bold tabular-nums">
            <span>
              配對 {game.matched.size} / {deck.length}
            </span>
            <span>翻牌 {game.flips} 次</span>
            {game.previewing && <span className="text-brand-blue">記住位置！</span>}
          </div>

          {game.done && (
            <div className="bg-brand-yellow/20 border-brand-yellow/60 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-4">
              <p className="text-ink font-display text-xl font-extrabold">
                🎉 全部配對完成！總共翻了 {game.flips} 次
              </p>
              <Button onClick={game.start}>再玩一次</Button>
            </div>
          )}

          {/* 2–6 欄：桌機依牌數挑欄數，手機 min(44%) 壓成 2 欄；牌多就往下捲 */}
          <div
            className="mx-auto grid w-full gap-3 sm:gap-4"
            style={{
              maxWidth: `${cols * 12}rem`,
              gridTemplateColumns: `repeat(auto-fit, minmax(min(44%, max(8.5rem, calc(100% / ${cols} - 1rem))), 1fr))`,
            }}
          >
            {game.cards.map((card) => {
              const matched = game.matched.has(card.groupId);
              return (
                <MemoryCard
                  key={card.id}
                  face={card.face}
                  faceUp={game.previewing || matched || game.faceUp.includes(card.id)}
                  matched={matched}
                  disabled={game.previewing || matched || game.faceUp.length === 2}
                  onSelect={() => game.select(card)}
                />
              );
            })}
          </div>
        </div>
      )}

      <Dialog open={confirmLeave} onOpenChange={setConfirmLeave}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>離開這一局？</DialogTitle>
            <DialogDescription>目前的進度不會保留，回到設定後要重新開始。</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmLeave(false)}>
              繼續玩
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmLeave(false);
                setMode("setup");
              }}
            >
              回到設定
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
