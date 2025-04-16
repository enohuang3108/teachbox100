"use client";

import { GAME_SETTINGS } from "@/app/coin/value/page";
import { AVAILABLE_COINS } from "@/lib/constants/game";
import Image from "next/image";
import { useEffect, useState } from "react";

interface GameControlPanelProps {
  answerMethod: string;
  enabledCoins: number[];
  isOrdered: boolean;
  maxAmount: number;
  setAnswerMethod: (method: string) => void;
  setEnabledCoins: (enabledCoins: number[]) => void;
  setIsOrdered: (isOrdered: boolean) => void;
  setMaxAmount: (maxAmount: number) => void;
}

export default function GameControlPanel({
  answerMethod,
  enabledCoins,
  isOrdered,
  maxAmount,
  setAnswerMethod,
  setEnabledCoins,
  setIsOrdered,
  setMaxAmount,
}: GameControlPanelProps) {
  const [sliderValue, setSliderValue] = useState(maxAmount);
  // 計算最大金額上限 (基於GAME_SETTINGS.maxCoins和可用硬幣的最大值)
  const maxPossibleAmount = GAME_SETTINGS.maxPossibleAmount;

  useEffect(() => {
    setSliderValue(maxAmount);
  }, [maxAmount]);

  // 處理硬幣切換的函數
  const toggleCoin = (coinValue: number) => {
    if (enabledCoins.includes(coinValue)) {
      // 如果至少還有另一個硬幣啟用，才可以禁用當前硬幣
      if (enabledCoins.length > 1) {
        setEnabledCoins(enabledCoins.filter((value) => value !== coinValue));
      }
    } else {
      setEnabledCoins([...enabledCoins, coinValue]);
    }
  };

  // 處理滑桿變更的函數
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setSliderValue(newValue);
  };

  // 當滑桿釋放時更新 maxAmount
  const handleSliderChangeComplete = () => {
    setMaxAmount(sliderValue);
  };

  return (
    <div className="space-y-4">
      {/* 硬幣選擇 */}
      <div className="space-y-2">
        <h3 className="mb-©2 text-sm font-medium text-gray-700">可用硬幣</h3>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_COINS.map((coin) => (
            <button
              key={coin.value}
              onClick={() => toggleCoin(coin.value)}
              className={`flex h-[70px] w-[70px] flex-col items-center justify-center p-0 transition-all ${
                !enabledCoins.includes(coin.value) && "opacity-50 grayscale"
              }`}
            >
              <Image
                src={`/images/coins/${coin.value}.webp`}
                alt={`${coin.value}元硬幣`}
                width={60}
                height={60}
                className={`object-contain`}
              />
              {coin.value}
            </button>
          ))}
        </div>
      </div>

      {/* 最大金錢上限滑桿 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">最大金錢上限</h3>
          <span className="rounded-full bg-blue-100 px-2 py-1 text-sm font-medium text-blue-600">
            {sliderValue} 元
          </span>
        </div>
        <div className="relative pt-1">
          <input
            type="range"
            min="10"
            max={maxPossibleAmount}
            step="10"
            value={sliderValue}
            onChange={handleSliderChange}
            onMouseUp={handleSliderChangeComplete}
            onTouchEnd={handleSliderChangeComplete}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-500"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>10 元</span>
            <span>{maxPossibleAmount} 元</span>
          </div>
        </div>
      </div>

      {/* 答案方式選擇 */}
      <div className="space-y-2">
        <h3 className="mb-2 text-sm font-medium text-gray-700">回答方式</h3>
        <div
          className={`flex cursor-pointer items-center space-x-2 rounded-full border p-2 transition-colors ${
            answerMethod === "multiple"
              ? "border-purple-400 bg-purple-100 text-purple-800"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setAnswerMethod("multiple")}
        >
          <div
            className={`h-4 w-4 rounded-full border-2 ${
              answerMethod === "multiple"
                ? "border-purple-400 bg-purple-400"
                : "border-gray-400"
            }`}
          />
          <span className="text-sm font-medium">選擇題</span>
        </div>
        <div
          className={`flex cursor-pointer items-center space-x-2 rounded-full border p-2 transition-colors ${
            answerMethod === "keypad"
              ? "border-gray-400 bg-gray-100 text-gray-800"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setAnswerMethod("keypad")}
        >
          <div
            className={`h-4 w-4 rounded-full border-2 ${
              answerMethod === "keypad"
                ? "border-gray-500 bg-gray-500"
                : "border-gray-400"
            }`}
          />
          <span className="text-sm font-medium">手動輸入</span>
        </div>
        <div
          className={`flex cursor-pointer items-center space-x-2 rounded-full border p-2 transition-colors ${
            answerMethod === "digit"
              ? "border-blue-400 bg-blue-100 text-blue-800"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setAnswerMethod("digit")}
        >
          <div
            className={`h-4 w-4 rounded-full border-2 ${
              answerMethod === "digit"
                ? "border-blue-400 bg-blue-400"
                : "border-gray-400"
            }`}
          />
          <span className="text-sm font-medium">數字調整</span>
        </div>
      </div>

      {/* 硬幣排序選項 */}
      <div className="space-y-2">
        <h3 className="mb-2 text-sm font-medium text-gray-700">硬幣排列</h3>
        <div
          className={`flex cursor-pointer items-center space-x-2 rounded-full border p-2 transition-colors ${
            isOrdered
              ? "border-green-400 bg-green-100 text-green-800"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setIsOrdered(true)}
        >
          <div
            className={`h-4 w-4 rounded-full border-2 ${
              isOrdered ? "border-green-400 bg-green-400" : "border-gray-400"
            }`}
          />
          <span className="text-sm font-medium">按順序排列（由小到大）</span>
        </div>
        <div
          className={`flex cursor-pointer items-center space-x-2 rounded-full border p-2 transition-colors ${
            !isOrdered
              ? "border-orange-400 bg-orange-100 text-orange-800"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => setIsOrdered(false)}
        >
          <div
            className={`h-4 w-4 rounded-full border-2 ${
              !isOrdered ? "border-orange-400 bg-orange-400" : "border-gray-400"
            }`}
          />
          <span className="text-sm font-medium">隨機排列</span>
        </div>
      </div>
    </div>
  );
}
