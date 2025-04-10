import Image from "next/image";

interface CoinProps {
  coins: Array<{ value: number; name: string }>;
}

export default function CoinDisplay({ coins }: CoinProps) {
  return (
    <div className="flex flex-wrap gap-2 md:gap-4 justify-center items-center mx-auto min-h-[120px] md:min-h-[160px] p-4">
      {coins.map((coin, index) => {
        // 根據硬幣面值設定不同的大小
        const size = (() => {
          switch (coin.value) {
            case 1:
              return 70;
            case 5:
              return 70;
            case 10:
              return 90;
            case 50:
              return 100;
            case 100:
              return 110;
            case 200:
              return 120;
            case 500:
              return 130;
            case 1000:
              return 140;
            case 2000:
              return 150;
            default:
              return 70;
          }
        })();
        return (
          <div
            key={index}
            className="relative transition-transform hover:scale-105"
          >
            <Image
              src={`/coins/${coin.value}.webp`}
              alt={`${coin.value}元硬幣`}
              width={size}
              height={size}
              className={`object-contain w-[${size}px] h-[${size}px] md:w-[${size}px] md:h-[${size}px]`}
            />
          </div>
        );
      })}
    </div>
  );
}
