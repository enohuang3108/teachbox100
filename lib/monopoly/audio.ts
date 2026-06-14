import { create } from "zustand";
import { persist } from "zustand/middleware";

// 音量設定（0–1），持久化保存。背景音樂與音效各自獨立。
interface AudioStore {
  bgmVolume: number;
  sfxVolume: number;
  setBgmVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const useAudioStore = create<AudioStore>()(
  persist(
    (set) => ({
      bgmVolume: 0.3,
      sfxVolume: 0.7,
      setBgmVolume: (v) => set({ bgmVolume: clamp01(v) }),
      setSfxVolume: (v) => set({ sfxVolume: clamp01(v) }),
    }),
    { name: "monopoly-audio" },
  ),
);
