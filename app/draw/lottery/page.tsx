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

          {exhausted && (
            <div className="bg-brand-yellow/20 border-brand-yellow/60 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-4">
              <p className="text-ink font-display text-xl font-extrabold">
                🎉 都抽完了！最後一顆是「{picked[picked.length - 1]}」
              </p>
              <Button onClick={restoreAll}>全部放回</Button>
            </div>
          )}
          <div className="relative h-[min(75svh,700px)] min-h-[420px] w-full">
            <LotteryMachine key={round} labels={labels} onPick={onPick} />

          </div>
          {picked.length > 0 && <div className="flex flex-wrap justify-center gap-2" aria-label="已抽出的名單">
            {picked.map((label, index) => <span key={index} className="bg-paper-warm rounded-full border border-ink/10 px-4 py-2 text-sm">{index + 1}. {label}</span>)}
          </div>}
        </div>
      )}

    </PageTemplate>
  );
}
