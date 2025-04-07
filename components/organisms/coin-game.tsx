"use client";

import { SimpleCard } from "@/components/atoms/SimpleCard";
import CoinDisplay from "@/components/molecules/coin-display";
import DifficultySelector from "@/components/molecules/difficulty-selector";
import DigitInput from "@/components/molecules/digit-input";
import KeypadAnswer from "@/components/molecules/keypad-answer";
import MultipleChoiceAnswer from "@/components/molecules/multiple-choice-answer";
import { Button } from "@/components/ui/button";
import { AVAILABLE_COINS } from "@/lib/constants/game";
import { getRandomConfettiEffect } from "@/lib/helpers/confetti-effects";
import { useSound } from "@/lib/hooks/useSound";
import { Coin, DifficultyLevel } from "@/lib/types/types";
import { useEffect, useState } from "react";

interface GameSettings {
  minCoins: number;
  maxCoins: number;
  coinTypes: number[];
  choiceRange: number;
}

// 遊戲難度設定
const GAME_SETTINGS: Record<DifficultyLevel, GameSettings> = {
  easy: {
    minCoins: 2,
    maxCoins: 4,
    coinTypes: [0, 1, 2], // 索引對應AVAILABLE_COINS (1元, 5元, 10元)
    choiceRange: 10, // 選項誤差範圍
  },
  medium: {
    minCoins: 3,
    maxCoins: 6,
    coinTypes: [0, 1, 2, 3], // 所有硬幣類型
    choiceRange: 20,
  },
  hard: {
    minCoins: 4,
    maxCoins: 8,
    coinTypes: [0, 1, 2, 3], // 所有硬幣類型
    choiceRange: 30,
  },
};

// 生成隨機硬幣
const generateRandomCoins = (difficulty: DifficultyLevel): Coin[] => {
  const settings = GAME_SETTINGS[difficulty];
  const coins: Coin[] = [];
  const numCoins =
    Math.floor(Math.random() * (settings.maxCoins - settings.minCoins + 1)) +
    settings.minCoins;

  for (let i = 0; i < numCoins; i++) {
    // 從當前難度允許的硬幣類型中隨機選擇
    const typeIndex =
      settings.coinTypes[Math.floor(Math.random() * settings.coinTypes.length)];
    coins.push(AVAILABLE_COINS[typeIndex]);
  }

  return coins;
};

// 計算硬幣總值
const calculateTotal = (coins: Coin[]): number => {
  return coins.reduce((sum, coin) => sum + coin.value, 0);
};

// 生成多選項答案選項
const generateChoices = (
  correctAnswer: number,
  difficulty: DifficultyLevel
): number[] => {
  const choices = [correctAnswer];
  const range = GAME_SETTINGS[difficulty].choiceRange;

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
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("medium");
  const { playCorrectSound, playWrongSound } = useSound();

  // 重置遊戲的核心邏輯
  const setupNewQuestion = () => {
    const newCoins = generateRandomCoins(difficulty);
    const newTotal = calculateTotal(newCoins);
    setCoins(newCoins);
    setTotalValue(newTotal);
    setUserAnswer("");
    setChoices(generateChoices(newTotal, difficulty));
    setIsCorrect(null);
    // setShowFeedback(false); // 這行移到 handleNextQuestion 或 resetGame
  };

  // 初始化和重置遊戲 (用於難度變更或初始加載)
  const resetGame = () => {
    setupNewQuestion();
    setShowFeedback(false); // 確保初始狀態下回饋是隱藏的
  };

  // 當難度變更時重置遊戲
  useEffect(() => {
    resetGame();
  }, [difficulty]);

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

      {/* 控制面板 - 懸浮在右上角 */}
      <div className="fixed top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-gray-200">
        <div className="space-y-4">
          {/* 難度選擇器 */}
          <div>
            <DifficultySelector
              difficulty={difficulty}
              onChange={setDifficulty}
              onReset={resetGame}
            />
          </div>

          {/* 答案方式選擇 */}
          <div className="space-y-2">
            <div
              className={`flex items-center space-x-2 border rounded-full p-2 cursor-pointer transition-colors ${
                answerMethod === "multiple"
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setAnswerMethod("multiple")}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  answerMethod === "multiple"
                    ? "border-purple-500 bg-purple-500"
                    : "border-gray-500"
                }`}
              />
              <span className="text-sm font-medium">選擇題</span>
            </div>
            <div
              className={`flex items-center space-x-2 border rounded-full p-2 cursor-pointer transition-colors ${
                answerMethod === "keypad"
                  ? "border-gray-500 bg-gray-50"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setAnswerMethod("keypad")}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  answerMethod === "keypad"
                    ? "border-gray-500 bg-gray-500"
                    : "border-gray-500"
                }`}
              />
              <span className="text-sm font-medium">手動輸入</span>
            </div>
            <div
              className={`flex items-center space-x-2 border rounded-full p-2 cursor-pointer transition-colors ${
                answerMethod === "digit"
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
              onClick={() => setAnswerMethod("digit")}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  answerMethod === "digit"
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-500"
                }`}
              />
              <span className="text-sm font-medium">數字調整</span>
            </div>
          </div>
        </div>
      </div>
      {/* 硬幣顯示區域 */}
      <SimpleCard>
        <CoinDisplay coins={coins} />
      </SimpleCard>

      {/* 答案區域 */}
      <div className="mt-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          硬幣總共有多少元?
        </h2>

        {/* 根據選擇的答案方式顯示不同的輸入方式 */}
        <div className="mt-4">
          {answerMethod === "multiple" ? (
            <MultipleChoiceAnswer
              choices={choices}
              selectedValue={userAnswer}
              onSelect={setUserAnswer}
            />
          ) : answerMethod === "keypad" ? (
            <KeypadAnswer value={userAnswer} onChange={setUserAnswer} />
          ) : (
            <DigitInput value={userAnswer} onChange={setUserAnswer} />
          )}
        </div>

        {/* 提交按鈕 */}
        <div className="mt-6 md:mt-8">
          <Button
            onClick={checkAnswer}
            className="w-full bg-black hover:bg-gray-800 text-white text-xl md:text-2xl py-5 md:py-6 rounded-full"
            disabled={!userAnswer || showFeedback}
          >
            確定
          </Button>
        </div>

        {/* 回饋訊息 */}
        <div
          className={`absolute inset-0 bg-white/95 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center transition-opacity duration-300 ${
            showFeedback ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div
            className={`text-center ${
              isCorrect === null
                ? ""
                : isCorrect
                ? "text-green-700"
                : "text-red-700"
            }`}
          >
            <p className="text-2xl md:text-3xl font-bold mb-4">
              {isCorrect === null
                ? "" // 不顯示文字直到狀態確定
                : isCorrect
                ? `正確！總共是 ${totalValue} 元。`
                : `不正確，再試一次！正確答案是 ${totalValue} 元。`}
            </p>
            <Button
              onClick={handleNextQuestion} // 更新 onClick
              className="mt-4 bg-black hover:bg-gray-800 text-white text-lg py-4 px-8 rounded-full"
            >
              下一題
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
