"use client";

import CoinComponent from "@/components/atoms/Coin";
import GameAnswerSection from "@/components/molecules/GameAnswerSection";
import { AvailableCoins } from "@/components/molecules/setting/AvailableCoins";
import { GamePageTemplate } from "@/components/templates/GamePageTemplate";
import { AVAILABLE_COINS } from "@/lib/constants/game";
import type { Coin as CoinType } from "@/lib/types/types";
import { getRandomFeedback } from "@/lib/utils/gameFeedback";
import { useCallback, useEffect, useMemo, useState } from "react";

function getRandomTargetCoin(gameCoins: CoinType[]): CoinType {
  return gameCoins[Math.floor(Math.random() * gameCoins.length)];
}

export default function CoinEquivalentPage() {
  const initialEnabledCoinValues = [1, 5, 10, 50];

  const [enabledCoins, setEnabledCoins] = useState(initialEnabledCoinValues);

  const gameCoins = useMemo(() => {
    let coins = AVAILABLE_COINS.filter(c => enabledCoins.includes(c.value));
    return coins;
  }, [enabledCoins]);

  const [target, setTarget] = useState<CoinType>(gameCoins[0]);
  const [selectedCoins, setSelectedCoins] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    setTarget(getRandomTargetCoin(gameCoins));
  }, [gameCoins]);

  const handleCoinClick = (coin: CoinType) => {
    setSelectedCoins((prev) => [...prev, coin.value]);
  };

  const handleRemoveCoin = (value: number, idx: number) => {
    setSelectedCoins((prev) => {
      const arr = prev.slice();
      arr.splice(idx, 1);
      return arr;
    });
  };

  const checkAnswer = () => {
    const sum = selectedCoins.reduce((a, b) => a + b, 0);
    if (sum === target.value) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    setShowFeedback(true);
  };

  const resetGame = useCallback(() => {
    setTarget(getRandomTargetCoin(gameCoins));
    setSelectedCoins([]);
    setShowFeedback(false);
    setIsCorrect(null);
  }, [gameCoins]);

  const settings = [
    <AvailableCoins key="availableCoins" enabledCoins={enabledCoins} setEnabledCoins={setEnabledCoins}/>
  ]

  const currentAmount = selectedCoins.reduce((a, b) => a + b, 0);

  return (
    <GamePageTemplate
      page="coin-equivalent"
      resetGame={resetGame}
      settings={settings}
    >
      <div className="mx-auto max-w-xl">
        <div className="mb-4 flex flex-col items-center">
          {/* 顯示目標硬幣 */}
          <div className="mb-2 flex min-h-[120px] items-center justify-center">
            {target && <CoinComponent coinValue={target.value} size={150} />} {/* Corrected */}
          </div>
        </div>
        <GameAnswerSection
          question="請挑選相同價值的硬幣或鈔票"
          hasAnswer={selectedCoins.length > 0}
          isCorrect={isCorrect}
          correctFeedback={getRandomFeedback("correctpay")}
          incorrectFeedback={
            target // Check if target itself is not null/undefined
              ? currentAmount > target.value // Corrected
                ? getRandomFeedback("overpay", currentAmount - target.value) // Corrected
                : getRandomFeedback("underpay", target.value - currentAmount) // Corrected
              : ""
          }
          showFeedback={showFeedback}
          checkAnswer={checkAnswer}
          handleNextQuestion={resetGame} // Pass the memoized resetGame
        >
          <div>
            {/* 已選硬幣區 */}
            <div className="mb-6 flex min-h-[80px] w-full flex-col items-center rounded-md border bg-gray-100 p-4">
              <h2 className="mb-2 self-start text-lg font-semibold">已選硬幣:</h2>
              <div className="flex min-h-[40px] flex-wrap justify-center gap-2">
                {selectedCoins.length > 0 ? (
                  selectedCoins.map((value, idx) => (
                    <button
                      key={idx + "-selected"}
                      onClick={() => handleRemoveCoin(value, idx)}
                      className="transition-transform hover:scale-110 active:scale-95"
                      aria-label={`移除 ${value}元`}
                    >
                      <CoinComponent coinValue={value} /> {/* Corrected */}
                    </button>
                  ))
                ) : (
                  <p className="self-center text-gray-500">尚未選擇</p>
                )}
              </div>
            </div>
            {/* 選擇硬幣區 */}
            <div className="mb-4">
              <h2 className="mb-2 text-center text-lg font-semibold">點選硬幣或鈔票:</h2>
              <div className="flex flex-wrap justify-center gap-4">
                {gameCoins.map((coin) => (
                  <button
                    key={coin.value}
                    onClick={() => handleCoinClick(coin)}
                    className={"relative cursor-pointer transition-transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"}
                    aria-label={`選擇 ${coin.name}`}
                  >
                    <CoinComponent coinValue={coin.value} /> {/* Corrected */}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </GameAnswerSection>
      </div>
    </GamePageTemplate>
  );
}
