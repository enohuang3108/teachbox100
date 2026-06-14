import { Howl } from "howler";
import { useCallback, useEffect } from "react";
import { useAudioStore } from "@/lib/monopoly/audio";

// 音檔版本：更換同名音檔後 bump 此值，強制瀏覽器重新抓取（避免吃到舊快取）
const V = "2";
const url = (name: string) => `/sounds/${name}.mp3?v=${V}`;

// 各音效的基準音量（實際播放時再乘上使用者設定的音效音量）
const correctSound = new Howl({ src: [url("correct")], volume: 0.5 });
const wrongSound = new Howl({ src: [url("wrong")], volume: 0.5 });
const diceSound = new Howl({ src: [url("dice")], volume: 0.6 });
const moneySound = new Howl({ src: [url("money")], volume: 0.5 });
const jailSound = new Howl({ src: [url("jail")], volume: 0.5 });

const BASE_VOLUME = {
  correct: 0.5,
  wrong: 0.5,
  dice: 0.6,
  money: 0.5,
  jail: 0.5,
} as const;

export const useSound = () => {
  const sfxVolume = useAudioStore((s) => s.sfxVolume);

  // 在組件卸載時停止所有音效
  useEffect(() => {
    return () => {
      correctSound.stop();
      wrongSound.stop();
      diceSound.stop();
      moneySound.stop();
      jailSound.stop();
    };
  }, []);

  const playCorrectSound = useCallback(() => {
    correctSound.volume(BASE_VOLUME.correct * sfxVolume);
    correctSound.play();
  }, [sfxVolume]);

  const playWrongSound = useCallback(() => {
    wrongSound.volume(BASE_VOLUME.wrong * sfxVolume);
    wrongSound.play();
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

  return {
    playCorrectSound,
    playWrongSound,
    playDiceSound,
    playMoneySound,
    playJailSound,
  };
};
