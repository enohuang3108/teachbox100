"use client";

import { pages } from "@/app/pages.config";
import { SimpleCard } from "@/components/atoms/SimpleCard";
import GameAnswerSection from "@/components/molecules/GameAnswerSection"; // 導入 GameAnswerSection
import { GamePageTemplate } from "@/components/templates/GamePageTemplate";
import { AVAILABLE_COINS } from "@/lib/constants/game"; // 引入共用硬幣定義
import { Coin } from "@/lib/types/types"; // 導入 Coin 型別
import Image from "next/image"; // 引入 Image
import { useCallback, useEffect, useState } from "react";

// 從 AVAILABLE_COINS 取得此遊戲使用的面額 (可以之後調整)
const GAME_COINS = AVAILABLE_COINS.filter((coin) =>
  [1, 5, 10, 50].includes(coin.value)
);

// 假設的目標金額
export default function SelectCoinsPage() {
  const [targetAmount, setTargetAmount] = useState<number | null>(null);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [selectedCoins, setSelectedCoins] = useState<Coin[]>([]);
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
    (coin: Coin) => {
      const newAmount = currentAmount + coin.value;

      setSelectedCoins((prev) => [...prev, coin]); // 儲存 Coin 物件
      setCurrentAmount(newAmount);
      setHasAnswer(true); // 已選取硬幣，可以提交答案
    },
    [currentAmount, showFeedback] // 依賴 showFeedback
  );

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
      <SimpleCard className="mb-8">
        <div className="mb-4 text-xl text-center">
          目標金額：
          <span className="font-bold text-blue-600">{targetAmount}</span> 元
        </div>
        <div className="text-xl text-center">
          目前金額：
          <span className="font-bold text-green-600">{currentAmount}</span>元
        </div>
      </SimpleCard>

      <GameAnswerSection
        question="請挑選符合目標金額的硬幣"
        hasAnswer={hasAnswer}
        isCorrect={isCorrect}
        correctFeedback="成功！"
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
                selectedCoins.map((coin, index) => (
                  <Image
                    key={`${coin.value}-${index}`} // 加上 index 避免 key 重複
                    src={`/coins/${coin.value}.webp`}
                    alt={`${coin.name} 硬幣`}
                    width={30} // 較小尺寸
                    height={30}
                    className="object-contain"
                  />
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
                    <Image
                      src={`/coins/${coin.value}.webp`}
                      alt={`${coin.name} 硬幣`}
                      width={size}
                      height={size}
                      className={"object-contain transition-opacity"}
                    />
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
