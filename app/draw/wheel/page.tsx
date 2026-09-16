"use client";

import { pages, type PageWithKey } from "@/app/pages.config";
import { RefreshCWIcon } from "@/components/atoms/ani-icons/refresh-cw";
import { SettingsButton } from "@/components/atoms/SettingsButton";
import { FullscreenButton } from "@/components/atoms/FullscreenButton";
import { SoundToggleButton } from "@/components/atoms/SoundToggleButton";
import { Button } from "@/components/atoms/shadcn/button";
import { Dialog, DialogContent } from "@/components/atoms/shadcn/dialog";
import { TooltipProvider } from "@/components/atoms/shadcn/tooltip";
import { ACTION_BTN, Tip } from "@/components/templates/GamePageTemplate";
import {
  GAME_STAGE_ID,
  PageTemplate,
} from "@/components/templates/PageTemplate";
import { SetupPanel } from "@/components/wheel/SetupPanel";
import { useWheel } from "@/components/wheel/useWheel";
import { Wheel } from "@/components/wheel/Wheel";
import { parseEntries } from "@/lib/wheel/game";
import { useWheelStore } from "@/lib/wheel/store";
import { useEffect, useState } from "react";

const pageInfo: PageWithKey = { ...pages.wheel, key: "wheel" };

export default function WheelPage() {
  // persist 要等 client 才有資料；介紹頁與 SEO 區塊照常 SSR，只擋轉盤本體
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // 介紹頁 →（開始）設定 →（開始）轉盤；轉盤裡按設定再打開同一個對話框
  const [entered, setEntered] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const { text, removeOnPick, sound, setSound } = useWheelStore();
  const entries = parseEntries(text);
  const wheel = useWheel(entries, sound, removeOnPick);

  const exhausted = wheel.active.length < 2;

  const actions = (
    <TooltipProvider delayDuration={350} skipDelayDuration={600}>
      <Tip label="全部放回">
        <RefreshCWIcon
          className={ACTION_BTN}
          size={20}
          aria-label="全部放回"
          onClick={wheel.restoreAll}
        />
      </Tip>
      <SettingsButton onClick={() => setSetupOpen(true)} />
      <SoundToggleButton on={sound} onToggle={setSound} />
      <Tip label="全螢幕">
        <FullscreenButton targetId={GAME_STAGE_ID} className={ACTION_BTN} />
      </Tip>
    </TooltipProvider>
  );

  return (
    <>
      <PageTemplate
        page={pageInfo}
        actions={actions}
        landing={{
          startLabel: "開始使用",
          onStart: () => setSetupOpen(true),
          entered,
        }}
      >
        {hydrated && (
          <div className="relative flex flex-col items-center">
            {/* 抽到的結果浮在轉盤上方、不佔版面，轉盤才會落在畫面正中間；不另外跳窗，下一次轉才把它拿掉 */}
            <div
              className="pointer-events-none absolute bottom-full left-1/2 mb-6 flex w-max max-w-[90vw] -translate-x-1/2 flex-col items-center text-center"
              aria-live="polite"
            >
              {wheel.result !== null && !wheel.spinning && (
                <>
                  <span className="text-caption text-muted-foreground">
                    抽到了
                  </span>
                  <span className="font-display text-4xl leading-tight font-black break-all text-ink animate-in fade-in-0 zoom-in-95 duration-200 sm:text-5xl">
                    {wheel.result}
                  </span>
                </>
              )}
            </div>

            {exhausted ? (
              <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-yellow/60 bg-brand-yellow/20 px-5 py-4">
                <p className="font-display text-xl font-extrabold text-ink">
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
                disabled={false}
                onSpin={wheel.spin}
              />
            )}
          </div>
        )}
      </PageTemplate>

      {/* 放在 PageTemplate 外面：介紹頁階段 children 不渲染，設定要在那時就能開 */}
      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 sm:rounded-[1.5rem]">
          <SetupPanel
            onStart={() => {
              wheel.restoreAll();
              setSetupOpen(false);
              setEntered(true);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
