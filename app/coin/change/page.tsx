"use client";

import AmountDisplay from "@/components/atoms/AmountDisplay";
import Coin from "@/components/atoms/Coin";
import GameAnswerSection from "@/components/molecules/GameAnswerSection";
import SelectedCoinsList, { type SelectedCoin } from "@/components/molecules/SelectedCoinsList";
import { useMaxAmount } from "@/components/molecules/setting/MaxAmount";
import { GamePageTemplate } from "@/components/templates/GamePageTemplate";
import { AVAILABLE_COINS } from "@/lib/constants/game";
import { createChangeQuestion } from "@/lib/coin/game";
import type { Coin as CoinType } from "@/lib/types/types";
import { getRandomFeedback } from "@/lib/utils/gameFeedback";
import { useCallback, useEffect, useState } from "react";

const GAME_COINS = AVAILABLE_COINS.filter((coin) =>
  [1, 5, 10, 50, 100].includes(coin.value),
);

export default function CoinChangePage() {
  const [targetPrice, setTargetPrice] = useState<number | null>(null);
  const [paidAmount, setPaidAmount] = useState<number | null>(null);
  const [changeAmount, setChangeAmount] = useState<number | null>(null); // 應找金額
  const [currentSelectedChange, setCurrentSelectedChange] = useState(0); // 當前選擇的找零金額
  const [selectedCoins, setSelectedCoins] = useState<SelectedCoin[]>([]);
  const [hasAnswer, setHasAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const { maxAmount, MaxAmountComponent } = useMaxAmount();

  const checkAnswer = useCallback(() => {
    if (currentSelectedChange === changeAmount) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    setShowFeedback(true);
  }, [currentSelectedChange, changeAmount]);

  const setupNewQuestion = () => {
    const { price, paid, change } = createChangeQuestion(maxAmount);

    setTargetPrice(price);
    setPaidAmount(paid);
    setChangeAmount(change);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCoinClick = useCallback(
    (coin: CoinType) => {
      const newAmount = currentSelectedChange + coin.value;
      const newSelectedCoin: SelectedCoin = { ...coin, id: Date.now() + Math.random() };

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

  const settings = [
    <MaxAmountComponent key="maxAmount" />
  ];

  return (
    <GamePageTemplate
      page="coin-change"
      resetGame={resetGame}
      settings={settings}
    >
      <div className="mb-4 grid grid-cols-2 gap-4">
        <AmountDisplay
          label="已付金額"
          amount={paidAmount}
          amountColor="text-yellow-400"
        />
        <AmountDisplay
          label="售價"
          amount={targetPrice}
          amountColor="text-green-400"
        />
      </div>

      <GameAnswerSection
        question={"請挑出要找給客人的錢"}
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
              已選找零硬幣：
            </h2>
            <SelectedCoinsList
              selectedCoins={selectedCoins}
              onRemoveCoin={handleRemoveCoin}
            />
          </div>

          {/* 選擇硬幣區 */}
          <div className="mb-4">
            <h2 className="mb-2 text-center text-lg font-semibold">
              選擇找零硬幣：
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
