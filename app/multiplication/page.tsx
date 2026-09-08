"use client";

import { pages, type PageWithKey } from "@/app/pages.config";
import { SettingsGearIcon } from "@/components/atoms/ani-icons/settings-gear";
import { FullscreenButton } from "@/components/atoms/FullscreenButton";
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
  // persist 要等 client 才有資料；SEO 區塊在 PageTemplate 裡照常 SSR，只擋遊戲本體
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const [mode, setMode] = useState<"setup" | "play">("setup");
  const { tables, count, sound, setSound } = useMultiplicationStore();

  const actions = mode === "play" && (
    <TooltipProvider delayDuration={350} skipDelayDuration={600}>
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
    <PageTemplate
      // 引導語只在設定畫面出現；開始作答之後它已經沒有指涉的對象了。
      // 同 app/memory/page.tsx 的做法。
      page={{
        ...pageInfo,
        guide: mode === "setup" ? pageInfo.guide : undefined,
      }}
      actions={actions || undefined}
    >
      {!hydrated ? null : mode === "setup" ? (
        <SetupPanel onStart={() => setMode("play")} />
      ) : (
        <Quiz
          // 換設定就整局重來，不會沿用上一輪的題號與分數
          key={`${tables.join()}-${count}`}
          tables={tables}
          count={count}
          soundOn={sound}
          onQuit={() => setMode("setup")}
        />
      )}
    </PageTemplate>
  );
}
