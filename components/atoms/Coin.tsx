import { cn } from "@/lib/utils";
import Image from "next/image";

interface CoinProps {
  coinValue: number;
  size?: number;
  className?: string;
}

const defaultSize = (coinValue: number): number => {
  switch (coinValue) {
    case 1:
      return 65;
    case 5:
      return 75;
    case 10:
      return 85;
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
};

export default function Coin({ coinValue, size, className }: CoinProps) {
  const imageSize = size ?? defaultSize(coinValue);

  return (
    <div className="relative transition-transform hover:scale-105">
      <Image
        src={`/images/coins/${coinValue}_back.webp`}
        alt={`${coinValue}元硬幣`}
        width={imageSize}
        height={imageSize}
        className={cn(
          `object-contain w-[${imageSize}px] h-[${imageSize}px] md:w-[${imageSize}px] md:h-[${imageSize}px]`,
          className,
        )}
      />
    </div>
  );
}
