"use client";

import { Scoreboard } from "@/components/scoreboard/Scoreboard";
import { ScoreboardSettings } from "@/components/scoreboard/ScoreboardSettings";
import { GamePageTemplate } from "@/components/templates/GamePageTemplate";
import { useScoreboardStore } from "@/lib/scoreboard/store";
import { clearOrder } from "@/lib/scoreboard/buzz";

export default function ScoreboardPage() {
  const resetScores = useScoreboardStore((s) => s.resetScores);

  return (
    <GamePageTemplate
      page="scoreboard"
      settings={[<ScoreboardSettings key="settings" />]}
      resetGame={() => {
        resetScores();
        clearOrder();
      }}
      tips={
        <div className="text-ink-soft flex flex-col gap-2 text-left text-base leading-[1.75]">
          <p>
            點卡片上的 ＋ － 加減分，一次加幾分在計分板上方選（1、2、5、10）。
          </p>
          <p>組名在右上角的設定裡改，貼上名單一行一個，最多 40 組。</p>
          <p>目前最高分的組別邊框會變黃色，並列第一會一起亮。</p>
          <p>右上角的重新開始把所有分數歸零，全螢幕可以投影給全班看。</p>
          <p>
            設定裡可以開「連線搶答」，學生掃 QR
            用手機加入，畫面上只有一顆搶答鈕；按鈴順序會顯示在計分板上方。
          </p>
        </div>
      }
    >
      <Scoreboard />
    </GamePageTemplate>
  );
}
