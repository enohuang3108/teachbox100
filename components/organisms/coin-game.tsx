"use client";

import { RefreshCWIcon } from "@/components/atoms/ani-icons/refresh-cw";
import { SettingsGearIcon } from "@/components/atoms/ani-icons/settings-gear";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/atoms/shadcn/sheet";
import { SimpleCard } from "@/components/atoms/SimpleCard";
import CoinDisplay from "@/components/molecules/coin-display";
import GameAnswerSection from "@/components/molecules/game-answer-section";
import GameControlPanel from "@/components/molecules/game-control-panel";
import { AVAILABLE_COINS } from "@/lib/constants/game";
import { getRandomConfettiEffect } from "@/lib/helpers/confetti-effects";
import { useSound } from "@/lib/hooks/useSound";
import { Coin } from "@/lib/types/types";
import { useEffect, useState } from "react";
interface GameSettings {
  minCoins: number;
  maxCoins: number;
  coinTypes: number[];
  choiceRange: number;
}

// 遊戲設定
export const GAME_SETTINGS: GameSettings = {
  minCoins: 3,
  maxCoins: 15,
  coinTypes: [0, 1, 2, 3], // 所有硬幣類型
  choiceRange: 20,
};

// 生成隨機硬幣
const generateRandomCoins = (
  enabledCoinValues: number[],
  isOrdered: boolean,
  maxCoins: number
): Coin[] => {
  const coins: Coin[] = [];
  const numCoins =
    Math.floor(Math.random() * (maxCoins - GAME_SETTINGS.minCoins + 1)) +
    GAME_SETTINGS.minCoins;

  // 根據啟用的硬幣值過濾可用硬幣
  const availableCoins = AVAILABLE_COINS.filter((coin) =>
    enabledCoinValues.includes(coin.value)
  );

  // 確保至少有一種硬幣
  if (availableCoins.length === 0) return [];

  for (let i = 0; i < numCoins; i++) {
    // 從啟用的硬幣中隨機選擇
    const randomIndex = Math.floor(Math.random() * availableCoins.length);
    coins.push(availableCoins[randomIndex]);
  }

  // 如果需要排序，則按硬幣面值從小到大排序
  if (isOrdered) {
    coins.sort((a, b) => a.value - b.value);
  }

  return coins;
};

// 計算硬幣總值
const calculateTotal = (coins: Coin[]): number => {
  return coins.reduce((sum, coin) => sum + coin.value, 0);
};

// 生成多選項答案選項
const generateChoices = (correctAnswer: number): number[] => {
  const choices = [correctAnswer];
  const range = GAME_SETTINGS.choiceRange;

  // 生成3個不同的錯誤選項
  while (choices.length < 4) {
    // 生成一個在正確答案±range範圍內的隨機數
    const wrongAnswer =
      correctAnswer + (Math.floor(Math.random() * (range * 2 + 1)) - range);

    // 確保答案為正數且不重複
    if (wrongAnswer > 0 && !choices.includes(wrongAnswer)) {
      choices.push(wrongAnswer);
    }
  }

  // 打亂選項順序
  return choices.sort(() => Math.random() - 0.5);
};

export default function CoinGame() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [answerMethod, setAnswerMethod] = useState("multiple");
  const [userAnswer, setUserAnswer] = useState("");
  const [choices, setChoices] = useState<number[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  // 默認所有硬幣都啟用
  const [enabledCoins, setEnabledCoins] = useState<number[]>([1, 5, 10, 50]);
  // 硬幣排列順序，預設為隨機
  const [isOrdered, setIsOrdered] = useState<boolean>(true);
  // 最大硬幣數量
  const [maxCoins, setMaxCoins] = useState<number>(GAME_SETTINGS.maxCoins);
  const { playCorrectSound, playWrongSound } = useSound();

  // 重置遊戲的核心邏輯
  const setupNewQuestion = () => {
    const newCoins = generateRandomCoins(enabledCoins, isOrdered, maxCoins);
    const newTotal = calculateTotal(newCoins);
    setCoins(newCoins);
    setTotalValue(newTotal);
    setUserAnswer("");
    setChoices(generateChoices(newTotal));
    setIsCorrect(null);
  };

  // 初始化和重置遊戲
  const resetGame = () => {
    setupNewQuestion();
    setShowFeedback(false);
  };

  // 當硬幣啟用狀態變更時重置遊戲
  useEffect(() => {
    resetGame();
  }, [enabledCoins]);

  // 當硬幣排序設定或最大硬幣數量變更時重置遊戲
  useEffect(() => {
    resetGame();
  }, [isOrdered, maxCoins]);

  // 初始化遊戲
  useEffect(() => {
    resetGame();
  }, []);

  // 檢查答案
  const checkAnswer = () => {
    const userValueInt = Number.parseInt(userAnswer);
    const correct = userValueInt === totalValue;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      playCorrectSound();
      // 使用隨機撒花特效
      const randomEffect = getRandomConfettiEffect();
      randomEffect();
    } else {
      playWrongSound();
    }
  };

  // 處理點擊 "下一題"
  const handleNextQuestion = () => {
    setShowFeedback(false); // 立即開始淡出
    setTimeout(() => {
      setupNewQuestion(); // 延遲重置題目狀態
    }, 300); // 等待淡出動畫完成 (需與 CSS transition duration 匹配)
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2">
            計算硬幣
          </h1>
        </div>
      </div>

      <Sheet>
        <SheetTrigger>
          <SettingsGearIcon className="fixed top-16 right-4 w-10 h-10 hover:bg-transparent" />
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>設定</SheetTitle>
            <GameControlPanel
              answerMethod={answerMethod}
              enabledCoins={enabledCoins}
              isOrdered={isOrdered}
              maxCoins={maxCoins}
              setAnswerMethod={setAnswerMethod}
              setEnabledCoins={setEnabledCoins}
              setIsOrdered={setIsOrdered}
              setMaxCoins={setMaxCoins}
            />
          </SheetHeader>
        </SheetContent>
      </Sheet>

      {/* 重置按鈕 */}
      <RefreshCWIcon
        className="fixed top-4 right-4 w-10 h-10 hover:bg-transparent"
        onClick={resetGame}
      />

      {/* 硬幣顯示區域 */}
      <SimpleCard>
        <CoinDisplay coins={coins} />
      </SimpleCard>

      {/* 使用答案區域組件 */}
      <GameAnswerSection
        answerMethod={answerMethod}
        userAnswer={userAnswer}
        choices={choices}
        totalValue={totalValue}
        isCorrect={isCorrect}
        showFeedback={showFeedback}
        setUserAnswer={setUserAnswer}
        checkAnswer={checkAnswer}
        handleNextQuestion={handleNextQuestion}
      />
    </div>
  );
}
