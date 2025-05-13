"use client";

import { pages } from "@/app/pages.config";
import AmountDisplay from "@/components/atoms/AmountDisplay";
import Coin from "@/components/atoms/Coin";
import GameAnswerSection from "@/components/molecules/GameAnswerSection";
import { GamePageTemplate } from "@/components/templates/GamePageTemplate";
import { AVAILABLE_COINS } from "@/lib/constants/game";
import type { Coin as CoinType } from "@/lib/types/types";
import { getRandomFeedback } from "@/lib/utils/gameFeedback";
import { useCallback, useEffect, useState } from "react";

interface SelectedCoin extends CoinType {
  id: number;
}

const GAME_COINS = AVAILABLE_COINS.filter((coin) =>
  [1, 5, 10, 50].includes(coin.value),
);

// 假設的目標金額
export default function SelectCoinsPage() {
  const [targetAmount, setTargetAmount] = useState<number | null>(null);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [selectedCoins, setSelectedCoins] = useState<SelectedCoin[]>([]);
  const [hasAnswer, setHasAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const checkAnswer = useCallback(() => {
    if (currentAmount === targetAmount) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    setShowFeedback(true);
  }, [currentAmount]);

  const setupNewQuestion = () => {
    setTargetAmount(Math.floor(Math.random() * 100) + 1);
    setCurrentAmount(0);
    setSelectedCoins([]);
    setIsCorrect(null);
    setShowFeedback(false);
    setHasAnswer(false);
  };

  const resetGame = () => {
    setupNewQuestion();
  };

  useEffect(() => {
    resetGame();
  }, []);

  const handleCoinClick = useCallback(
    (coin: CoinType) => {
      const newAmount = currentAmount + coin.value;
      // 為添加的硬幣創建唯一 ID
      const newSelectedCoin: SelectedCoin = { ...coin, id: Date.now() };

      setSelectedCoins((prev) => [...prev, newSelectedCoin]); // 儲存 SelectedCoin 物件
      setCurrentAmount(newAmount);
      // setHasAnswer(true); // 由 useEffect 處理
    },
    [currentAmount], // 移除 showFeedback 依賴
  );

  // 新增移除硬幣的處理函數
  const handleRemoveCoin = useCallback((coinToRemove: SelectedCoin) => {
    setCurrentAmount((prev) => prev - coinToRemove.value);
    setSelectedCoins((prev) =>
      prev.filter((coin) => coin.id !== coinToRemove.id),
    );
  }, []);

  // 偵測 currentAmount 變化來更新 hasAnswer
  useEffect(() => {
    setHasAnswer(selectedCoins.length > 0);
  }, [selectedCoins]);

  const settingSection = (
    // <GameControlPanel
    //   answerMethod={answerMethod}
    //   enabledCoins={enabledCoins}
    //   isOrdered={isOrdered}
    //   maxAmount={maxAmount}
    // />
    <></>
  );

  return (
    <GamePageTemplate
      title={pages["coin-pay"].title}
      resetGame={resetGame}
      settings={settingSection}
    >
      <AmountDisplay
        label="售價"
        amount={targetAmount}
        amountColor="text-green-400"
      />
      <GameAnswerSection
        question="請挑選正確的金額來付款"
        hasAnswer={hasAnswer}
        isCorrect={isCorrect}
        correctFeedback={getRandomFeedback("correctpay")}
        incorrectFeedback={
          targetAmount
            ? currentAmount > targetAmount
              ? getRandomFeedback("overpay", currentAmount - targetAmount)
              : getRandomFeedback("underpay", targetAmount - currentAmount)
            : ""
        }
        showFeedback={showFeedback}
        checkAnswer={checkAnswer}
        handleNextQuestion={resetGame}
      >
        <div>
          <div className="mb-6 flex min-h-[80px] w-full flex-col items-center rounded-md border bg-gray-100 p-4">
            <h2 className="mb-2 self-start text-lg font-semibold">已選硬幣:</h2>
            <div className="flex min-h-[40px] flex-wrap justify-center gap-2">
              {selectedCoins.length > 0 ? (
                selectedCoins.map((coin) => (
                  <button
                    key={coin.id}
                    onClick={() => handleRemoveCoin(coin)}
                    className="transition-transform hover:scale-110 active:scale-95"
                    aria-label={`移除 ${coin.name}`}
                  >
                    <Coin coinValue={coin.value} />
                  </button>
                ))
              ) : (
                <p className="self-center text-gray-500">尚未選擇任何硬幣</p>
              )}
            </div>
          </div>

          {/* 選擇硬幣區 */}
          <div className="mb-4">
            <h2 className="mb-2 text-center text-lg font-semibold">
              選擇硬幣:
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {GAME_COINS.map((coin) => {
                return (
                  <button
                    key={coin.value}
                    onClick={() => handleCoinClick(coin)}
                    className={"relative cursor-pointer transition-transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"}
                    aria-label={`選擇 ${coin.name}`}
                  >
                    <Coin coinValue={coin.value} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </GameAnswerSection>
    </GamePageTemplate>
  );
}
