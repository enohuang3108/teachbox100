"use client";

import dynamic from "next/dynamic";

// 遊戲本體（three.js、howler、棋盤圖）不進介紹頁的 bundle；進設定時由 preloadMonopoly 先抓
const MonopolyGame = dynamic(
  () => import("@/components/monopoly/MonopolyGame"),
  {
    ssr: false,
  },
);

export default function MonopolyPage() {
  return <MonopolyGame />;
}
