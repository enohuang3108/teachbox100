"use client";

import { Bell, Music, Volume2 } from "lucide-react";
import { useState } from "react";
import { Slider } from "@/components/atoms/shadcn/slider";
import { ACTION_BTN } from "@/components/templates/GamePageTemplate";
import { useAudioStore } from "@/lib/monopoly/audio";

function VolumeRow({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-semibold text-ink-soft">
        <span className="flex items-center gap-1.5">
          {icon} {label}
        </span>
        <span className="tabular-nums text-ink-soft/60">
          {Math.round(value * 100)}
        </span>
      </div>
      <Slider
        min={0}
        max={1}
        step={0.05}
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        aria-label={label}
      />
    </div>
  );
}

export function AudioSettings() {
  const [open, setOpen] = useState(false);
  const { bgmVolume, sfxVolume, setBgmVolume, setSfxVolume } = useAudioStore();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="音量設定"
        className={`${ACTION_BTN} flex items-center justify-center`}
      >
        <Volume2 className="h-5 w-5" />
      </button>
      {open && (
        <>
          {/* 點擊外部關閉 */}
          <button
            type="button"
            aria-label="關閉音量設定"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-56 space-y-3 rounded-2xl bg-card p-4 shadow-[0_16px_36px_-16px_rgb(2_13_21/0.3)] ring-1 ring-ink/[0.06]">
            <VolumeRow
              label="背景音樂"
              icon={<Music className="h-3.5 w-3.5" />}
              value={bgmVolume}
              onChange={setBgmVolume}
            />
            <VolumeRow
              label="音效"
              icon={<Bell className="h-3.5 w-3.5" />}
              value={sfxVolume}
              onChange={setSfxVolume}
            />
          </div>
        </>
      )}
    </div>
  );
}
