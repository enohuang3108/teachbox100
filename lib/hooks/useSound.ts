import { Howl } from "howler";
import { useCallback, useEffect } from "react";
import { createUISFX } from "uisfx";
import { useAudioStore } from "@/lib/monopoly/audio";

// 答對／答錯改用 uisfx 合成音（minimal pack），不再抓 mp3。
// createUISFX 有 typeof window 守衛、AudioContext 延遲建立，模組層級建立在 SSR 下安全。
const ui = createUISFX({ pack: "minimal", volume: 1 });

// 音檔版本：更換同名音檔後 bump 此值，強制瀏覽器重新抓取（避免吃到舊快取）
const V = "2";
const url = (name: string) => `/sounds/${name}.mp3?v=${V}`;

// 各音效的基準音量（實際播放時再乘上使用者設定的音效音量）
const diceSound = new Howl({ src: [url("dice")], volume: 0.6 });
const moneySound = new Howl({ src: [url("money")], volume: 0.5 });
const jailSound = new Howl({ src: [url("jail")], volume: 0.5 });

const BASE_VOLUME = {
  dice: 0.6,
  money: 0.5,
  jail: 0.5,
} as const;

export const useSound = () => {
  const sfxVolume = useAudioStore((s) => s.sfxVolume);

  // 在組件卸載時停止所有音效
  useEffect(() => {
    return () => {
      ui.stopAll();
      diceSound.stop();
      moneySound.stop();
      jailSound.stop();
    };
  }, []);

  // uisfx 的 play() 會自行 resume 被暫停的 AudioContext，呼叫點都在點擊事件內即可
  const playCorrectSound = useCallback(() => {
    ui.play("success", { volume: sfxVolume });
  }, [sfxVolume]);

  const playWrongSound = useCallback(() => {
    ui.play("stop", { volume: sfxVolume });
  }, [sfxVolume]);

  const playDiceSound = useCallback(() => {
    diceSound.volume(BASE_VOLUME.dice * sfxVolume);
    diceSound.play();
  }, [sfxVolume]);

  // 金錢增加／減少共用同一音效
  const playMoneySound = useCallback(() => {
    moneySound.volume(BASE_VOLUME.money * sfxVolume);
    moneySound.play();
  }, [sfxVolume]);

  // 被抓進監獄的警笛音效
  const playJailSound = useCallback(() => {
    jailSound.volume(BASE_VOLUME.jail * sfxVolume);
    jailSound.play();
  }, [sfxVolume]);

  /** 轉盤轉動中的迴圈音，回傳 handle 讓呼叫端在結果出來時 stop() */
  const playSpinLoop = useCallback(
    () => ui.play("loading", { volume: sfxVolume }),
    [sfxVolume],
  );

  const playBonusSound = useCallback(() => {
    ui.play("bonus", { volume: sfxVolume });
  }, [sfxVolume]);

  return {
    playCorrectSound,
    playWrongSound,
    playSpinLoop,
    playBonusSound,
    playDiceSound,
    playMoneySound,
    playJailSound,
  };
};
