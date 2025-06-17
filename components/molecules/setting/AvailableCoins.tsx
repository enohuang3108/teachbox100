import Coin from "@/components/atoms/Coin";
import { AVAILABLE_COINS } from "@/lib/constants/game";

interface AvailableCoinsProps {
  enabledCoins: number[];
  setEnabledCoins: (enabledCoins: number[]) => void;
}

export const AvailableCoins: React.FC<AvailableCoinsProps> = ({enabledCoins,setEnabledCoins}) => {
  const toggleCoin = (coinValue: number) => {
    if (enabledCoins.includes(coinValue)) {
      // 如果至少還有另一個硬幣啟用，才可以禁用當前硬幣
      if (enabledCoins.length > 1) {
        setEnabledCoins(enabledCoins.filter((value) => value !== coinValue));
      }
    } else {
      setEnabledCoins([...enabledCoins, coinValue]);
    }
  };

  return(
    <div className="space-y-2">
      <h3 className="mb-©2 text-sm font-medium text-gray-700">可用硬幣</h3>
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_COINS.map((coin) => (
          <button
            key={coin.value}
            onClick={() => toggleCoin(coin.value)}
            className={`flex h-[70px] w-[70px] flex-col items-center justify-center p-0 transition-all ${
              !enabledCoins.includes(coin.value) && "opacity-50 grayscale"
            }`}
          >
            <Coin
              key={coin.value}
              coinValue={coin.value}
              size={60}
              className="cursor-pointer"
            />
            {coin.value}
          </button>
        ))}
      </div>
    </div>
  )
}
