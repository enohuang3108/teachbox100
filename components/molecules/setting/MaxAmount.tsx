interface MaxAmountProps {
  maxAmount: number;
  setMaxAmount: (value: number) => void;
}

export const MaxAmount: React.FC<MaxAmountProps> = ({
  maxAmount,
  setMaxAmount,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">最大金錢上限</h3>
          <span className="rounded-full bg-blue-100 px-2 py-1 text-sm font-medium text-blue-600">
            {maxAmount} 元
          </span>
        </div>
        <div className="relative pt-1">
          <input
            type="range"
            min="10"
            max={2000}
            step="10"
            value={maxAmount}
            onChange={(e) => setMaxAmount(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-500"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>10 元</span>
            <span>2000 元</span>
          </div>
        </div>
      </div>
    </div>
  );
};
