import Image from "next/image";
import type { CSSProperties } from "react";

/**
 * 首頁的裝飾層：出血色塊 + 淡色數學浮水印。
 * 全部 aria-hidden + pointer-events-none，純視覺、不進 a11y tree。
 * 用 absolute（不是 fixed）讓它跟著內容捲動，才有紙上排版的感覺。
 *
 * 位置一律用 rem / bottom 而不是 top 百分比：頁面高度在手機上會變三倍，
 * 百分比會讓色塊飄到卡片中間。
 *
 * 每個元素外層負責捲動視差、內層負責自己的動作（浮動或旋轉）。
 * 兩層分開是必要的 —— 疊在同一個元素上，後宣告的 transform 會直接蓋掉前一個。
 */

// overflow-clip 而不是 overflow-hidden：hidden 會生出一個 scroll container，
// 干擾底下 scroll-driven animation 的時間軸解析。
const LAYER = "pointer-events-none absolute inset-0 -z-10 overflow-clip";

type Decor = {
  /**
   * 視差位移。一律為正 —— 全部往下漂，也就是「跟不上捲動」，這是遠景在物理上
   * 唯一會有的行為。正負交錯讓元素互相穿越看起來很酷，但同一視野裡同時有東西
   * 往上、有東西往下，前庭系統會收到矛盾訊號，是暈眩的主因。只讓速率不同。
   */
  parallax: string;
  pos: CSSProperties;
  /** 窄螢幕沒有留白容納它，直接不顯示 */
  desktopOnly?: boolean;
};

type Blob = Decor & {
  color: "blue" | "red" | "green";
  /** 寬度，clamp 讓它在手機上不會佔滿畫面 */
  size: string;
  /** 浮動週期。各給不同秒數 + 負 delay，載入時就錯開，不會整片一起呼吸 */
  float: { duration: string; delay: string };
};

// 三塊從邊緣切進畫面的色塊。黃色那塊歸 Hero 自己管：它要疊在 Barkley 後面當
// 構圖的一部分，跟著捲動漂走反而會跟狗脫節，所以刻意不給視差。
const BLOBS: Blob[] = [
  // 刻意壓在 21rem：再往上會撞到左上角的 logo
  {
    color: "blue",
    size: "clamp(9rem, 15vw, 13rem)",
    pos: { top: "21rem", left: "-6rem" },
    float: { duration: "22s", delay: "-2s" },
    parallax: "70px",
  },
  {
    color: "red",
    size: "clamp(6rem, 12vw, 10rem)",
    pos: { top: "58rem", right: "-4.5rem" },
    float: { duration: "18s", delay: "-5s" },
    parallax: "55px",
    desktopOnly: true,
  },
  {
    color: "green",
    size: "clamp(7rem, 16vw, 14rem)",
    pos: { bottom: "6rem", left: "-6rem" },
    float: { duration: "26s", delay: "-9s" },
    parallax: "80px",
    desktopOnly: true,
  },
];

type Glyph = Decor & { text: string; size: string; rotate: number };

// 教材主題的符號當浮水印：錢、時間、運算。刻意壓在極低對比。
// 視差同向不同速，不做反向交錯（見上面 parallax 欄位的說明）。
const GLYPHS: Glyph[] = [
  { text: "$", size: "8rem", rotate: -14, pos: { top: "30rem", left: "4%" }, parallax: "60px" },
  { text: "＝", size: "6rem", rotate: 12, pos: { top: "17rem", right: "3%" }, parallax: "75px" },
  { text: "5:30", size: "5.5rem", rotate: 9, pos: { top: "44rem", left: "2%" }, parallax: "50px" },
  { text: "×", size: "7rem", rotate: -16, pos: { bottom: "17rem", right: "4%" }, parallax: "65px" },
  { text: "÷", size: "6.5rem", rotate: 11, pos: { bottom: "24rem", left: "3%" }, parallax: "60px" },
];

const shift = (value: string) => ({ "--parallax-shift": value }) as CSSProperties;

export function PageDecor() {
  return (
    <div aria-hidden className={LAYER}>
      {BLOBS.map((blob) => (
        <div
          key={blob.color}
          className={`decor-parallax absolute ${blob.desktopOnly ? "hidden md:block" : ""}`}
          style={{ width: blob.size, ...shift(blob.parallax), ...blob.pos }}
        >
          <Image
            src={`/images/decor/blob-${blob.color}.webp`}
            alt=""
            width={640}
            height={640}
            sizes="(max-width: 768px) 40vw, 20vw"
            className="blob-float h-auto w-full"
            style={{
              animationDuration: blob.float.duration,
              animationDelay: blob.float.delay,
            }}
          />
        </div>
      ))}

      {GLYPHS.map((glyph) => (
        <div
          key={glyph.text}
          className="decor-parallax absolute hidden md:block"
          style={{ ...shift(glyph.parallax), ...glyph.pos }}
        >
          <span
            className="block font-display leading-none font-black select-none"
            style={{
              fontSize: glyph.size,
              color: "var(--ghost)",
              transform: `rotate(${glyph.rotate}deg)`,
            }}
          >
            {glyph.text}
          </span>
        </div>
      ))}
    </div>
  );
}
