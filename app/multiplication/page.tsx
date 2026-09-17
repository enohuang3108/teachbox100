"use client";

import { useSharedSetup } from "@/lib/share/useSharedSetup";
import { pages, type PageWithKey } from "@/app/pages.config";
import { SettingsButton } from "@/components/atoms/SettingsButton";
import { FullscreenButton } from "@/components/atoms/FullscreenButton";
import { Dialog, DialogContent } from "@/components/atoms/shadcn/dialog";
import { TooltipProvider } from "@/components/atoms/shadcn/tooltip";
import { SoundToggleButton } from "@/components/atoms/SoundToggleButton";
import { Quiz } from "@/components/multiplication/Quiz";
import { SetupPanel } from "@/components/multiplication/SetupPanel";
import { ACTION_BTN, Tip } from "@/components/templates/GamePageTemplate";
import {
  GAME_STAGE_ID,
  PageTemplate,
} from "@/components/templates/PageTemplate";
import { useMultiplicationStore } from "@/lib/math/store";
import { useEffect, useState } from "react";

const pageInfo: PageWithKey = {
  ...pages.multiplication,
  key: "multiplication",
};

export default function MultiplicationPage() {
  // persist 要等 client 才有資料；介紹頁與 SEO 區塊照常 SSR，只擋作答本體
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // 介紹頁 →（開始使用）設定 →（開始練習）作答；作答中按設定再打開同一個對話框
  const [entered, setEntered] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  useSharedSetup("multiplication", (setup) => {
    useMultiplicationStore.setState({
      tables: [...setup.tables].sort((a, b) => a - b),
      count: setup.count,
    });
    setSetupOpen(true);
  });
  // 每次按開始都換一輪，同樣的設定也從第 1 題重來
  const [round, setRound] = useState(0);
  const { tables, count, sound, setSound } = useMultiplicationStore();

  const actions = (
    <TooltipProvider delayDuration={350} skipDelayDuration={600}>
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
          <Quiz
            key={`${round}-${tables.join()}-${count}`}
            tables={tables}
            count={count}
            soundOn={sound}
            onQuit={() => setSetupOpen(true)}
          />
        )}
      </PageTemplate>

      {/* 放在 PageTemplate 外面：介紹頁階段 children 不渲染，設定要在那時就能開 */}
      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 sm:rounded-[1.5rem]">
          <SetupPanel
            onStart={() => {
              setRound((r) => r + 1);
              setSetupOpen(false);
              setEntered(true);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
