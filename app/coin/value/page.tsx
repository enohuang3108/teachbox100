"use client";

import Coin from "@/components/atoms/Coin";
import { SimpleCard } from "@/components/atoms/SimpleCard";
import { AnswerMethod } from "@/components/molecules/setting/AnswerMethod";
import { AvailableCoins } from "@/components/molecules/setting/AvailableCoins";
import { CoinsOrder } from "@/components/molecules/setting/CoinsOrder";
import { MaxAmount } from "@/components/molecules/setting/MaxAmount";
import GameAnswerSection from "@/components/organisms/CoinGameAnswerSection";
import { GamePageTemplate } from "@/components/templates/GamePageTemplate";
import { AVAILABLE_COINS } from "@/lib/constants/game";
import type { Coin as CoinType } from "@/lib/types/types";
import { useEffect, useState } from "react";

interface GameSettings {
  minCoins: number;
  maxCoins: number;
  maxAmount?: number;
  maxPossibleAmount?: number;
  choiceRange: number;
}

// 遊戲設定
export const GAME_SETTINGS: GameSettings = {
  minCoins: 3,
  maxCoins: 20,
  maxPossibleAmount: 3000,
  choiceRange: 300,
};

// 生成隨機硬幣
const generateRandomCoins = (
  enabledCoinValues: number[],
  isOrdered: boolean,
  maxAmount: number,
): CoinType[] => {
  // 1. 準備可用的硬幣集合
  const availableCoins = AVAILABLE_COINS.filter((coin) =>
    enabledCoinValues.includes(coin.value),
  );

  // 如果沒有啟用的硬幣，直接返回空陣列
  if (availableCoins.length === 0) return [];

  // 2. 初始化結果和追蹤變數
  const result: CoinType[] = [];
  let totalAmount = 0;
  let coinCount = 0;

  // 3. 生成最小數量的硬幣
  generateMinimumCoins();

  // 4. 繼續添加硬幣直到達到條件
  addAdditionalCoins();

  // 5. 如果需要排序，則按面值排序
  if (isOrdered) {
    result.sort((a, b) => a.value - b.value);
  }

  return result;

  // 輔助函數: 生成最小數量的硬幣
  function generateMinimumCoins() {
    for (let i = 0; i < GAME_SETTINGS.minCoins; i++) {
      const eligibleCoin = getEligibleCoin();
      if (!eligibleCoin) break;

      result.push(eligibleCoin);
      totalAmount += eligibleCoin.value;
      coinCount++;
    }
  }

  // 輔助函數: 添加額外的硬幣直到達到條件
  function addAdditionalCoins() {
    // 隨機決定目標金額，為最大金額的50%到100%之間
    const targetPercentage = 50 + Math.floor(Math.random() * 51);
    const targetAmount = Math.floor((maxAmount * targetPercentage) / 100);

    // 有機率提前結束添加硬幣的過程
    while (totalAmount < targetAmount && coinCount < GAME_SETTINGS.maxCoins) {
      // 每次添加硬幣時有15%機率提前結束
      if (coinCount >= GAME_SETTINGS.minCoins && Math.random() < 0.15) {
        break;
      }

      const eligibleCoin = getEligibleCoin();
      if (!eligibleCoin) break;

      result.push(eligibleCoin);
      totalAmount += eligibleCoin.value;
      coinCount++;
    }
  }

  // 輔助函數: 獲取符合條件的隨機硬幣
  function getEligibleCoin(): CoinType | null {
    // 篩選出不會導致總額超過上限的硬幣
    const eligibleCoins = availableCoins.filter(
      (coin) => totalAmount + coin.value <= maxAmount,
    );

    // 如果沒有符合條件的硬幣，返回 null
    if (eligibleCoins.length === 0) return null;

    // 隨機選擇一個符合條件的硬幣
    const randomIndex = Math.floor(Math.random() * eligibleCoins.length);
    return eligibleCoins[randomIndex];
  }
};

// 計算硬幣總值
const calculateTotal = (coins: CoinType[]): number => {
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

export default function CoinGamePage() {
  const [coins, setCoins] = useState<CoinType[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [answerMethod, setAnswerMethod] = useState("digit");
  const [userAnswer, setUserAnswer] = useState("");
  const [choices, setChoices] = useState<number[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [enabledCoins, setEnabledCoins] = useState<number[]>([
    1, 5, 10, 50, 100, 500, 1000,
  ]);
  const [isOrdered, setIsOrdered] = useState<boolean>(true);
  const [maxAmount, setMaxAmount] = useState<number>(100);

  // 重置遊戲的核心邏輯
  const setupNewQuestion = () => {
    const newCoins = generateRandomCoins(enabledCoins, isOrdered, maxAmount);
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

  // 當硬幣排序設定或最大金錢上限變更時重置遊戲
  useEffect(() => {
    resetGame();
  }, [isOrdered, maxAmount]);

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
  };

  // 處理點擊 "下一題"
  const handleNextQuestion = () => {
    setShowFeedback(false); // 立即開始淡出
    setTimeout(() => {
      setupNewQuestion(); // 延遲重置題目狀態
    }, 300); // 等待淡出動畫完成 (需與 CSS transition duration 匹配)
  };

  const settings = [
    <AvailableCoins key="availableCoins" enabledCoins={enabledCoins} setEnabledCoins={setEnabledCoins}/>,
    <MaxAmount key="maxAmount" maxAmount={maxAmount} setMaxAmount={setMaxAmount}/>,
    <AnswerMethod key="answerMethod" answerMethod={answerMethod} setAnswerMethod={setAnswerMethod}/>,
    <CoinsOrder key="coinsOrder" isOrdered={isOrdered} setIsOrdered={setIsOrdered}/>
  ];

  return (
    <GamePageTemplate
      page="coin-value"
      resetGame={resetGame}
      settings={settings}
    >
      {/* 硬幣顯示區域 */}
      <SimpleCard>
        <div className="mx-auto flex min-h-[120px] flex-wrap items-center justify-center gap-2 p-4 md:min-h-[160px] md:gap-4">
          {coins.map((coin, index) => (
            <Coin key={index} coinValue={coin.value} />
          ))}
        </div>
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
    </GamePageTemplate>
  );
}
