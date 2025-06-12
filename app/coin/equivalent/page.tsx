"use client";

import CoinComponent from "@/components/atoms/Coin"; // Renamed to avoid conflict with type
import GameAnswerSection from "@/components/molecules/GameAnswerSection";
import CoinGameSettingPanel from "@/components/organisms/CoinGameSettingPanel";
import { GamePageTemplate } from "@/components/templates/GamePageTemplate";
import { AVAILABLE_COINS } from "@/lib/constants/game";
import type { Coin as CoinType } from "@/lib/types/types"; // Import Coin type
import { getRandomFeedback } from "@/lib/utils/gameFeedback";
import { useCallback, useMemo, useState } from "react";

// 工具：洗牌
function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 工具：產生一個指定範圍的目標硬幣
function getRandomTargetCoin(gameCoins: CoinType[], currentMaxAmount: number): CoinType {
  const targetDenominations = [5, 10, 50, 100];
  const possibleTargets = gameCoins.filter(
    (coin) => targetDenominations.includes(coin.value) && coin.value <= currentMaxAmount
  );

  if (possibleTargets.length > 0) {
    return possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
  }

  // Fallback: if no 5,10,50,100 are available/valid, pick any from gameCoins <= currentMaxAmount
  const fallbackCandidates = gameCoins.filter(coin => coin.value <= currentMaxAmount);
  if (fallbackCandidates.length > 0) {
    return fallbackCandidates[Math.floor(Math.random() * fallbackCandidates.length)];
  }
  // Super fallback: if gameCoins is empty or all are > maxAmount.
  return AVAILABLE_COINS.find(c => c.value === 5) || AVAILABLE_COINS[0] || { value: 5, name: "5元" };
}

export default function CoinEquivalentPage() {
  // 設定區
  const initialMaxAmount = 100;
  const initialEnabledCoinValues = [1, 5, 10, 50];

  const [enabledCoins, setEnabledCoins] = useState(initialEnabledCoinValues);
  const [maxAmount, setMaxAmount] = useState(initialMaxAmount);
  const [isOrdered, setIsOrdered] = useState(true);

  // 依設定過濾可用硬幣 (for game play and initial target generation)
  const gameCoins = useMemo(() => {
    let coins = AVAILABLE_COINS.filter(c => enabledCoins.includes(c.value));
    if (!isOrdered) coins = shuffle(coins);
    else coins = coins.sort((a, b) => a.value - b.value);
    return coins;
  }, [enabledCoins, isOrdered]);

  // 遊戲狀態
  const [target, setTarget] = useState<CoinType>(() => getRandomTargetCoin(gameCoins, maxAmount));
  const [selectedCoins, setSelectedCoins] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // 重新出題 - target 也要依最新的 gameCoins, maxAmount 更新
  useCallback(() => {
    setTarget(getRandomTargetCoin(gameCoins, maxAmount));
    setSelectedCoins([]);
    setShowFeedback(false);
    setIsCorrect(null);
  }, [gameCoins, maxAmount]);

  // 選硬幣
  const handleCoinClick = (coin: CoinType) => {
    setSelectedCoins((prev) => [...prev, coin.value]);
  };
  // 移除已選硬幣
  const handleRemoveCoin = (value: number, idx: number) => {
    setSelectedCoins((prev) => {
      const arr = prev.slice();
      arr.splice(idx, 1);
      return arr;
    });
  };

  // 檢查答案
  const checkAnswer = () => {
    const sum = selectedCoins.reduce((a, b) => a + b, 0);
    if (sum === target.value) { // Corrected: target.value
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    setShowFeedback(true);
  };
  // resetGame function to be passed to GamePageTemplate
  const resetGame = useCallback(() => {
    setTarget(getRandomTargetCoin(gameCoins, maxAmount));
    setSelectedCoins([]);
    setShowFeedback(false);
    setIsCorrect(null);
  }, [gameCoins, maxAmount]);

  // 設定區元件
  const settingSection = (
    <CoinGameSettingPanel
      answerMethod={"coin-equivalent"} // Not really used for settings but part of props
      enabledCoins={enabledCoins}
      isOrdered={isOrdered}
      maxAmount={maxAmount}
      setAnswerMethod={() => {}} // Not used for this game mode
      setEnabledCoins={setEnabledCoins}
      setIsOrdered={setIsOrdered}
      setMaxAmount={setMaxAmount}
    />
  );

  // 回饋訊息
  const currentAmount = selectedCoins.reduce((a, b) => a + b, 0);

  return (
    <GamePageTemplate
      page="coin-equivalent"
      resetGame={resetGame} // Pass the memoized resetGame
      settings={settingSection}
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
