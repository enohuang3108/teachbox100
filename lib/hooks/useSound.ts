import { Howl } from "howler";
import { useCallback, useEffect } from "react";
import { createUISFX } from "uisfx";
import { useAudioStore } from "@/lib/monopoly/audio";

// 答對／答錯改用 uisfx 合成音（minimal pack），不再抓 mp3。
// createUISFX 有 typeof window 守衛、AudioContext 延遲建立，模組層級建立在 SSR 下安全。
export const ui = createUISFX({ pack: "minimal", volume: 1 });

// 音檔版本：更換同名音檔後 bump 此值，強制瀏覽器重新抓取（避免吃到舊快取）
const V = "2";
const url = (name: string) => `/sounds/${name}.mp3?v=${V}`;

// 各音效的基準音量（實際播放時再乘上使用者設定的音效音量）
const BASE_VOLUME = {
  dice: 0.6,
  money: 0.5,
  jail: 0.5,
} as const;

// 只有大富翁用得到：第一次播才建立。模組層級 new Howl 會讓每個用 useSound 的頁面一載入就抓 mp3
const howls: Partial<Record<keyof typeof BASE_VOLUME, Howl>> = {};
const howl = (name: keyof typeof BASE_VOLUME) =>
  (howls[name] ??= new Howl({ src: [url(name)], volume: BASE_VOLUME[name] }));

export const useSound = () => {
  const sfxVolume = useAudioStore((s) => s.sfxVolume);

  // 在組件卸載時停止所有音效
  useEffect(() => {
    return () => {
      ui.stopAll();
      Object.values(howls).forEach((h) => h.stop());
    };
  }, []);

  // uisfx 的 play() 會自行 resume 被暫停的 AudioContext，呼叫點都在點擊事件內即可
  const playCorrectSound = useCallback(() => {
    ui.play("success", { volume: sfxVolume });
  }, [sfxVolume]);

  const playWrongSound = useCallback(() => {
    ui.play("stop", { volume: sfxVolume });
  }, [sfxVolume]);

  // 延後 0.4 秒：對上 3D 骰子拋起後落地翻滾的那一刻，按下當下就響會比畫面早
  const playDiceSound = useCallback(() => {
    // 按下當下就建立，這 0.4 秒剛好拿來抓檔；金錢、監獄在棋子走完後才響，順便先抓
    const dice = howl("dice");
    howl("money");
    howl("jail");
    window.setTimeout(() => {
      dice.volume(BASE_VOLUME.dice * sfxVolume);
      dice.play();
    }, 400);
  }, [sfxVolume]);

  // 金錢增加／減少共用同一音效
  const playMoneySound = useCallback(() => {
    const money = howl("money");
    money.volume(BASE_VOLUME.money * sfxVolume);
    money.play();
  }, [sfxVolume]);

  // 被抓進監獄的警笛音效
  const playJailSound = useCallback(() => {
    const jail = howl("jail");
    jail.volume(BASE_VOLUME.jail * sfxVolume);
    jail.play();
  }, [sfxVolume]);

  /** 轉盤轉動中的迴圈音，回傳 handle 讓呼叫端在結果出來時 stop() */
  const playSpinLoop = useCallback(
    () => ui.play("loading", { volume: sfxVolume }),
    [sfxVolume],
  );

  /** 計分板加分／減分：短促、可連按，不用慶祝感的 success */
  const playAddSound = useCallback(() => {
    ui.play("select", { volume: sfxVolume });
  }, [sfxVolume]);

  const playSubtractSound = useCallback(() => {
    ui.play("deselect", { volume: sfxVolume });
  }, [sfxVolume]);

  const playBonusSound = useCallback(() => {
    ui.play("bonus", { volume: sfxVolume });
  }, [sfxVolume]);

  /** 出題前倒數的每一拍（3、2、1） */
  const playCountdownTick = useCallback(() => {
    ui.play("progress-step", { volume: sfxVolume });
  }, [sfxVolume]);

  /** 倒數結束、題目出現 */
  const playGoSound = useCallback(() => {
    ui.play("start", { volume: sfxVolume });
  }, [sfxVolume]);

  /** 破解密碼：鎖打開，緊接一段完整的慶祝 */
  const playUnlockSound = useCallback(() => {
    ui.play("unlock", { volume: sfxVolume });
    window.setTimeout(() => ui.play("achievement", { volume: sfxVolume }), 120);
  }, [sfxVolume]);

  /** 一局分出勝負 */
  const playVictorySound = useCallback(() => {
    ui.play("achievement", { volume: sfxVolume });
  }, [sfxVolume]);

  return {
    playCorrectSound,
    playUnlockSound,
    playVictorySound,
    playWrongSound,
    playSpinLoop,
    playAddSound,
    playSubtractSound,
    playBonusSound,
    playCountdownTick,
    playGoSound,
    playDiceSound,
    playMoneySound,
    playJailSound,
  };
};
