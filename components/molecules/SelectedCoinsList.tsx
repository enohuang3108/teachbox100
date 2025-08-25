import Coin from "@/components/atoms/Coin";
import type { Coin as CoinType } from "@/lib/types/types";

export interface SelectedCoin extends CoinType {
  id: number;
}

interface SelectedCoinsListProps {
  selectedCoins: SelectedCoin[];
  onRemoveCoin: (coin: SelectedCoin) => void;
}

export default function SelectedCoinsList({
  selectedCoins,
  onRemoveCoin,
}: SelectedCoinsListProps) {
  return (
    <div className="flex flex-wrap justify-center gap-3 p-4 rounded-lg backdrop-blur-sm">
      {selectedCoins.length > 0 ? (
        selectedCoins.map((coin) => (
          <button
            key={coin.id}
            onClick={() => onRemoveCoin(coin)}
            className="group relative transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-full"
            aria-label={`移除 ${coin.value}元硬幣`}
          >
            <div className="relative">
              <Coin coinValue={coin.value} />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-bold">
                ×
              </div>
            </div>
          </button>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-500">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-2">
            <span className="text-2xl">+</span>
          </div>
          <p className="text-sm font-medium">尚未選擇硬幣</p>
        </div>
      )}
    </div>
  );
}
