import Image from "next/image";

interface CoinProps {
  coinValue: number;
  scale?: number;
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

export default function ThreeDCoin({ coinValue, scale = 1 }: CoinProps) {
  const imageSize = size(coinValue) * scale;
  const frontSrc = `/coins/${coinValue}.webp`;
  const backSrc = `/coins/${coinValue}_back.webp`;

  return (
    <div
      className="coin-card"
      style={{ width: `${imageSize}px`, height: `${imageSize}px` }}
    >
      <div className="coin-inner-card">
        <div className="coin-front-side">
          <Image
            src={frontSrc}
            alt={`${coinValue}元 正面`}
            width={imageSize}
            height={imageSize}
            className="h-full w-full object-contain"
            priority
          />
        </div>
        <div className="coin-back-side">
          <Image
            src={backSrc}
            alt={`${coinValue}元 背面`}
            width={imageSize}
            height={imageSize}
            className="h-full w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
