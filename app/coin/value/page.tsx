"use client";

import { AnswerMethod } from "@/components/molecules/setting/AnswerMethod";
import { AvailableCoins } from "@/components/molecules/setting/AvailableCoins";
import { CoinsOrder } from "@/components/molecules/setting/CoinsOrder";
import { MoneyRange, useMoneyRange } from "@/components/molecules/setting/MoneyRange";
import CoinDisplayArea from "@/components/molecules/CoinDisplayArea";
import GameAnswerSection from "@/components/organisms/CoinGameAnswerSection";
import { GamePageTemplate } from "@/components/templates/GamePageTemplate";
import {
  generateChoices,
  generateRandomCoins,
  sumValues,
} from "@/lib/coin/game";
import { useEffect, useState } from "react";

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
    const newTotal = sumValues(newCoins);
    
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
