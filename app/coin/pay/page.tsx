"use client";

import { pages } from "@/app/pages.config";
import Coin from "@/components/atoms/Coin";
import GameAnswerSection from "@/components/molecules/GameAnswerSection";
import { GamePageTemplate } from "@/components/templates/GamePageTemplate";
import { AVAILABLE_COINS } from "@/lib/constants/game";
import type { Coin as CoinType } from "@/lib/types/types";
import { dseg7 } from "@/public/fonts/fonts";
import { useCallback, useEffect, useState } from "react";

interface SelectedCoin extends CoinType {
  id: number;
}

const GAME_COINS = AVAILABLE_COINS.filter((coin) =>
  [1, 5, 10, 50].includes(coin.value)
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
    [currentAmount] // 移除 showFeedback 依賴
  );

  // 新增移除硬幣的處理函數
  const handleRemoveCoin = useCallback((coinToRemove: SelectedCoin) => {
    setCurrentAmount((prev) => prev - coinToRemove.value);
    setSelectedCoins((prev) =>
      prev.filter((coin) => coin.id !== coinToRemove.id)
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
      <div className="flex flex-col bg-black justify-center items-center w-full h-32 rounded-md">
        <div className="text-4xl flex items-end space-x-2 text-green-400 drop-shadow-[0_0_5px_#00ff00]">
          <span className="text-3xl font-medium">$</span>
          <span className={`${dseg7.className} text-5xl`}>
            {targetAmount !== null ? targetAmount : "--"}
          </span>
        </div>
      </div>
      <GameAnswerSection
        question="請挑選正確的金額來付款"
        hasAnswer={hasAnswer}
        isCorrect={isCorrect}
        correctFeedback="付款成功！"
        incorrectFeedback={`差一點！目標是 ${targetAmount} 元`}
        showFeedback={showFeedback}
        checkAnswer={checkAnswer}
        handleNextQuestion={resetGame}
      >
        <div>
          <div className="mb-6 border p-4 rounded-md min-h-[80px] w-full bg-gray-100 flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-2 self-start">已選硬幣:</h2>
            <div className="flex flex-wrap gap-2 justify-center min-h-[40px]">
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
                <p className="text-gray-500 self-center">尚未選擇任何硬幣</p>
              )}
            </div>
          </div>

          {/* 選擇硬幣區 */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2 text-center">
              選擇硬幣:
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {GAME_COINS.map((coin) => {
                const size = coin.value === 50 ? 70 : 60; // 50元稍大
                return (
                  <button
                    key={coin.value}
                    onClick={() => handleCoinClick(coin)}
                    className={`relative transition-transform hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
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
