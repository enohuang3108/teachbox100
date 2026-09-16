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
      "bg-card shadow-lg transition-colors duration-normal",
      showFeedback && isCorrect === true && "bg-success-soft ring-2 ring-success/30",
      showFeedback && isCorrect === false && "bg-danger-soft ring-2 ring-danger/30"
    )}>
      <div
        className={`
          mx-auto flex min-h-[140px] flex-wrap items-center justify-center
          gap-3 p-6 transition-[opacity,transform] duration-slow ease-in-out
          md:min-h-[180px] md:gap-5 md:p-8
          ${showFeedback ? 'opacity-90 scale-[0.98]' : 'opacity-100 scale-100'}
        `}
      >
        {isGeneratingNewCoins || coins.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-muted-foreground py-12 animate-in fade-in duration-200">
            <div className="flex space-x-1 mb-4">
              <div className="w-4 h-4 rounded-full bg-stone animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-4 h-4 rounded-full bg-stone animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-4 h-4 rounded-full bg-stone animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <p className="text-sm font-medium">{isGeneratingNewCoins ? '準備硬幣中…' : '沒有硬幣可顯示'}</p>
            {!isGeneratingNewCoins && <p className="text-xs text-muted-foreground mt-1">請檢查遊戲設定</p>}
          </div>
        ) : (
          coins.map((coin, index) => (
            <div
              key={`${coin.value}-${index}-${animationKey || 0}`}
              className={cn(
                "transition-transform duration-hover ease-out relative group",
                "hover:z-(--z-base) hover:-translate-y-[3px]",
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
                className="drop-shadow-md group-hover:drop-shadow-xl transition-[filter] duration-hover"
              />
            </div>
          ))
        )}
      </div>
    </SimpleCard>
  );
}