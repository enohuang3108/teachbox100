"use client";

import { Bell, Music, Volume2 } from "lucide-react";
import { useState } from "react";
import { Slider } from "@/components/atoms/shadcn/slider";
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
      <div className="flex items-center justify-between text-xs font-medium text-stone-600">
        <span className="flex items-center gap-1.5">
          {icon} {label}
        </span>
        <span className="tabular-nums text-stone-400">
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
        title="音量設定"
        aria-label="音量設定"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-50 text-stone-600 shadow-md ring-1 ring-stone-900/5 transition hover:bg-stone-100 hover:text-stone-900"
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
          <div className="absolute right-0 top-12 z-50 w-56 space-y-3 rounded-2xl bg-stone-50 p-4 shadow-xl ring-1 ring-stone-900/5">
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
