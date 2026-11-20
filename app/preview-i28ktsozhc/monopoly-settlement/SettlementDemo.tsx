"use client";

import { Settlement } from "@/components/monopoly/Settlement";
import { BONUS_DEFAULT, BONUS_KEYS, DEFAULT_SETTINGS, PLAYER_COLORS, type GameState } from "@/lib/monopoly/types";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

const CHARACTERS = ["capybara", "quokka", "panda", "tiger", "deer", "elephant", "sheep", "chow-chow", "black-cat", "duck", "cockatiel", "hedgehog", "meerkat", "dinosaur", "penguin", "dolphin", "whale-shark", "jellyfish", "pufferfish", "blobfish"];
const NAMES = ["小明", "小華", "阿美", "大雄", "靜香", "胖虎", "小夫", "志明", "春嬌", "阿德", "佳佳", "宇軒", "品妍", "冠宇", "子晴", "柏翰", "語彤", "承恩", "詠晴", "睿哲"];

// 固定種子的假亂數：同樣人數每次結果一樣，方便反覆看同一段動畫
function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

function mockGame(count: number, bonuses: boolean): GameState {
  const rnd = seeded(count * 7 + 1);
  const int = (n: number) => Math.floor(rnd() * n);
  const players = Array.from({ length: count }, (_, i) => {
    const owned = Array.from({ length: int(4) }, (_, k) => 1 + ((i * 3 + k * 7) % 30));
    return {
      id: `p${i}`,
      name: NAMES[i],
      color: PLAYER_COLORS[(i * 3) % PLAYER_COLORS.length],
      character: CHARACTERS[i],
      difficulty: "normal" as const,
      money: 3000 + int(10) * 1000 + int(4) * 250,
      position: 0,
      ownedTiles: owned,
      houses: Object.fromEntries(owned.slice(0, 2).map((t) => [t, int(3)])),
      skipTurns: 0,
      bankrupt: false,
    };
  });
  return {
    phase: "gameover",
    settings: {
      ...DEFAULT_SETTINGS,
      playerCount: count,
      bonuses: bonuses ? Object.fromEntries(BONUS_KEYS.map((k) => [k, BONUS_DEFAULT[k]])) : undefined,
    },
    questions: [],
    players,
    currentPlayerIndex: 0,
    lastRoll: null,
    pendingAction: null,
    startedAt: 0,
    lapsByPlayer: {},
    stats: Object.fromEntries(
      players.map((p) => [p.id, { correct: int(8), jail: int(3), chance: int(4), fate: int(4) }]),
    ),
  };
}

export function SettlementDemo() {
  const [count, setCount] = useState(6);
  const [bonuses, setBonuses] = useState(true);
  const [run, setRun] = useState(0);
  const game = useMemo(() => mockGame(count, bonuses), [count, bonuses]);

  const chip = (on: boolean) =>
    cn(
      "rounded-full px-3 py-1 text-sm font-semibold transition-[background-color,color,transform] duration-hover ease-out active:scale-[0.97]",
      on ? "bg-ink text-paper" : "bg-muted text-ink-soft hover:text-ink",
    );

  return (
    <main className="min-h-screen bg-paper pt-20">
      {/* 往下讓出全站浮動的 logo 與頁首按鈕 */}
      <div className="mx-auto flex w-fit max-w-[calc(100vw-2rem)] flex-wrap items-center justify-center gap-2 rounded-3xl bg-card px-4 py-2 text-sm ring-1 ring-ink/[0.06]">
        <span className="font-bold text-ink">結算 demo</span>
        {[2, 3, 6, 12, 20].map((n) => (
          <button key={n} type="button" className={chip(n === count)} onClick={() => setCount(n)}>
            {n} 人
          </button>
        ))}
        <button type="button" className={chip(bonuses)} onClick={() => setBonuses((b) => !b)}>
          加分 {bonuses ? "開" : "關"}
        </button>
        <button type="button" className={chip(false)} onClick={() => setRun((r) => r + 1)}>
          從頭播
        </button>
      </div>
      <div className="flex justify-center p-2">
        <Settlement key={`${count}-${bonuses}-${run}`} game={game} onRestart={() => setRun((r) => r + 1)} />
      </div>
    </main>
  );
}
