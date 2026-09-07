"use client";

import { pages, type PageWithKey } from "@/app/pages.config";
import { RefreshCWIcon } from "@/components/atoms/ani-icons/refresh-cw";
import { SettingsGearIcon } from "@/components/atoms/ani-icons/settings-gear";
import { FullscreenButton } from "@/components/atoms/FullscreenButton";
import { SoundToggleButton } from "@/components/atoms/SoundToggleButton";
import { Button } from "@/components/atoms/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/atoms/shadcn/dialog";
import { TooltipProvider } from "@/components/atoms/shadcn/tooltip";
import { ACTION_BTN, Tip } from "@/components/templates/GamePageTemplate";
import { GAME_STAGE_ID, PageTemplate } from "@/components/templates/PageTemplate";
import { SetupPanel } from "@/components/wheel/SetupPanel";
import { useWheel } from "@/components/wheel/useWheel";
import { Wheel } from "@/components/wheel/Wheel";
import { parseEntries } from "@/lib/wheel/game";
import { useWheelStore } from "@/lib/wheel/store";
import { useEffect, useState } from "react";

const pageInfo: PageWithKey = { ...pages.wheel, key: "wheel" };

export default function WheelPage() {
  // persist 要等 client 才有資料；SEO 區塊在 PageTemplate 裡照常 SSR，只擋遊戲本體
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const [mode, setMode] = useState<"setup" | "play">("setup");
  const { text, removeOnPick, sound, setSound } = useWheelStore();
  const entries = parseEntries(text);
  const wheel = useWheel(entries, sound);

  const exhausted = wheel.active.length < 2;

  const actions = mode === "play" && (
    <TooltipProvider delayDuration={350} skipDelayDuration={600}>
      <Tip label="全部放回">
        <RefreshCWIcon
          className={ACTION_BTN}
          size={20}
          aria-label="全部放回"
          onClick={wheel.restoreAll}
        />
      </Tip>
      <Tip label="設定">
        <button
          type="button"
          aria-label="設定"
          onClick={() => setMode("setup")}
          className="rounded-full"
        >
          <SettingsGearIcon className={ACTION_BTN} size={20} />
        </button>
      </Tip>
      <SoundToggleButton on={sound} onToggle={setSound} />
      <Tip label="全螢幕">
        <FullscreenButton targetId={GAME_STAGE_ID} className={ACTION_BTN} />
      </Tip>
    </TooltipProvider>
  );

  return (
    <PageTemplate page={pageInfo} actions={actions || undefined}>
      {!hydrated ? null : mode === "setup" ? (
        <SetupPanel onStart={() => setMode("play")} />
      ) : (
        <div className="flex flex-col gap-4">
          {removeOnPick && (
            <div className="text-ink flex flex-wrap items-center gap-x-6 gap-y-1 text-lg font-bold tabular-nums">
              <span>
                還剩 {wheel.active.length} / {entries.length} 個
              </span>
              {wheel.removedCount > 0 && (
                <Button variant="ghost" size="sm" onClick={wheel.restoreAll}>
                  全部放回
                </Button>
              )}
            </div>
          )}

          {exhausted ? (
            <div className="bg-brand-yellow/20 border-brand-yellow/60 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-4">
              <p className="text-ink font-display text-xl font-extrabold">
                🎉 都抽完了！最後一個是「{wheel.active[0]?.label}」
              </p>
              <Button onClick={wheel.restoreAll}>全部放回</Button>
            </div>
          ) : (
            <Wheel
              labels={wheel.active.map((e) => e.label)}
              rotation={wheel.rotation}
              spinMs={wheel.spinMs}
              spinning={wheel.spinning}
              disabled={wheel.result !== null}
              onSpin={wheel.spin}
            />
          )}
        </div>
      )}

      <Dialog
        open={wheel.result !== null}
        onOpenChange={(open) => !open && wheel.dismiss(removeOnPick)}
      >
        <DialogContent className="text-center">
          <DialogHeader className="items-center">
            <DialogDescription>抽到了</DialogDescription>
            <DialogTitle className="font-display text-ink text-4xl leading-tight font-black break-all sm:text-5xl">
              {wheel.result}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2 flex justify-center gap-2">
            <Button variant="outline" onClick={() => wheel.dismiss(removeOnPick)}>
              關閉
            </Button>
            <Button
              onClick={() => {
                wheel.dismiss(removeOnPick);
                // 等對話框關掉、盤面（可能已少一格）重畫後再轉
                window.setTimeout(wheel.spin, 0);
              }}
            >
              再轉一次
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageTemplate>
  );
}
