"use client";

import { pages, type PageWithKey } from "@/app/pages.config";
import { FullscreenButton } from "@/components/atoms/FullscreenButton";
import { SettingsButton } from "@/components/atoms/SettingsButton";
import { Dialog, DialogContent } from "@/components/atoms/shadcn/dialog";
import { SoundToggleButton } from "@/components/atoms/SoundToggleButton";
import { TooltipProvider } from "@/components/atoms/shadcn/tooltip";
import { IchibanExperience } from "@/components/ichiban/IchibanExperience";
import { IchibanSettings } from "@/components/ichiban/IchibanSettings";
import { ACTION_BTN, Tip } from "@/components/templates/GamePageTemplate";
import {
  GAME_STAGE_ID,
  PageTemplate,
} from "@/components/templates/PageTemplate";
import { useIchibanStore } from "@/lib/ichiban/store";
import { useState } from "react";

const pageInfo: PageWithKey = { ...pages.ichiban, key: "ichiban" };

export default function IchibanPage() {
  // 介紹頁 →（開始使用）設定 →（開始）撕票；撕票時按設定再打開同一個對話框
  const [entered, setEntered] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const sound = useIchibanStore((s) => s.sound);
  const setSound = useIchibanStore((s) => s.setSound);
  const actions = (
    <TooltipProvider delayDuration={350} skipDelayDuration={600}>
      <SettingsButton onClick={() => setSettingsOpen(true)} />
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
          onStart: () => setSettingsOpen(true),
          entered,
        }}
      >
        <IchibanExperience />
      </PageTemplate>

      {/* 放在 PageTemplate 外面：介紹頁階段 children 不渲染，設定要在那時就能開 */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-4xl gap-0 overflow-hidden p-0 sm:rounded-[1.5rem]">
          <IchibanSettings
            onStart={() => {
              setSettingsOpen(false);
              setEntered(true);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
