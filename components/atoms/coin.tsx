interface CoinProps {
  value: number
}

export default function Coin({ value }: CoinProps) {
  // 根據硬幣面值設定不同的樣式
  const getCoinStyle = () => {
    switch (value) {
      case 1:
        return "bg-gray-300 text-gray-800 border-gray-400" // 1元硬幣
      case 5:
        return "bg-gray-400 text-white border-gray-500" // 5元硬幣
      case 10:
        return "bg-yellow-100 text-yellow-800 border-yellow-300" // 10元硬幣
      case 50:
        return "bg-yellow-500 text-white border-yellow-600" // 50元硬幣
      default:
        return "bg-gray-200 text-gray-800"
    }
  }

  // 根據硬幣面值設定不同的大小
  const getCoinSize = () => {
    switch (value) {
      case 1:
        return "w-14 h-14" // 1元硬幣最小
      case 5:
        return "w-16 h-16" // 5元硬幣
      case 10:
        return "w-18 h-18" // 10元硬幣
      case 50:
        return "w-20 h-20" // 50元硬幣最大
      default:
        return "w-16 h-16"
    }
  }

  return (
    <div
      className={`${getCoinSize()} ${getCoinStyle()} rounded-full flex items-center justify-center border-4 shadow-md font-bold`}
    >
      {value}元
    </div>
  )
}

