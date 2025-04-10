import { Background } from "@/components/atoms/Background";
import { ImageCard } from "@/components/molecules/ImageCard";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <Background />
      <ImageCard
        link="/coin-value"
        imageSrc="/images/cover_coin.webp"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAACBAMAAACNhmBQAAAAGFBMVEXkWzHhWy/bfVPfeU3jd03djGHhmm/ppnJS83WVAAAADklEQVQI12NgMmMoCQQAAiEA/oMLiwwAAAAASUVORK5CYII="
        cardTitle="認識錢幣與鈔票"
        cardDescription="學習怎麼計算錢幣與鈔票的價值"
      />
    </main>
  );
}
