"use client";

import { pages } from "@/app/pages.config";
import ThreeDCoin from "@/components/atoms/3DCoin";
import Coin from "@/components/atoms/Coin";
import { PageTemplate } from "@/components/templates/PageTemplate";
import { useState } from "react";

// 定義要介紹的面額
const denominations = [1, 5, 10, 50, 100, 200, 500, 1000, 2000];

export default function CoinIntroductionPage() {
  const [selectedCoin, setSelectedCoin] = useState<number | null>(null);

  // 處理硬幣卡片點擊
  const handleCoinClick = (coinValue: number) => {
    setSelectedCoin(coinValue);
  };

  // 關閉放大顯示的硬幣
  const handleCloseModal = () => {
    setSelectedCoin(null);
  };

  return (
    <PageTemplate title={pages["coin-introduction"].title}>
      <div className="flex flex-col items-center gap-8 p-4">
        <h2 className="text-2xl font-bold">認識新臺幣</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {denominations.map((item) => (
            <div
              key={item}
              className="flex size-42 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border bg-white p-4 shadow-md transition-shadow hover:shadow-lg"
              onClick={() => handleCoinClick(item)}
            >
              <Coin coinValue={item} />
              <span className="text-lg font-semibold">{item} 元</span>
            </div>
          ))}
        </div>

        {selectedCoin !== null && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={handleCloseModal}
          >
            <div
              className="scale-150 transform rounded-lg bg-white p-10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <ThreeDCoin coinValue={selectedCoin} scale={3} />
              <div className="mt-4 text-center text-xl font-bold">
                {selectedCoin} 元
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTemplate>
  );
}
