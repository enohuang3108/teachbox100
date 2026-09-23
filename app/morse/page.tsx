"use client";

import { FullscreenButton } from "@/components/atoms/FullscreenButton";
import { MorseGame } from "@/components/morse/MorseGame";
import { ACTION_BTN, Tip } from "@/components/templates/GamePageTemplate";
import { GAME_STAGE_ID, PageTemplate } from "@/components/templates/PageTemplate";
import { pages, type PageWithKey } from "@/app/pages.config";

const pageInfo: PageWithKey = { ...pages.morse, key: "morse" };

export default function MorsePage() {
  return <PageTemplate page={pageInfo} actions={<Tip label="全螢幕"><FullscreenButton targetId={GAME_STAGE_ID} className={ACTION_BTN} /></Tip>}><MorseGame /></PageTemplate>;
}
