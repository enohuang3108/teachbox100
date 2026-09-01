import { Slider } from "@/components/atoms/shadcn/slider";
import { useEffect, useState } from "react";

const MIN_LIMIT = 10;
const MAX_LIMIT = 2000;
const STEP = 10;
const DEFAULT_RANGE = { minAmount: 10, maxAmount: 300 };

export const useMoneyRange = () => {
  const [moneyRange, setMoneyRange] = useState(DEFAULT_RANGE);

  useEffect(() => {
    const savedMin = Number(localStorage.getItem("coinValueMinAmount"));
    const savedMax = Number(localStorage.getItem("coinValueMaxAmount"));

    // 保留舊版「最大金錢上限」設定，讓既有使用者升級後仍維持原本的上限。
    const legacyMax = Number(localStorage.getItem("maxAmount"));
    const maxAmount =
      savedMax >= MIN_LIMIT && savedMax <= MAX_LIMIT
        ? savedMax
        : legacyMax >= MIN_LIMIT && legacyMax <= MAX_LIMIT
          ? legacyMax
          : DEFAULT_RANGE.maxAmount;
    const minAmount =
      savedMin >= MIN_LIMIT && savedMin <= maxAmount
        ? savedMin
        : DEFAULT_RANGE.minAmount;

    setMoneyRange({ minAmount, maxAmount });
  }, []);

  const updateRange = (nextRange: typeof DEFAULT_RANGE) => {
    setMoneyRange(nextRange);
    localStorage.setItem("coinValueMinAmount", String(nextRange.minAmount));
    localStorage.setItem("coinValueMaxAmount", String(nextRange.maxAmount));
  };

  return { ...moneyRange, setMoneyRange: updateRange };
};

export function MoneyRange({
  minAmount,
  maxAmount,
  onChange,
  onCommit,
}: {
  minAmount: number;
  maxAmount: number;
  onChange: (range: typeof DEFAULT_RANGE) => void;
  onCommit: (range: typeof DEFAULT_RANGE) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">金錢區間</h3>
        <span className="rounded-full bg-blue-100 px-2 py-1 text-sm font-medium text-blue-600">
          {minAmount}～{maxAmount} 元
        </span>
      </div>

      <Slider
        aria-label="金錢區間"
        value={[minAmount, maxAmount]}
        min={MIN_LIMIT}
        max={MAX_LIMIT}
        step={STEP}
        minStepsBetweenThumbs={1}
        onValueChange={([nextMinAmount, nextMaxAmount]) =>
          onChange({ minAmount: nextMinAmount, maxAmount: nextMaxAmount })
        }
        onValueCommit={([nextMinAmount, nextMaxAmount]) =>
          onCommit({ minAmount: nextMinAmount, maxAmount: nextMaxAmount })
        }
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{MIN_LIMIT} 元</span>
        <span>{MAX_LIMIT} 元</span>
      </div>
    </div>
  );
}
