"use client";

import { SettingsGearIcon } from "@/components/atoms/ani-icons/settings-gear";
import { ACTION_BTN, Tip } from "@/components/templates/GamePageTemplate";

/** 遊戲右上角的設定鈕；要放在 TooltipProvider 裡面 */
export function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <Tip label="設定">
      <button
        type="button"
        aria-label="設定"
        onClick={onClick}
        className={`${ACTION_BTN} flex items-center justify-center`}
      >
        <SettingsGearIcon size={20} />
      </button>
    </Tip>
  );
}
