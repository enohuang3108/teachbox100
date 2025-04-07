import { Howl } from "howler";
import { useCallback, useEffect } from "react";

// 初始化音效
const correctSound = new Howl({
  src: ["/sounds/correct.mp3"],
  volume: 0.5,
});

const wrongSound = new Howl({
  src: ["/sounds/wrong.mp3"],
  volume: 0.5,
});

export const useSound = () => {
  // 在組件卸載時停止所有音效
  useEffect(() => {
    return () => {
      correctSound.stop();
      wrongSound.stop();
    };
  }, []);

  const playCorrectSound = useCallback(() => {
    correctSound.play();
  }, []);

  const playWrongSound = useCallback(() => {
    wrongSound.play();
  }, []);

  return {
    playCorrectSound,
    playWrongSound,
  };
};
