"use client";

import { GAME_SETTINGS } from "@/app/coin/value/page";
import { AVAILABLE_COINS } from "@/lib/constants/game";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import Coin from "../atoms/Coin";
import { RadioGroup, RadioGroupItem } from "../atoms/shadcn/radio-group";

interface CoinGameSettingPanelProps {
  answerMethod: string;
  enabledCoins: number[];
  isOrdered: boolean;
  maxAmount: number;
  setAnswerMethod: (method: string) => void;
  setEnabledCoins: (enabledCoins: number[]) => void;
  setIsOrdered: (isOrdered: boolean) => void;
  setMaxAmount: (maxAmount: number) => void;
}

export default function CoinGameSettingPanel({
  answerMethod,
  enabledCoins,
  isOrdered,
  maxAmount,
  setAnswerMethod,
  setEnabledCoins,
  setIsOrdered,
  setMaxAmount,
}: CoinGameSettingPanelProps) {
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

  const colorSchemes = {
    digit: {
      label: "數字調整",
      bg: "group-has-[span[data-state=checked]]:bg-blue-100 hover:bg-blue-50",
      border: "group-has-[span[data-state=checked]]:border-blue-400",
    },
    multiple: {
      label: "選擇題",
      bg: "group-has-[span[data-state=checked]]:bg-purple-100 hover:bg-purple-50",
      border: "group-has-[span[data-state=checked]]:border-purple-400",
    },
    keypad: {
      label: "手動輸入",
      bg: "group-has-[span[data-state=checked]]:bg-gray-100 hover:bg-gray-50",
      border: "group-has-[span[data-state=checked]]:border-gray-400",
    },
  };

  const orderSchemes = {
    ordered: {
      label: "按順序排列（由小到大）",
      bg: "group-has-[span[data-state=checked]]:bg-gray-100 hover:bg-gray-50",
      border: "group-has-[span[data-state=checked]]:border-gray-400",
    },
    random: {
      label: "隨機排列",
      bg: "group-has-[span[data-state=checked]]:bg-orange-100 hover:bg-orange-50",
      border: "group-has-[span[data-state=checked]]:border-orange-400",
    },
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
              <Coin
                key={coin.value}
                coinValue={coin.value}
                size={60}
                className="cursor-pointer"
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
        <RadioGroup
          value={answerMethod}
          onValueChange={setAnswerMethod}
          className="space-y-2"
        >
          {Object.entries(colorSchemes).map(([value, scheme]) => (
            <label key={value} className="group">
              <div
                className={cn(
                  "flex w-full cursor-pointer items-center space-x-2 rounded-full border p-2 transition-colors",
                  scheme.bg,
                  scheme.border,
                )}
              >
                <RadioGroupItem value={value} id={`answer-${value}`} />
                <span className="text-sm font-medium">{scheme.label}</span>
              </div>
            </label>
          ))}
        </RadioGroup>
      </div>

      {/* 硬幣排序選項 */}
      <div className="space-y-2">
        <h3 className="mb-2 text-sm font-medium text-gray-700">硬幣排列</h3>
        <RadioGroup
          value={isOrdered ? "ordered" : "random"}
          onValueChange={(value) => setIsOrdered(value === "ordered")}
          className="space-y-2"
        >
          {Object.entries(orderSchemes).map(([value, scheme]) => (
            <label key={value} className="group">
              <div
                className={cn(
                  `flex w-full cursor-pointer items-center space-x-2 rounded-full border p-2 transition-colors`,
                  scheme.bg,
                  scheme.border,
                )}
              >
                <RadioGroupItem value={value} id={`order-${value}`} />
                <span className="text-sm font-medium">{scheme.label}</span>
              </div>
            </label>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
