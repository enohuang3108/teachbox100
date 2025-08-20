import Image from "next/image";

interface CoinProps {
  coinValue: number;
  scale?: number;
  front?: boolean;
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

export default function ThreeDCoin({
  coinValue,
  scale = 1,
  front = true,
}: CoinProps) {
  const imageSize = size(coinValue) * scale;
  const frontSrc = `/images/coins/${coinValue}.webp`;
  const backSrc = `/images/coins/${coinValue}_back.webp`;

  return (
    <div
      className="coin-card m-auto"
      // TODO: enhance layout
      style={{ width: `${imageSize}px`, aspectRatio: coinValue >= 100 ? "2 / 1" : "1 / 1" }}
    >
      <div className="coin-inner-card">
        <div className="coin-front-side">
          <Image
            src={front ? frontSrc : backSrc}
            alt={`${coinValue}元 ${front ? "正面" : "背面"}`}
            width={imageSize}
            height={imageSize}
            className="h-auto w-full object-contain"
            priority
          />
        </div>
        <div className="coin-back-side">
          <Image
            src={front ? backSrc : frontSrc}
            alt={`${coinValue}元 ${front ? "背面" : "正面"}`}
            width={imageSize}
            height={imageSize}
            className="h-auto w-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
