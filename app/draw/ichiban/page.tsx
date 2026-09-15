"use client";

import { pages, type PageWithKey } from "@/app/pages.config";
import { FullscreenButton } from "@/components/atoms/FullscreenButton";
import { SettingsButton } from "@/components/atoms/SettingsButton";
import { IchibanExperience } from "@/components/ichiban/IchibanExperience";
import { IchibanSettings } from "@/components/ichiban/IchibanSettings";
import { ACTION_BTN, Tip } from "@/components/templates/GamePageTemplate";
import { GAME_STAGE_ID, PageTemplate } from "@/components/templates/PageTemplate";
import { TooltipProvider } from "@/components/atoms/shadcn/tooltip";
import { useState } from "react";

const pageInfo: PageWithKey = { ...pages.ichiban, key: "ichiban" };

export default function IchibanPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const actions = (
    <TooltipProvider delayDuration={350} skipDelayDuration={600}>
      <SettingsButton onClick={() => setSettingsOpen(true)} />
      <Tip label="全螢幕">
        <FullscreenButton targetId={GAME_STAGE_ID} className={ACTION_BTN} />
      </Tip>
    </TooltipProvider>
  );

  return (
    <PageTemplate page={pageInfo} actions={actions}>
      <IchibanExperience />
      <IchibanSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
    </PageTemplate>
  );
}
