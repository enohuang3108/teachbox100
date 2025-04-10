"use client";

import { RefreshCWIcon } from "@/components/atoms/ani-icons/refresh-cw";
import { SettingsGearIcon } from "@/components/atoms/ani-icons/settings-gear";
import { Background } from "@/components/atoms/Background";
import { SimpleCard } from "@/components/atoms/SimpleCard";
import GameAnswerSection from "@/components/molecules/GameAnswerSection"; // 導入 GameAnswerSection
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/molecules/sheet";
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

  return (
    // 調整為置中佈局，增加最大寬度限制
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <Background />
      <Sheet>
        <SheetTrigger>
          <SettingsGearIcon className="fixed top-16 right-4 w-10 h-10 hover:bg-transparent" />
        </SheetTrigger>
        <SheetContent>
          <SheetHeader className="text-left">
            <SheetTitle>設定</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>

      {/* 重置按鈕 */}
      <RefreshCWIcon
        className="fixed top-4 right-4 w-10 h-10 hover:bg-transparent"
        onClick={resetGame}
      />
      <div className="w-full max-w-4xl mx-auto">
        <div className="w-full">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8">
            挑選正確的錢幣
          </h1>

          <SimpleCard className="mb-8">
            <div className="mb-4 text-xl text-center">
              目標金額：
              <span className="font-bold text-blue-600">{targetAmount}</span> 元
            </div>
            <div className="text-xl text-center">
              目前金額：
              <span className="font-bold text-green-600">{currentAmount}</span>
              元
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
            handleNextQuestion={resetGame} // 傳入重置/下一題函數
          >
            {/* 將原本的選擇硬幣和已選硬幣區域放在 children */}
            <div>
              {/* 已選硬幣區 - 改為顯示小圖示 */}
              <div className="mb-6 border p-4 rounded-md min-h-[80px] w-full bg-gray-100 flex flex-col items-center">
                <h2 className="text-lg font-semibold mb-2 self-start">
                  已選硬幣:
                </h2>
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
                    <p className="text-gray-500 self-center">
                      尚未選擇任何硬幣
                    </p>
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
              {/* 移除獨立的重置按鈕，GameAnswerSection 內部會有按鈕 */}
              {/* {currentAmount > 0 && (
                <div className="text-center mt-4">
                  <Button
                    variant="destructive" // 使用 Shadcn Button 樣式
                    onClick={resetGame}
                    className="mt-4"
                  >
                    重置
                  </Button>
                </div>
              )} */}
            </div>
          </GameAnswerSection>
        </div>
      </div>

      {/* 成功畫面 - 模仿 GameAnswerSection 樣式 */}
      {/* <div
        className={`absolute inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center transition-opacity duration-500 z-10 ${
          isSuccess ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      > ... </div> */}
    </main>
  );
}
