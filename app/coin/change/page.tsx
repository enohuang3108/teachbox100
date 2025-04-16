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

// 找出最接近且大於等於目標金額的 50 或 100 的倍數
const findClosestPaidAmount = (amount: number): number => {
  if (amount <= 50) return 50;
  if (amount <= 100) return 100;
  // 這裡可以根據需要添加更多級距
  return Math.ceil(amount / 100) * 100; // 暫定超過 100 就用 100 的倍數
};

export default function CoinChangePage() {
  const [targetPrice, setTargetPrice] = useState<number | null>(null);
  const [paidAmount, setPaidAmount] = useState<number | null>(null);
  const [changeAmount, setChangeAmount] = useState<number | null>(null); // 應找金額
  const [currentSelectedChange, setCurrentSelectedChange] = useState(0); // 當前選擇的找零金額
  const [selectedCoins, setSelectedCoins] = useState<SelectedCoin[]>([]);
  const [hasAnswer, setHasAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const checkAnswer = useCallback(() => {
    if (currentSelectedChange === changeAmount) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    setShowFeedback(true);
  }, [currentSelectedChange, changeAmount]);

  const setupNewQuestion = () => {
    const newTargetPrice = Math.floor(Math.random() * 99) + 1; // 1 到 99
    const newPaidAmount = findClosestPaidAmount(newTargetPrice);
    const newChangeAmount = newPaidAmount - newTargetPrice;

    setTargetPrice(newTargetPrice);
    setPaidAmount(newPaidAmount);
    setChangeAmount(newChangeAmount);
    setCurrentSelectedChange(0);
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
      const newAmount = currentSelectedChange + coin.value;
      const newSelectedCoin: SelectedCoin = { ...coin, id: Date.now() };

      setSelectedCoins((prev) => [...prev, newSelectedCoin]);
      setCurrentSelectedChange(newAmount);
    },
    [currentSelectedChange],
  );

  const handleRemoveCoin = useCallback((coinToRemove: SelectedCoin) => {
    setCurrentSelectedChange((prev) => prev - coinToRemove.value);
    setSelectedCoins((prev) =>
      prev.filter((coin) => coin.id !== coinToRemove.id),
    );
  }, []);

  useEffect(() => {
    setHasAnswer(selectedCoins.length > 0);
  }, [selectedCoins]);

  const settingSection = <></>;

  return (
    <GamePageTemplate
      title={pages["coin-change"].title}
      resetGame={resetGame}
      settings={settingSection}
    >
      <div className="mb-4 grid grid-cols-2 gap-4">
        <AmountDisplay
          label="售價"
          amount={targetPrice}
          amountColor="text-green-400"
        />
        <AmountDisplay
          label="已付金額"
          amount={paidAmount}
          amountColor="text-yellow-400"
        />
      </div>

      <GameAnswerSection
        question={`請挑選應找零的金額`}
        hasAnswer={hasAnswer}
        isCorrect={isCorrect}
        correctFeedback={getRandomFeedback("correctchange")}
        incorrectFeedback={
          changeAmount
            ? currentSelectedChange > changeAmount
              ? getRandomFeedback(
                  "overchange",
                  currentSelectedChange - changeAmount,
                )
              : getRandomFeedback(
                  "underchange",
                  changeAmount - currentSelectedChange,
                )
            : ""
        }
        showFeedback={showFeedback}
        checkAnswer={checkAnswer}
        handleNextQuestion={resetGame}
      >
        <div>
          <div className="mb-6 flex min-h-[80px] w-full flex-col items-center rounded-md border bg-gray-100 p-4">
            <h2 className="mb-2 self-start text-lg font-semibold">
              已選找零硬幣:
            </h2>
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
              選擇找零硬幣:
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {GAME_COINS.map((coin) => {
                return (
                  <button
                    key={coin.value}
                    onClick={() => handleCoinClick(coin)}
                    className={`relative cursor-pointer transition-transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50`}
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
