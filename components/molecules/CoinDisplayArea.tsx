"use client";

import Coin from "@/components/atoms/Coin";
import { SimpleCard } from "@/components/atoms/SimpleCard";
import type { Coin as CoinType } from "@/lib/types/types";
import { cn } from "@/lib/utils";

interface CoinDisplayAreaProps {
  coins: CoinType[];
  showFeedback?: boolean;
  isCorrect?: boolean | null;
  isGeneratingNewCoins?: boolean;
  animationKey?: number;
}

export default function CoinDisplayArea({
  coins,
  showFeedback = false,
  isCorrect = null,
  isGeneratingNewCoins = false,
  animationKey
}: CoinDisplayAreaProps) {
  return (
    <SimpleCard className={cn(
      "bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg transition-all duration-300",
      showFeedback && isCorrect === true && "ring-2 ring-green-200 bg-gradient-to-br from-green-50 to-green-100",
      showFeedback && isCorrect === false && "ring-2 ring-red-200 bg-gradient-to-br from-red-50 to-red-100"
    )}>
      <div
        className={`
          mx-auto flex min-h-[140px] flex-wrap items-center justify-center
          gap-3 p-6 transition-all duration-500 ease-in-out
          md:min-h-[180px] md:gap-5 md:p-8
          ${showFeedback ? 'opacity-90 scale-[0.98]' : 'opacity-100 scale-100'}
        `}
      >
        {isGeneratingNewCoins || coins.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 py-12 animate-in fade-in duration-200">
            <div className="flex space-x-1 mb-4">
              <div className="w-4 h-4 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-4 h-4 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-4 h-4 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <p className="text-sm font-medium">{isGeneratingNewCoins ? '準備硬幣中...' : '沒有硬幣可顯示'}</p>
            {!isGeneratingNewCoins && <p className="text-xs text-slate-400 mt-1">請檢查遊戲設定</p>}
          </div>
        ) : (
          coins.map((coin, index) => (
            <div
              key={`${coin.value}-${index}-${animationKey || 0}`}
              className={cn(
                "transform transition-all duration-300 ease-out relative group",
                "hover:scale-110 hover:z-10 hover:-translate-y-1",
                "animate-in fade-in slide-in-from-bottom-4 fill-mode-both",
                showFeedback && "animate-pulse"
              )}
              style={{
                animationDelay: `${index * 100}ms`,
                animationDuration: '600ms'
              }}
            >
              <Coin
                coinValue={coin.value}
                className="drop-shadow-md group-hover:drop-shadow-xl transition-all duration-200"
              />
            </div>
          ))
        )}
      </div>
    </SimpleCard>
  );
}