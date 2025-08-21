import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  const [isFlipped, setIsFlipped] = useState(false);
  const imageSize = size(coinValue) * scale;
  const frontSrc = `/images/coins/${coinValue}.webp`;
  const backSrc = `/images/coins/${coinValue}_back.webp`;

  return (
    <div
      className="relative m-auto [perspective:2000px]"
      style={{ width: `${imageSize}px` }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className={cn(
          "relative w-full",
          "[transform-style:preserve-3d]",
          "transition-all duration-700",
          isFlipped
            ? "[transform:rotateY(180deg)]"
            : "[transform:rotateY(0deg)]"
        )}
      >
        {/* 底層圖片，提供自然高度 */}
        <Image
          src={front ? frontSrc : backSrc}
          alt={`${coinValue}元 ${front ? "正面" : "背面"}`}
          width={imageSize}
          height={imageSize}
          className={cn(
            "h-auto w-full object-contain",
            "[backface-visibility:hidden] [transform:rotateY(0deg)]"
          )}
          priority
        />
        
        {/* 頂層圖片，疊加顯示 */}
        <Image
          src={front ? backSrc : frontSrc}
          alt={`${coinValue}元 ${front ? "背面" : "正面"}`}
          width={imageSize}
          height={imageSize}
          className={cn(
            "absolute inset-0 h-auto w-full object-contain",
            "[backface-visibility:hidden] [transform:rotateY(180deg)]"
          )}
        />
      </div>
    </div>
  );
}
