"use client";

import { pages, type PageWithKey } from "@/app/pages.config";
import { FullscreenButton } from "@/components/atoms/FullscreenButton";
import { IchibanExperience } from "@/components/ichiban/IchibanExperience";
import { ACTION_BTN, Tip } from "@/components/templates/GamePageTemplate";
import { GAME_STAGE_ID, PageTemplate } from "@/components/templates/PageTemplate";
import { TooltipProvider } from "@/components/atoms/shadcn/tooltip";

const pageInfo: PageWithKey = { ...pages.ichiban, key: "ichiban" };

export default function IchibanPage() {
  const actions = (
    <TooltipProvider delayDuration={350} skipDelayDuration={600}>
      <Tip label="全螢幕">
        <FullscreenButton targetId={GAME_STAGE_ID} className={ACTION_BTN} />
      </Tip>
    </TooltipProvider>
  );

  return (
    <PageTemplate page={pageInfo} actions={actions}>
      <IchibanExperience />
    </PageTemplate>
  );
}
