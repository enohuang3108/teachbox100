import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Team {
  id: number;
  name: string;
  score: number;
}

export const MIN_TEAMS = 2;
export const MAX_TEAMS = 40; // 也可以一人一格當點名計分用，所以放寬到 40
export const STEPS = [1, 2, 5, 10] as const;

const makeTeam = (i: number): Team => ({
  id: i,
  name: `第 ${i + 1} 組`,
  score: 0,
});

interface ScoreboardStore {
  teams: Team[];
  /** 一次加減幾分，老師自己選 */
  step: number;
  sound: boolean;
  /** 卡片色相的起點；每組再依序錯開黃金角，換一批顏色就換這個數 */
  hueSeed: number;
  tone: ToneKey;
  setTeamCount: (n: number) => void;
  /** 貼名單：一行一個名字，行數就是格數，同一格的分數會留著 */
  setNames: (names: string[]) => void;
  setStep: (n: number) => void;
  setSound: (v: boolean) => void;
  shuffleColors: () => void;
  setTone: (t: ToneKey) => void;
  rename: (id: number, name: string) => void;
  addScore: (id: number, delta: number) => void;
  resetScores: () => void;
}

/**
 * 卡片色調。每種只是同一條 hsl 公式的不同參數：
 * sat/light 決定那個色相長什麼樣，mix 決定混多少進紙色底（越低越淡）。
 * 一律 color-mix 進 --card，暗色模式才會自己跟著沉下去。
 */
export const TONES = {
  paper: { label: "紙感", sat: 38, light: 58, mix: 16 },
  pastel: { label: "粉彩", sat: 95, light: 80, mix: 52 },
  vivid: { label: "鮮豔", sat: 80, light: 55, mix: 48 },
  earth: { label: "大地", sat: 32, light: 45, mix: 30 },
  mono: { label: "無彩", sat: 0, light: 50, mix: 12 },
} as const;

export type ToneKey = keyof typeof TONES;

export const toneStyle = (tone: ToneKey, hue: number) => {
  const { sat, light, mix } = TONES[tone];
  return {
    background: `color-mix(in oklab, hsl(${hue} ${sat}% ${light}%) ${mix}%, var(--card))`,
    borderColor: `color-mix(in oklab, hsl(${hue} ${Math.round(sat * 0.85)}% ${Math.round(light * 0.65)}%) ${mix + 8}%, transparent)`,
  };
};

/** 黃金角錯開色相：不管幾組，相鄰兩組的顏色都拉得夠開 */
export const teamHue = (seed: number, index: number) =>
  (seed + index * 137.508) % 360;

export const useScoreboardStore = create<ScoreboardStore>()(
  persist(
    (set) => ({
      teams: Array.from({ length: 4 }, (_, i) => makeTeam(i)),
      step: 1,
      sound: true,
      // 固定初值，client 才不會跟 SSR 的畫面對不起來；要換色按設定裡的按鈕
      hueSeed: 0,
      tone: "paper",
      // 增減組別時保留既有組的名稱與分數，只補尾巴或砍尾巴
      setTeamCount: (n) =>
        set((s) => ({
          teams: Array.from(
            { length: Math.min(MAX_TEAMS, Math.max(MIN_TEAMS, n)) },
            (_, i) => s.teams[i] ?? makeTeam(i),
          ),
        })),
      setNames: (names) =>
        set((s) => ({
          teams: names.slice(0, MAX_TEAMS).map((name, i) => ({
            ...(s.teams[i] ?? makeTeam(i)),
            id: i,
            name,
          })),
        })),
      setStep: (step) => set({ step }),
      setSound: (sound) => set({ sound }),
      setTone: (tone) => set({ tone }),
      shuffleColors: () => set({ hueSeed: Math.floor(Math.random() * 360) }),
      rename: (id, name) =>
        set((s) => ({
          teams: s.teams.map((t) => (t.id === id ? { ...t, name } : t)),
        })),
      addScore: (id, delta) =>
        set((s) => ({
          teams: s.teams.map((t) =>
            t.id === id ? { ...t, score: t.score + delta } : t,
          ),
        })),
      resetScores: () =>
        set((s) => ({ teams: s.teams.map((t) => ({ ...t, score: 0 })) })),
    }),
    { name: "scoreboard" },
  ),
);
