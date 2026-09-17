"use client";

import { useSharedSetup } from "@/lib/share/useSharedSetup";
import { pages, type PageWithKey } from "@/app/pages.config";
import { RefreshCWIcon } from "@/components/atoms/ani-icons/refresh-cw";
import { SettingsButton } from "@/components/atoms/SettingsButton";
import { FullscreenButton } from "@/components/atoms/FullscreenButton";
import { SoundToggleButton } from "@/components/atoms/SoundToggleButton";
import { Button } from "@/components/atoms/shadcn/button";
import { Dialog, DialogContent } from "@/components/atoms/shadcn/dialog";
import { TooltipProvider } from "@/components/atoms/shadcn/tooltip";
import { SetupPanel } from "@/components/gacha/SetupPanel";
import { ACTION_BTN, Tip } from "@/components/templates/GamePageTemplate";
import {
  GAME_STAGE_ID,
  PageTemplate,
} from "@/components/templates/PageTemplate";
import { StageFixed } from "@/components/templates/StageFixed";
import { useSound } from "@/lib/hooks/useSound";
import { parseEntries } from "@/lib/gacha/game";
import { useGachaStore } from "@/lib/gacha/store";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const pageInfo: PageWithKey = { ...pages.gacha, key: "gacha" };

// Canvas 物理模擬只在開始遊戲後於瀏覽器執行。
const GachaMachine = dynamic(
  () => import("@/components/gacha/GachaMachine").then((m) => m.GachaMachine),
  { ssr: false },
);
export default function GachaPage() {
  // persist 要等 client 才有資料；介紹頁與 SEO 區塊照常 SSR，只擋遊戲本體
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // 介紹頁 →（開始使用）設定 →（開始）扭蛋機；扭蛋機裡按設定再打開同一個對話框
  const [entered, setEntered] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  useSharedSetup("gacha", (setup) => {
    useGachaStore.setState(setup);
    setSetupOpen(true);
  });
  const { text, sound, setSound, putBack } = useGachaStore();
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [shake, setShake] = useState(0);
  const { playCorrectSound } = useSound();

  // round 變了就給機器一份新陣列 → 全部放回
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const labels = useMemo(() => parseEntries(text), [text, round]);
  // 放回箱子的模式永遠抽不完
  const exhausted = !putBack && picked.length >= labels.length;

  const restoreAll = () => {
    setPicked([]);
    setRound((r) => r + 1);
  };

  const onPick = (label: string) => {
    setPicked((p) => [...p, label]);
    if (sound) playCorrectSound();
  };

  const actions = (
    <TooltipProvider delayDuration={350} skipDelayDuration={600}>
      <Tip label="全部放回">
        <RefreshCWIcon
          className={ACTION_BTN}
          size={20}
          aria-label="全部放回"
          onClick={restoreAll}
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
          // 箱子滿版貼著螢幕（頂列以下；全螢幕時整個畫面），紀錄浮在左上角
          <StageFixed>
            <div className="fixed inset-x-0 top-16 bottom-0 [#game-stage:fullscreen_&]:top-0">
              <GachaMachine
                key={round}
                labels={labels}
                putBack={putBack}
                onPick={onPick}
                shake={shake}
              />
            </div>

            <aside
              aria-label="已抽出的名單"
              className="fixed top-20 left-4 z-(--z-sticky) w-64 rounded-3xl bg-card/90 px-5 pt-5 pb-4 shadow-sm backdrop-blur-[2px] [#game-stage:fullscreen_&]:top-4"
            >
              <h2 className="font-display text-2xl font-extrabold text-ink">
                抽籤紀錄
              </h2>
              {!putBack && (
                <p className="mt-0.5 text-caption text-ink-soft tabular-nums">
                  還剩 {labels.length - picked.length} / {labels.length} 顆
                </p>
              )}
              {picked.length === 0 ? (
                <p className="mt-3 text-caption text-ink-soft">
                  點一顆扭蛋打開。
                </p>
              ) : (
                <ol className="mt-2 max-h-[40svh] divide-y divide-border overflow-y-auto">
                  {picked.map((label, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <span className="shrink-0 text-sm text-ink-soft tabular-nums">
                        第 {index + 1} 顆
                      </span>
                      <span className="min-w-0 truncate text-sm font-bold text-ink">
                        {label}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </aside>

            {/* 操作鈕跟計時器一樣固定在右下角直排，只有一顆搖一搖 */}
            <div className="fixed right-6 bottom-6 z-(--z-sticky) flex flex-col items-center gap-3">
              <Button
                onClick={() => setShake((n) => n + 1)}
                className="size-24 rounded-full p-0 text-xl font-bold transition-transform duration-press ease-out active:scale-[0.97]"
              >
                搖一搖
              </Button>
            </div>

            {exhausted && (
              <div className="fixed inset-x-4 bottom-6 z-(--z-sticky) mx-auto flex max-w-xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
                <p className="font-display text-xl font-extrabold text-ink">
                  都抽完了
                </p>
                <Button onClick={restoreAll}>全部放回</Button>
              </div>
            )}
          </StageFixed>
        )}
      </PageTemplate>

      {/* 放在 PageTemplate 外面：介紹頁階段 children 不渲染，設定要在那時就能開 */}
      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 sm:rounded-[1.5rem]">
          <SetupPanel
            onStart={() => {
              restoreAll();
              setSetupOpen(false);
              setEntered(true);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
