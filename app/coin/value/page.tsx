"use client";

import { AnswerMethod } from "@/components/molecules/setting/AnswerMethod";
import { AvailableCoins } from "@/components/molecules/setting/AvailableCoins";
import { CoinsOrder } from "@/components/molecules/setting/CoinsOrder";
import { MoneyRange, useMoneyRange } from "@/components/molecules/setting/MoneyRange";
import CoinDisplayArea from "@/components/molecules/CoinDisplayArea";
import GameAnswerSection from "@/components/organisms/CoinGameAnswerSection";
import { GamePageTemplate } from "@/components/templates/GamePageTemplate";
import { AVAILABLE_COINS } from "@/lib/constants/game";
import type { Coin as CoinType } from "@/lib/types/types";
import { useEffect, useState } from "react";

interface GameSettings {
  minCoins: number;
  maxCoins: number;
  choiceRange: number;
}

// 遊戲設定
const GAME_SETTINGS: GameSettings = {
  minCoins: 3,
  maxCoins: 20,
  choiceRange: 300,
};

// 生成隨機硬幣
const generateRandomCoins = (
  enabledCoinValues: number[],
  isOrdered: boolean,
  minAmount: number,
  maxAmount: number,
): CoinType[] => {
  // 1. 準備可用的硬幣集合
  const availableCoins = AVAILABLE_COINS.filter((coin) =>
    enabledCoinValues.includes(coin.value),
  );

  // 如果沒有啟用的硬幣，直接返回空陣列
  if (availableCoins.length === 0) return [];

  // 2. 嘗試產生落在金錢區間內的題目。
  //    由於硬幣面額是離散值，設定過窄時不一定每次都能剛好湊到下限，
  //    所以重試幾次後回傳最接近且不超過上限的結果。
  let fallback: CoinType[] = [];
  for (let attempt = 0; attempt < 50; attempt++) {
    const result: CoinType[] = [];
    let totalAmount = 0;
    let coinCount = 0;

    const getEligibleCoin = (): CoinType | null => {
      const eligibleCoins = availableCoins.filter(
        (coin) => totalAmount + coin.value <= maxAmount,
      );
      if (eligibleCoins.length === 0) return null;

      return eligibleCoins[Math.floor(Math.random() * eligibleCoins.length)];
    };

    for (let i = 0; i < GAME_SETTINGS.minCoins; i++) {
      const eligibleCoin = getEligibleCoin();
      if (!eligibleCoin) break;

      result.push(eligibleCoin);
      totalAmount += eligibleCoin.value;
      coinCount++;
    }

    const targetAmount =
      minAmount + Math.floor(Math.random() * (maxAmount - minAmount + 1));
    while (totalAmount < targetAmount && coinCount < GAME_SETTINGS.maxCoins) {
      if (coinCount >= GAME_SETTINGS.minCoins && Math.random() < 0.15) break;

      const eligibleCoin = getEligibleCoin();
      if (!eligibleCoin) break;

      result.push(eligibleCoin);
      totalAmount += eligibleCoin.value;
      coinCount++;
    }

    if (isOrdered) result.sort((a, b) => a.value - b.value);
    if (totalAmount >= minAmount) return result;
    if (totalAmount > calculateTotal(fallback)) fallback = result;
  }

  return fallback;
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
  const [isGeneratingNewCoins, setIsGeneratingNewCoins] = useState(false);
  const [coinsKey, setCoinsKey] = useState(Date.now()); // 用於強制重新渲染硬幣動畫
  const { minAmount, maxAmount, setMoneyRange } = useMoneyRange();

  // 重置遊戲的核心邏輯
  const setupNewQuestion = (
    amountRange = { minAmount, maxAmount },
  ) => {
    setIsGeneratingNewCoins(true);
    
    // 使用 React 的狀態批次更新機制來優化渲染
    const newCoins = generateRandomCoins(
      enabledCoins,
      isOrdered,
      amountRange.minAmount,
      amountRange.maxAmount,
    );
    const newTotal = calculateTotal(newCoins);
    
    // 批次更新所有相關狀態
    setCoins(newCoins);
    setTotalValue(newTotal);
    setUserAnswer("");
    setChoices(generateChoices(newTotal));
    setIsCorrect(null);
    setCoinsKey(Date.now()); // 更新 key 以觸發動畫重新渲染
    setIsGeneratingNewCoins(false);
  };

  // 初始化和重置遊戲
  const resetGame = () => {
    setupNewQuestion();
    setShowFeedback(false);
  };

  // 當硬幣啟用狀態變更時重置遊戲
  useEffect(() => {
    resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabledCoins]);

  // 當硬幣排序設定變更時重置遊戲
  useEffect(() => {
    resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOrdered]);

  // 初始化遊戲
  useEffect(() => {
    resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setupNewQuestion(); // 立即重置題目狀態，讓 CSS 動畫處理視覺效果
  };

  const handleMoneyRangeCommit = (amountRange: {
    minAmount: number;
    maxAmount: number;
  }) => {
    setShowFeedback(false);
    setupNewQuestion(amountRange);
  };

  const settings = [
    <AvailableCoins key="availableCoins" enabledCoins={enabledCoins} setEnabledCoins={setEnabledCoins}/>,
    <MoneyRange
      key="moneyRange"
      minAmount={minAmount}
      maxAmount={maxAmount}
      onChange={setMoneyRange}
      onCommit={handleMoneyRangeCommit}
    />,
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
      <CoinDisplayArea
        coins={coins}
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        isGeneratingNewCoins={isGeneratingNewCoins}
        animationKey={coinsKey}
      />

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
