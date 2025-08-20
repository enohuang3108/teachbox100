"use client";

import { pages } from "@/app/pages.config";
import ThreeDCoin from "@/components/atoms/3DCoin";
import Coin from "@/components/atoms/Coin";
import { Badge } from "@/components/atoms/shadcn/badge";
import { Button } from "@/components/atoms/shadcn/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/shadcn/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/atoms/shadcn/dialog";
import { Separator } from "@/components/atoms/shadcn/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/atoms/shadcn/tooltip";
import { PageTemplate } from "@/components/templates/PageTemplate";
import { useState } from "react";

// 定義要介紹的面額
const denominations = [1, 5, 10, 50, 100, 200, 500, 1000, 2000];


// 獲取硬幣正反面圖案說明
const getCoinDesigns = (value: number) => {
  const designs = {
    1: {
      front: "蔣公肖像",
      back: "壹圓字樣"
    },
    5: {
      front: "蔣公肖像",
      back: "伍圓字樣"
    },
    10: {
      front: "蔣公肖像",
      back: "拾圓字樣"
    },
    50: {
      front: "國父孫中山肖像",
      back: "圓形圖案內含「五十」及「50」字樣之隱藏圖案，其兩側各一束稻穗"
    },
    100: {
      front: "國父孫中山肖像",
      back: "中山樓"
    },
    200: {
      front: "蔣公肖像",
      back: "總統府建築"
    },
    500: {
      front: "台東南王國小少棒隊",
      back: "大霸尖山、梅花鹿"
    },
    1000: {
      front: "學生",
      back: "玉山、帝雉"
    },
    2000: {
      front: "碟型天線、中華衛星一號",
      back: "櫻花鉤吻鮭、南湖大山"
    }
  };
  return designs[value as keyof typeof designs] || { front: "未知圖案", back: "未知圖案" };
};

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
  const page = { ...pages["coin-introduction"], key: "coin-introduction" };

  return (
    <PageTemplate page={page}>
      <div className="container mx-auto flex flex-col items-center gap-8 p-4">
        {/* 頁面標題 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">新台幣硬幣介紹</h1>
          <p className="text-muted-foreground text-lg">
            點擊任一硬幣，深入了解其特色與等值換算
          </p>
        </div>

        {/* 硬幣網格 */}
        <TooltipProvider>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {denominations.map((item) => {
              return (
                <Dialog key={item}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <Card className="flex flex-col justify-center items-center group relative cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl">
                          <CardHeader className="pb-3">
                          </CardHeader>
                          <CardContent className="flex flex-col items-center gap-3">
                            <div className="relative">
                              <Coin coinValue={item} />
                              {/* 光暈效果 */}
                              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                            </div>
                            <div className="text-center">
                              <CardTitle className="text-xl">{item} 元</CardTitle>
                            </div>
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>點擊查看 {item} 元硬幣詳細資訊</p>
                    </TooltipContent>
                  </Tooltip>
                  <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-[1000px]">
                    <DialogTitle className="sr-only">
                      {item} 元 硬幣介紹
                    </DialogTitle>
                    <div className="flex h-full flex-col lg:flex-row">
                      {/* 左側硬幣展示區 */}
                      <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-background to-muted/20 p-8">
                        <Card className="flex flex-col w-full max-w-[350px] bg-card/80 backdrop-blur">
                          <CardHeader className="text-center">
                            <CardTitle className="text-2xl">新台幣 {item} 元</CardTitle>
                          </CardHeader>
                          <CardContent className="flex flex-col shrink items-center gap-6">
                            <div className="grow flex w-full max-w-[280px] items-center justify-center">
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

                            {/* 正反面切換按鈕 */}
                            <div className="flex gap-3">
                              <Button
                                onClick={() => handleCoinSideToggle(item, true)}
                                variant={getCoinSide(item) ? "default" : "outline"}
                                className="px-6"
                              >
                                正面
                              </Button>
                              <Button
                                onClick={() => handleCoinSideToggle(item, false)}
                                variant={!getCoinSide(item) ? "default" : "outline"}
                                className="px-6"
                              >
                                背面
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* 右側資訊區 */}
                      <div className="flex flex-1 flex-col overflow-y-auto bg-muted/30 p-8">
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                              <span className="w-2 h-2 bg-primary rounded-full"></span>
                              等值硬幣換算
                            </h3>
                            <Separator className="mb-4" />

                            {getCoinEquivalents(item).length > 0 ? (
                              <div className="space-y-3">
                                {getCoinEquivalents(item).map((equivalent, index) => (
                                  <Card key={index} className="transition-shadow hover:shadow-md">
                                    <CardContent className="flex items-center gap-4 p-4">
                                      <div className="flex-shrink-0">
                                        <div className="relative">
                                          <Coin coinValue={equivalent.value} size={50} />
                                        </div>
                                      </div>
                                      <div className="flex-1">
                                        <div className="font-medium text-lg">
                                          {equivalent.description}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {equivalent.count} 枚 × {equivalent.value} 元
                                        </div>
                                      </div>
                                      <Badge variant="secondary">
                                        = {item} 元
                                      </Badge>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <Card className="border-dashed">
                                <CardContent className="flex items-center justify-center p-8">
                                  <div className="text-center text-muted-foreground">
                                    <div className="text-4xl mb-2">💰</div>
                                    <p>此面額為最小單位</p>
                                    <p className="text-sm">無其他硬幣可等值換算</p>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>

                          {/* 硬幣圖案說明 */}
                          <div>
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                              <span className="w-2 h-2 bg-secondary rounded-full"></span>
                              圖案說明
                            </h3>
                            <Separator className="mb-4" />
                            <div className="space-y-3">
                              {(() => {
                                const design = getCoinDesigns(item);
                                return (
                                  <>
                                    <Card className="transition-colors hover:bg-muted/50">
                                      <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                            <span className="text-sm font-bold text-primary">正</span>
                                          </div>
                                          <div>
                                            <div className="font-medium">正面圖案</div>
                                            <div className="text-sm text-muted-foreground">
                                              {design.front}
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>

                                    <Card className="transition-colors hover:bg-muted/50">
                                      <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
                                            <span className="text-sm font-bold text-secondary-foreground">背</span>
                                          </div>
                                          <div>
                                            <div className="font-medium">背面圖案</div>
                                            <div className="text-sm text-muted-foreground">
                                              {design.back}
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              );
            })}
          </div>
        </TooltipProvider>
      </div>
    </PageTemplate>
  );
}
