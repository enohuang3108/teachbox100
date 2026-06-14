"use client";

import { Howl } from "howler";
import { useEffect } from "react";
import { useAudioStore } from "@/lib/monopoly/audio";
import type { GamePhase } from "@/lib/monopoly/types";

// 遊玩中的背景音樂與最後結算畫面音樂，皆循環播放、共用背景音樂音量。
const bgm = new Howl({ src: ["/sounds/bgm.mp3"], loop: true, volume: 0.3 });
const gameover = new Howl({
  src: ["/sounds/gameover.mp3"],
  loop: true,
  volume: 0.3,
});

export function BgmController({ phase }: { phase: GamePhase }) {
  const bgmVolume = useAudioStore((s) => s.bgmVolume);

  // 音量設定變動時即時套用到兩首曲子
  useEffect(() => {
    bgm.volume(bgmVolume);
    gameover.volume(bgmVolume);
  }, [bgmVolume]);

  // 依階段切換曲目：遊玩 → bgm；結算 → gameover。離開時全部停止。
  useEffect(() => {
    if (phase === "gameover") {
      bgm.stop();
      if (!gameover.playing()) gameover.play();
    } else {
      gameover.stop();
      if (!bgm.playing()) bgm.play();
    }
    return () => {
      bgm.stop();
      gameover.stop();
    };
  }, [phase]);

  return null;
}
