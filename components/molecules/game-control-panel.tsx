"use client";

import { AVAILABLE_COINS } from "@/lib/constants/game";

interface GameControlPanelProps {
  answerMethod: string;
  enabledCoins: number[];
  isOrdered: boolean;
  setAnswerMethod: (method: string) => void;
  setEnabledCoins: (enabledCoins: number[]) => void;
  setIsOrdered: (isOrdered: boolean) => void;
  resetGame: () => void;
}

export default function GameControlPanel({
  answerMethod,
  enabledCoins,
  isOrdered,
  setAnswerMethod,
  setEnabledCoins,
  setIsOrdered,
  resetGame,
}: GameControlPanelProps) {
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

  return (
    <div className="space-y-4">
      {/* 硬幣選擇 */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 mb-2">可用硬幣</h3>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_COINS.map((coin) => (
            <div
              key={coin.value}
              onClick={() => toggleCoin(coin.value)}
              className={`flex items-center justify-center p-2 rounded-full cursor-pointer transition-all ${
                enabledCoins.includes(coin.value)
                  ? "border-2 border-amber-400 bg-amber-100 text-amber-800"
                  : "border border-gray-300 bg-gray-100 text-gray-600"
              }`}
              style={{ width: "60px", height: "60px" }}
            >
              <div className="text-center">
                <div className="font-bold">{coin.value}</div>
                <div className="text-xs">{coin.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* 答案方式選擇 */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 mb-2">回答方式</h3>
        <div
          className={`flex items-center space-x-2 border rounded-full p-2 cursor-pointer transition-colors ${
            answerMethod === "multiple"
              ? "border-purple-400 bg-purple-100 text-purple-800"
              : "border-gray-300 hover:bg-gray-100 text-gray-700"
          }`}
          onClick={() => setAnswerMethod("multiple")}
        >
          <div
            className={`w-4 h-4 rounded-full border-2 ${
              answerMethod === "multiple"
                ? "border-purple-400 bg-purple-400"
                : "border-gray-400"
            }`}
          />
          <span className="text-sm font-medium">選擇題</span>
        </div>
        <div
          className={`flex items-center space-x-2 border rounded-full p-2 cursor-pointer transition-colors ${
            answerMethod === "keypad"
              ? "border-gray-400 bg-gray-100 text-gray-800"
              : "border-gray-300 hover:bg-gray-100 text-gray-700"
          }`}
          onClick={() => setAnswerMethod("keypad")}
        >
          <div
            className={`w-4 h-4 rounded-full border-2 ${
              answerMethod === "keypad"
                ? "border-gray-500 bg-gray-500"
                : "border-gray-400"
            }`}
          />
          <span className="text-sm font-medium">手動輸入</span>
        </div>
        <div
          className={`flex items-center space-x-2 border rounded-full p-2 cursor-pointer transition-colors ${
            answerMethod === "digit"
              ? "border-blue-400 bg-blue-100 text-blue-800"
              : "border-gray-300 hover:bg-gray-100 text-gray-700"
          }`}
          onClick={() => setAnswerMethod("digit")}
        >
          <div
            className={`w-4 h-4 rounded-full border-2 ${
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
        <h3 className="text-sm font-medium text-gray-700 mb-2">硬幣排列</h3>
        <div
          className={`flex items-center space-x-2 border rounded-full p-2 cursor-pointer transition-colors ${
            isOrdered
              ? "border-green-400 bg-green-100 text-green-800"
              : "border-gray-300 hover:bg-gray-100 text-gray-700"
          }`}
          onClick={() => setIsOrdered(true)}
        >
          <div
            className={`w-4 h-4 rounded-full border-2 ${
              isOrdered ? "border-green-400 bg-green-400" : "border-gray-400"
            }`}
          />
          <span className="text-sm font-medium">按順序排列（由小到大）</span>
        </div>
        <div
          className={`flex items-center space-x-2 border rounded-full p-2 cursor-pointer transition-colors ${
            !isOrdered
              ? "border-orange-400 bg-orange-100 text-orange-800"
              : "border-gray-300 hover:bg-gray-100 text-gray-700"
          }`}
          onClick={() => setIsOrdered(false)}
        >
          <div
            className={`w-4 h-4 rounded-full border-2 ${
              !isOrdered ? "border-orange-400 bg-orange-400" : "border-gray-400"
            }`}
          />
          <span className="text-sm font-medium">隨機排列</span>
        </div>
      </div>
    </div>
  );
}
