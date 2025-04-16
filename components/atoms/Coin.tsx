import Image from "next/image";

interface CoinProps {
  coinValue: number;
}

const size = (coinValue: number): number => {
  switch (coinValue) {
    case 1:
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
};

export default function Coin({ coinValue }: CoinProps) {
  const imageSize = size(coinValue);

  return (
    <div className="relative transition-transform hover:scale-105">
      <Image
        src={`/images/coins/${coinValue}.webp`}
        alt={`${coinValue}元硬幣`}
        width={imageSize}
        height={imageSize}
        className={`object-contain w-[${imageSize}px] h-[${imageSize}px] md:w-[${imageSize}px] md:h-[${imageSize}px]`}
      />
    </div>
  );
}
