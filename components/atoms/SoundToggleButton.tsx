"use client";

import { ACTION_BTN, Tip } from "@/components/templates/GamePageTemplate";
import { Volume2, VolumeX } from "lucide-react";

/** 遊戲右上角的音效開關；要放在 TooltipProvider 裡面 */
export function SoundToggleButton({
  on,
  onToggle,
}: {
  on: boolean;
  onToggle: (v: boolean) => void;
}) {
  const label = on ? "關閉音效" : "開啟音效";
  return (
    <Tip label={label}>
      <button
        type="button"
        aria-label={label}
        aria-pressed={on}
        onClick={() => onToggle(!on)}
        className={`${ACTION_BTN} flex items-center justify-center`}
      >
        {on ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>
    </Tip>
  );
}
