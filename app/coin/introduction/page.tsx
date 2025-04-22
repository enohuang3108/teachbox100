"use client";

import { pages } from "@/app/pages.config";
import ThreeDCoin from "@/components/atoms/3DCoin";
import Coin from "@/components/atoms/Coin";
import { Button } from "@/components/atoms/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/shadcn/dialog";
import { PageTemplate } from "@/components/templates/PageTemplate";
import { useState } from "react";

// 定義要介紹的面額
const denominations = [1, 5, 10, 50, 100, 200, 500, 1000, 2000];

// 獲取硬幣對應關係
const getCoinEquivalents = (value: number) => {
  if (value <= 1) return [];

  const equivalents = [];

  if (value >= 5) {
    equivalents.push({
      value: 1,
      count: value,
      description: `1 元 × ${value}`,
    });
  }

  if (value % 5 === 0 && value >= 10) {
    equivalents.push({
      value: 5,
      count: value / 5,
      description: `5 元 × ${value / 5}`,
    });
  }

  if (value % 10 === 0 && value >= 20) {
    equivalents.push({
      value: 10,
      count: value / 10,
      description: `10 元 × ${value / 10}`,
    });
  }

  if (value % 50 === 0 && value >= 100) {
    equivalents.push({
      value: 50,
      count: value / 50,
      description: `50 元 × ${value / 50}`,
    });
  }

  return equivalents;
};

export default function CoinIntroductionPage() {
  const [coinSideMap, setCoinSideMap] = useState<Record<number, boolean>>({});

  // 處理硬幣正反面切換
  const handleCoinSideToggle = (coinValue: number, showFront: boolean) => {
    setCoinSideMap((prev) => ({
      ...prev,
      [coinValue]: showFront,
    }));
  };

  // 獲取指定硬幣的正反面狀態
  const getCoinSide = (coinValue: number) => {
    return coinSideMap[coinValue] !== false; // 預設為正面（true）
  };

  return (
    <PageTemplate title={pages["coin-introduction"].title}>
      <div className="flex flex-col items-center gap-8 p-4">
        <h2 className="text-2xl font-bold">認識新臺幣</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {denominations.map((item) => (
            <Dialog key={item}>
              <DialogTrigger asChild>
                <div className="flex size-42 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border bg-white p-4 shadow-md transition-shadow hover:shadow-lg">
                  <Coin coinValue={item} />
                  <span className="text-lg font-semibold">{item} 元</span>
                </div>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-[900px]">
                <DialogTitle className="sr-only">
                  {item} 元 硬幣介紹
                </DialogTitle>
                <div className="flex h-full flex-col md:flex-row">
                  {/* 左側硬幣展示區 */}
                  <div className="flex flex-1 items-center justify-center bg-white p-8">
                    <div className="w-full max-w-[300px]">
                      <div className="relative flex aspect-square w-full items-center justify-center">
                        {getCoinSide(item) ? (
                          <ThreeDCoin coinValue={item} front={true} scale={3} />
                        ) : (
                          <ThreeDCoin
                            coinValue={item}
                            front={false}
                            scale={3}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 右側資訊區 */}
                  <div className="flex flex-1 flex-col overflow-y-auto bg-gray-50 p-8">
                    {/* 正反面切換按鈕 */}
                    <div className="mb-8">
                      <h3 className="mb-4 text-xl font-bold">
                        新台幣 {item} 元
                      </h3>
                      <div className="flex gap-4">
                        <Button
                          onClick={() => handleCoinSideToggle(item, true)}
                          variant={getCoinSide(item) ? "default" : "outline"}
                        >
                          正面
                        </Button>
                        <Button
                          onClick={() => handleCoinSideToggle(item, false)}
                          variant={!getCoinSide(item) ? "default" : "outline"}
                        >
                          背面
                        </Button>
                      </div>
                    </div>

                    {/* 硬幣等值換算展示 */}
                    <div>
                      <h3 className="mb-4 text-lg font-semibold">等值硬幣：</h3>
                      {getCoinEquivalents(item).length > 0 ? (
                        <div className="space-y-4">
                          {getCoinEquivalents(item).map((equivalent, index) => (
                            <div
                              key={index}
                              className="flex items-center rounded-lg bg-white p-4 shadow"
                            >
                              <div className="mr-4 h-14 w-14 flex-shrink-0">
                                <Coin coinValue={equivalent.value} size={50} />
                              </div>
                              <div className="text-lg font-medium">
                                {equivalent.description}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>沒有等值的硬幣</p>
                      )}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </PageTemplate>
  );
}
