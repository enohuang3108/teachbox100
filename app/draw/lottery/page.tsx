"use client";

import { pages, type PageWithKey } from "@/app/pages.config";
import { RefreshCWIcon } from "@/components/atoms/ani-icons/refresh-cw";
import { SettingsGearIcon } from "@/components/atoms/ani-icons/settings-gear";
import { FullscreenButton } from "@/components/atoms/FullscreenButton";
import { Button } from "@/components/atoms/shadcn/button";
import { TooltipProvider } from "@/components/atoms/shadcn/tooltip";
import { SetupPanel } from "@/components/lottery/SetupPanel";
import { ACTION_BTN, Tip } from "@/components/templates/GamePageTemplate";
import { GAME_STAGE_ID, PageTemplate } from "@/components/templates/PageTemplate";
import { useSound } from "@/lib/hooks/useSound";
import { parseEntries } from "@/lib/lottery/game";
import { useLotteryStore } from "@/lib/lottery/store";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const pageInfo: PageWithKey = { ...pages.lottery, key: "lottery" };

// 只在瀏覽器載入：matter-js 的 UMD 包裡有 optional 依賴的 require，
// 進了 server bundle 會讓共用 chunk 在 prerender 時整個掛掉（連首頁都會）。
// canvas 本來就沒東西可以 SSR。
const LotteryMachine = dynamic(
  () => import("@/components/lottery/LotteryMachine").then((m) => m.LotteryMachine),
  { ssr: false },
);
// @animateicons/react 同樣不能進 server bundle。深路徑在 production 的 SSR 編譯不被 exports map 承認，
// 所以走 barrel，靠 next.config 的 optimizePackageImports 只打包用到的兩顆
const EyeIcon = dynamic(() => import("@animateicons/react/lucide").then((m) => m.EyeIcon), { ssr: false });
const EyeOffIcon = dynamic(() => import("@animateicons/react/lucide").then((m) => m.EyeOffIcon), { ssr: false });

export default function LotteryPage() {
  // persist 要等 client 才有資料；SEO 區塊在 PageTemplate 裡照常 SSR，只擋遊戲本體
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const [mode, setMode] = useState<"setup" | "play">("setup");
  const { text, sound, autoClose } = useLotteryStore();
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [blind, setBlind] = useState(false);
  const { playCorrectSound } = useSound();

  // round 變了就給機器一份新陣列 → 全部放回
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const labels = useMemo(() => parseEntries(text), [text, round]);
  const exhausted = picked.length >= labels.length;

  const restoreAll = () => {
    setPicked([]);
    setRound((r) => r + 1);
  };

  const onPick = (label: string) => {
    setPicked((p) => [...p, label]);
    if (sound) playCorrectSound();
  };

  const actions = mode === "play" && (
    <TooltipProvider delayDuration={350} skipDelayDuration={600}>
      <Tip label={blind ? "看得到球" : "把箱子變黑"}>
        <button
          type="button"
          aria-label={blind ? "看得到球" : "把箱子變黑"}
          aria-pressed={blind}
          onClick={() => setBlind((v) => !v)}
          className="rounded-full"
        >
          {blind ? <EyeOffIcon className={ACTION_BTN} size={20} /> : <EyeIcon className={ACTION_BTN} size={20} />}
        </button>
      </Tip>
      <Tip label="全部放回">
        <RefreshCWIcon className={ACTION_BTN} size={20} aria-label="全部放回" onClick={restoreAll} />
      </Tip>
      <Tip label="設定">
        <button type="button" aria-label="設定" onClick={() => setMode("setup")} className="rounded-full">
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
        <SetupPanel
          onStart={() => {
            restoreAll();
            setMode("play");
          }}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="text-ink flex flex-wrap items-center gap-x-6 gap-y-1 text-lg font-bold tabular-nums">
            <span>
              還剩 {labels.length - picked.length} / {labels.length} 顆
            </span>
            {picked.length > 0 && (
              <Button variant="ghost" size="sm" onClick={restoreAll}>
                全部放回
              </Button>
            )}
          </div>

          {exhausted ? (
            <div className="bg-brand-yellow/20 border-brand-yellow/60 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-4">
              <p className="text-ink font-display text-xl font-extrabold">
                🎉 都抽完了！最後一顆是「{picked[picked.length - 1]}」
              </p>
              <Button onClick={restoreAll}>全部放回</Button>
            </div>
          ) : (
            <div className="bg-paper-warm border-ink/10 aspect-[4/3] w-full overflow-hidden rounded-3xl border">
              <LotteryMachine labels={labels} blind={blind} autoClose={autoClose} onPick={onPick} />
            </div>
          )}
        </div>
      )}

    </PageTemplate>
  );
}
