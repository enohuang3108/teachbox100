import type { PropertyTile, Tile } from "./types";

const CHANCE_IMG = "/images/monopoly/chance-v2.webp";
const FATE_IMG = "/images/monopoly/fate-v2.webp";
const START_IMG = "/images/monopoly/start-v3.webp";
const JAIL_IMG = "/images/monopoly/jail-v4.webp";

// 依售價分三級：地段越貴投報率越低、但旅館上限越驚人（高資本豪賭）。
// 倍率皆相對售價 P：toll=[空地,1棟,2棟,旅館]、house=每棟造價、hotel=升旅館費用。
type Tier = {
  toll: [number, number, number, number];
  house: number;
  hotel: number;
};

const ECO: Tier = { toll: [0.15, 0.4, 0.75, 1.2], house: 0.4, hotel: 0.6 }; // 經濟地 ≤1400
const MID: Tier = { toll: [0.12, 0.4, 0.78, 1.3], house: 0.4, hotel: 0.6 }; // 中價地 1500–2400
const PRIME: Tier = { toll: [0.1, 0.35, 0.75, 1.3], house: 0.35, hotel: 0.55 }; // 蛋黃地 ≥2500

const round10 = (n: number): number => Math.round(n / 10) * 10;

function tierOf(price: number): Tier {
  if (price <= 1400) return ECO;
  if (price <= 2400) return MID;
  return PRIME;
}

function prop(
  index: number,
  name: string,
  price: number,
  image: string,
): PropertyTile {
  const tier = tierOf(price);
  return {
    index,
    type: "property",
    name,
    image,
    price,
    toll: tier.toll.map((m) => round10(price * m)),
    houseCost: round10(price * tier.house),
    hotelCost: round10(price * tier.hotel),
    maxHouses: 2,
  };
}

// 34 格沿 12×7 方框邊緣排列，順時針。四角皆為特殊格（起點/監獄/機會/命運）。
// 22 個地產，台北101 在 index 32（倒數第二格，命運卡 moveTo 會用到）。
export const BOARD: Tile[] = [
  { index: 0, type: "start", name: "起點", image: START_IMG },
  prop(1, "馬祖藍眼淚", 2300, "/images/monopoly/landmark-01-v2.webp"),
  prop(2, "新北野柳", 1800, "/images/monopoly/landmark-02-v2.webp"),
  { index: 3, type: "chance", name: "機會", image: CHANCE_IMG },
  prop(4, "基隆燈塔", 1100, "/images/monopoly/landmark-03-v2.webp"),
  prop(5, "桃園機場", 2000, "/images/monopoly/landmark-04-v2.webp"),
  { index: 6, type: "fate", name: "命運", image: FATE_IMG },
  prop(7, "新竹米粉", 1300, "/images/monopoly/landmark-05-v2.webp"),
  prop(8, "台中歌劇院", 2800, "/images/monopoly/landmark-06a-v2.webp"), // 🔴
  { index: 9, type: "chance", name: "機會", image: CHANCE_IMG },
  prop(10, "彰化扇形車庫", 1200, "/images/monopoly/landmark-07b-v2.webp"),
  { index: 11, type: "jail", name: "監獄", image: JAIL_IMG },
  prop(12, "南投日月潭", 2200, "/images/monopoly/landmark-08-v2.webp"),
  prop(13, "雲林太平雲梯", 1000, "/images/monopoly/landmark-09-v2.webp"),
  { index: 14, type: "fate", name: "命運", image: FATE_IMG },
  prop(15, "嘉義阿里山", 2600, "/images/monopoly/landmark-10-v2.webp"), // 🔴
  prop(16, "台南安平古堡", 1900, "/images/monopoly/landmark-11-v2.webp"),
  { index: 17, type: "chance", name: "機會", image: CHANCE_IMG },
  prop(18, "高雄85大樓", 3000, "/images/monopoly/landmark-12-v2.webp"), // 🔴
  prop(19, "屏東海生館", 1400, "/images/monopoly/landmark-13-v2.webp"),
  { index: 20, type: "fate", name: "命運", image: FATE_IMG },
  prop(21, "花蓮太魯閣", 2400, "/images/monopoly/landmark-14-v2.webp"),
  prop(22, "台東熱氣球", 900, "/images/monopoly/landmark-15-v2.webp"), // 🟢 最便宜
  { index: 23, type: "chance", name: "機會", image: CHANCE_IMG },
  prop(24, "龍騰斷橋", 1300, "/images/monopoly/landmark-16-v2.webp"),
  prop(25, "宜蘭龜山島", 1600, "/images/monopoly/landmark-17-v2.webp"),
  { index: 26, type: "fate", name: "命運", image: FATE_IMG },
  prop(27, "阿里山神木", 3400, "/images/monopoly/landmark-19-v2.webp"), // 🔴
  { index: 28, type: "fate", name: "命運", image: FATE_IMG },
  prop(29, "嘉義噴水池", 1000, "/images/monopoly/landmark-20-v2.webp"),
  prop(30, "澎湖玄武岩", 1700, "/images/monopoly/landmark-22-v2.webp"),
  { index: 31, type: "chance", name: "機會", image: CHANCE_IMG },
  prop(32, "台北101", 4000, "/images/monopoly/landmark-01x-v2.webp"), // 🔴 蛋黃地王（倒數第二格）
  prop(33, "三峽老街", 1500, "/images/monopoly/landmark-24-v2.webp"),
];

export const BOARD_SIZE = BOARD.length;
