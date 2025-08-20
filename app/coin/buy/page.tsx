"use client";

import AmountDisplay from "@/components/atoms/AmountDisplay";
import Coin from "@/components/atoms/Coin";
import { ProductShelf } from "@/components/atoms/ProductShelf";
import { ShoppingCart } from "@/components/atoms/ShoppingCart";
import GameAnswerSection from "@/components/molecules/GameAnswerSection";
import { useMaxAmount } from "@/components/molecules/setting/MaxAmount";
import { GamePageTemplate } from "@/components/templates/GamePageTemplate";
import { AVAILABLE_COINS } from "@/lib/constants/game";
import { PRODUCTS, type Product } from "@/lib/constants/products";
import type { Coin as CoinType } from "@/lib/types/types";
import { getRandomFeedback } from "@/lib/utils/gameFeedback";
import { useCallback, useEffect, useState } from "react";

interface SelectedCoin extends CoinType {
  id: number;
}

interface SelectedProduct extends Product {
  id: string;
  price: number;
}

interface ShelfProduct extends Product {
  currentPrice: number;
}

// 根據最大金額動態過濾可用硬幣
// const getAvailableCoins = (maxAmount: number) => {
//   return AVAILABLE_COINS.filter((coin) => coin.value <= maxAmount);
// };

export default function SelectCoinsPage() {
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>(
    []
  );
  const [currentAmount, setCurrentAmount] = useState(0);
  const [selectedCoins, setSelectedCoins] = useState<SelectedCoin[]>([]);
  const [hasAnswer, setHasAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const { maxAmount, MaxAmountComponent } = useMaxAmount();
  const [isClient, setIsClient] = useState(false);

  // 從產品列表中隨機選取 5 個商品作為商品架（只在客戶端執行）
  const [shelfProducts, setShelfProducts] = useState<ShelfProduct[]>([]);

  // 確保只在客戶端執行
  useEffect(() => {
    setIsClient(true);
    // 生成隨機商品列表並添加 currentPrice
    const shuffled = [...PRODUCTS].sort(() => 0.5 - Math.random());
    const shelfProductsWithPrices = shuffled.slice(0, 5).map((product) => {
      const [minPrice, maxPrice] = product.priceRange;
      const currentPrice = Math.min(
        Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice,
        maxAmount
      );
      return {
        ...product,
        currentPrice,
      };
    });
    setShelfProducts(shelfProductsWithPrices);
  }, [maxAmount]);

  const checkAnswer = useCallback(() => {
    if (currentAmount === targetAmount) {
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
    setShowFeedback(true);
  }, [currentAmount, targetAmount]);

  const setupNewQuestion = (): void => {
    setSelectedProducts([]);
    setTargetAmount(0);
    setCurrentAmount(0);
    setSelectedCoins([]);
    setIsCorrect(null);
    setShowFeedback(false);
    setHasAnswer(false);
  };

  const resetGame = (): void => {
    setupNewQuestion();
    // 重新生成隨機商品列表
    const shuffled = [...PRODUCTS].sort(() => 0.5 - Math.random());
    const shelfProductsWithPrices = shuffled.slice(0, 5).map((product) => {
      const [minPrice, maxPrice] = product.priceRange;
      const currentPrice = Math.min(
        Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice,
        maxAmount
      );
      return {
        ...product,
        currentPrice,
      };
    });
    setShelfProducts(shelfProductsWithPrices);
  };

  // 添加商品到購物車
  const handleProductSelect = useCallback(
    (product: ShelfProduct) => {
      if (!isClient) return; // 防止在 SSR 期間執行

      const selectedProduct: SelectedProduct = {
        ...product,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        price: product.currentPrice,
      };

      setSelectedProducts((prev) => [...prev, selectedProduct]);
    },
    [isClient]
  );

  // 從購物車移除商品
  const handleProductRemove = useCallback((productId: string) => {
    setSelectedProducts((prev) =>
      prev.filter((product) => product.id !== productId)
    );
  }, []);

  // 計算購物車總金額
  useEffect(() => {
    const total = selectedProducts.reduce(
      (sum, product) => sum + product.price,
      0
    );
    setTargetAmount(total);
  }, [selectedProducts]);

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
    setHasAnswer(selectedCoins.length > 0 && selectedProducts.length > 0);
  }, [selectedCoins, selectedProducts]);

  const settings = [<MaxAmountComponent name="商品單價上限" key="maxAmount" />];

  return (
    <GamePageTemplate
      page="coin-transaction"
      resetGame={resetGame}
      settings={settings}
    >
      {/* 商品架 - 只在客戶端渲染 */}
      {isClient ? (
        <ProductShelf
          products={shelfProducts}
          onProductSelect={handleProductSelect}
        />
      ) : (
        <div className="w-full mb-8 flex items-center justify-center h-64 bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300 rounded-2xl">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mb-4"></div>
            <p className="text-gray-800 font-medium">正在載入...</p>
          </div>
        </div>
      )}

      {/* 購物車和總金額 - 只在客戶端渲染 */}
      {isClient && (
        <>
          <ShoppingCart
            selectedProducts={selectedProducts}
            onProductRemove={handleProductRemove}
            onProductDrop={handleProductSelect}
          />

          {targetAmount > 0 && (
            <div className="mb-4 flex justify-center">
              <AmountDisplay
                label="總金額"
                amount={targetAmount}
                amountColor="text-green-600"
              />
            </div>
          )}
        </>
      )}
      {targetAmount > 0 && (
        <GameAnswerSection
          question="請選擇正確的金額來付款"
          hasAnswer={hasAnswer}
          isCorrect={isCorrect}
          correctFeedback={getRandomFeedback("correctpay")}
          incorrectFeedback={
            targetAmount > 0
              ? currentAmount > targetAmount
                ? getRandomFeedback("overpay", currentAmount - targetAmount)
                : getRandomFeedback("underpay", targetAmount - currentAmount)
              : "請先選擇商品再付款"
          }
          submitMessage="付款"
          showFeedback={showFeedback}
          checkAnswer={checkAnswer}
          handleNextQuestion={resetGame}
        >
          <div>
            <div className="mb-6 flex min-h-[80px] w-full flex-col items-center rounded-md border bg-gray-100 p-4">
              <h2 className="mb-2 self-start text-lg font-semibold">已選擇:</h2>
              <div className="flex min-h-[100px] flex-wrap justify-center gap-2 transition-all">
                {selectedCoins.length > 0 ? (
                  selectedCoins.map((coin) => (
                    <button
                      key={coin.id}
                      onClick={() => handleRemoveCoin(coin)}
                      className="transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                      // aria-label={`移除 ${coin.name}`}
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
                {AVAILABLE_COINS.map((coin) => {
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
      )}
    </GamePageTemplate>
  );
}
