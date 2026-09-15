"use client";

import { pages, type PageWithKey } from "@/app/pages.config";
import { RefreshCWIcon } from "@/components/atoms/ani-icons/refresh-cw";
import { SettingsButton } from "@/components/atoms/SettingsButton";
import { FullscreenButton } from "@/components/atoms/FullscreenButton";
import { SoundToggleButton } from "@/components/atoms/SoundToggleButton";
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

// Canvas 物理模擬只在開始遊戲後於瀏覽器執行。
const LotteryMachine = dynamic(
  () => import("@/components/lottery/LotteryMachine").then((m) => m.LotteryMachine),
  { ssr: false },
);
export default function LotteryPage() {
  // persist 要等 client 才有資料；SEO 區塊在 PageTemplate 裡照常 SSR，只擋遊戲本體
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const [mode, setMode] = useState<"setup" | "play">("setup");
  const { text, sound, setSound } = useLotteryStore();
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
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
      <Tip label="全部放回">
        <RefreshCWIcon className={ACTION_BTN} size={20} aria-label="全部放回" onClick={restoreAll} />
      </Tip>
      <SettingsButton onClick={() => setMode("setup")} />
      <SoundToggleButton on={sound} onToggle={setSound} />
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
        <div className="grid items-start gap-5 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <aside
            aria-label="已抽出的名單"
            className="border-ink/10 bg-paper-warm/70 rounded-2xl border p-4 shadow-[0_12px_32px_-24px_rgb(2_13_21/0.45)] lg:sticky lg:top-4"
          >
            <div className="border-ink/10 flex items-baseline justify-between gap-3 border-b pb-3">
              <h2 className="font-display text-ink text-xl font-extrabold">抽籤紀錄</h2>
              <span className="text-ink-soft text-sm font-bold tabular-nums">
                還剩 {labels.length - picked.length} / {labels.length} 顆
              </span>
            </div>
            {picked.length === 0 ? (
              <p className="text-ink-soft mt-3 text-sm leading-[1.75]">點箱子裡任一顆球開始抽。</p>
            ) : (
              <ol className="divide-ink/15 mt-2 max-h-[min(60svh,520px)] divide-y divide-dashed overflow-y-auto">
                {picked.map((label, index) => (
                  <li key={index} className="grid grid-cols-[auto_1fr] items-center gap-3 py-2.5">
                    <span className="bg-paper border-ink/10 text-ink-soft rounded-full border px-2.5 py-0.5 text-sm font-extrabold tabular-nums">
                      {index + 1}
                    </span>
                    <span className="text-ink min-w-0 truncate font-bold">{label}</span>
                  </li>
                ))}
              </ol>
            )}
            {picked.length > 0 && (
              <Button variant="outline" size="sm" className="mt-3 w-full" onClick={restoreAll}>
                全部放回
              </Button>
            )}
          </aside>

          <div className="flex min-w-0 flex-col gap-4">
            {exhausted && (
              <div className="border-ink/10 bg-paper-warm flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-4">
                <p className="text-ink font-display text-xl font-extrabold">
                  都抽完了，最後一顆是「{picked[picked.length - 1]}」
                </p>
                <Button onClick={restoreAll}>全部放回</Button>
              </div>
            )}
            <div className="relative h-[min(75svh,700px)] min-h-[420px] w-full">
              <LotteryMachine key={round} labels={labels} onPick={onPick} />
            </div>
          </div>
        </div>
      )}

    </PageTemplate>
  );
}
