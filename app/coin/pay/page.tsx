"use client";

import AmountDisplay from "@/components/atoms/AmountDisplay";
import Coin from "@/components/atoms/Coin";
import { Product3D } from "@/components/atoms/Product3D";
import GameAnswerSection from "@/components/molecules/GameAnswerSection";
import { MaxAmount } from "@/components/molecules/setting/MaxAmount";
import { GamePageTemplate } from "@/components/templates/GamePageTemplate";
import { AVAILABLE_COINS } from "@/lib/constants/game";
import { PRODUCTS, type Product } from "@/lib/constants/products";
import type { Coin as CoinType } from "@/lib/types/types";
import { getRandomFeedback } from "@/lib/utils/gameFeedback";
import { useCallback, useEffect, useState } from "react";

interface SelectedCoin extends CoinType {
  id: number;
}

const GAME_COINS = AVAILABLE_COINS.filter((coin) =>
  [1, 5, 10, 50, 100].includes(coin.value)
);

export default function SelectCoinsPage() {
  const [targetAmount, setTargetAmount] = useState<number | null>(null);
  const [currentProduct, setCurrentProduct] = useState<Product>(PRODUCTS[0]);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [selectedCoins, setSelectedCoins] = useState<SelectedCoin[]>([]);
  const [hasAnswer, setHasAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [maxAmount, setMaxAmount] = useState<number>(150);

  const checkAnswer = useCallback(() => {
    if (currentAmount === targetAmount) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    setShowFeedback(true);
  }, [currentAmount]);

  const setupNewQuestion = (): void => {
    // 篩選出價格區間不超過最大金額的商品
    const availableProducts: Product[] = PRODUCTS.filter(
      (product: Product): boolean => product.priceRange[0] <= maxAmount
    );

    // 如果沒有符合條件的商品，使用價格最低的商品
    const productsToChooseFrom =
      availableProducts.length > 0
        ? availableProducts
        : [
            PRODUCTS.reduce((min, product) =>
              product.priceRange[0] < min.priceRange[0] ? product : min
            ),
          ];

    const randomProduct =
      productsToChooseFrom[
        Math.floor(Math.random() * productsToChooseFrom.length)
      ];
    const [minPrice, maxPrice] = randomProduct.priceRange;
    const price =
      Math.floor(
        Math.random() * (Math.min(maxPrice, maxAmount) - minPrice + 1)
      ) + minPrice;

    setCurrentProduct(randomProduct);
    setTargetAmount(price);
    setCurrentAmount(0);
    setSelectedCoins([]);
    setIsCorrect(null);
    setShowFeedback(false);
    setHasAnswer(false);
  };

  const resetGame = (): void => {
    setupNewQuestion();
  };

  useEffect(() => {
    resetGame();
  }, [maxAmount]);

  const handleCoinClick = useCallback(
    (coin: CoinType): void => {
      const newAmount: number = currentAmount + coin.value;
      // 為添加的硬幣創建唯一 ID
      const newSelectedCoin: SelectedCoin = { ...coin, id: Date.now() };

      setSelectedCoins((prev) => [...prev, newSelectedCoin]); // 儲存 SelectedCoin 物件
      setCurrentAmount(newAmount);
      // setHasAnswer(true); // 由 useEffect 處理
    },
    [currentAmount] // 移除 showFeedback 依賴
  );

  // 新增移除硬幣的處理函數
  const handleRemoveCoin = useCallback((coinToRemove: SelectedCoin): void => {
    setCurrentAmount((prev: number) => prev - coinToRemove.value);
    setSelectedCoins((prev) =>
      prev.filter((coin) => coin.id !== coinToRemove.id)
    );
  }, []);

  // 偵測 currentAmount 變化來更新 hasAnswer
  useEffect(() => {
    setHasAnswer(selectedCoins.length > 0);
  }, [selectedCoins]);

  const settings = [
    <MaxAmount
      key="maxAmount"
      maxAmount={maxAmount}
      setMaxAmount={setMaxAmount}
    />,
  ];

  return (
    <GamePageTemplate page="coin-pay" resetGame={resetGame} settings={settings}>
      <div className="mb-4 flex flex-col items-center gap-4 sm:flex-row sm:items-center">
        <Product3D
          modelPath={currentProduct.modelPath}
          productName={currentProduct.name}
          price={targetAmount || 0}
          className="mx-4"
        />
        <AmountDisplay
          label="售價"
          amount={targetAmount}
          amountColor="text-green-400"
        />
      </div>
      <GameAnswerSection
        question="請挑選正確的金額來付款"
        hasAnswer={hasAnswer}
        isCorrect={isCorrect}
        correctFeedback={getRandomFeedback("correctpay")}
        incorrectFeedback={
          targetAmount
            ? currentAmount > targetAmount
              ? getRandomFeedback("overpay", currentAmount - targetAmount)
              : getRandomFeedback("underpay", targetAmount - currentAmount)
            : ""
        }
        showFeedback={showFeedback}
        checkAnswer={checkAnswer}
        handleNextQuestion={resetGame}
      >
        <div>
          <div className="mb-6 flex min-h-[80px] w-full flex-col items-center rounded-md border bg-gray-100 p-4">
            {/* <h2 className="mb-2 self-start text-lg font-semibold">已選硬幣:</h2> */}
            <div className="flex min-h-[100px] flex-wrap justify-center gap-2 transition-all">
              {selectedCoins.length > 0 ? (
                selectedCoins.map((coin) => (
                  <button
                    key={coin.id}
                    onClick={() => handleRemoveCoin(coin)}
                    className="transition-transform hover:scale-110 active:scale-95"
                    aria-label={`移除 ${coin.name}`}
                  >
                    <Coin coinValue={coin.value} />
                  </button>
                ))
              ) : (
                <p className="self-center text-gray-500">尚未選擇任何硬幣</p>
              )}
            </div>
          </div>

          {/* 選擇硬幣區 */}
          <div className="mb-4">
            <h2 className="mb-2 text-center text-lg font-semibold">
              選擇硬幣:
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {GAME_COINS.map((coin) => {
                return (
                  <button
                    key={coin.value}
                    onClick={() => handleCoinClick(coin)}
                    className={
                      "relative cursor-pointer transition-transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
                    }
                    aria-label={`選擇 ${coin.name}`}
                  >
                    <Coin coinValue={coin.value} />
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
