import type { PropertyTile, Tile } from "./types";

const CHANCE_IMG = "/images/monopoly/chance.webp";
const FATE_IMG = "/images/monopoly/fate.webp";
const START_IMG = "/images/monopoly/start.webp";
const JAIL_IMG = "/images/monopoly/jail.webp";

// 依售價分三級：地段越貴投報率越低、但旅館上限越驚人（高資本豪賭）。
// 倍率皆相對售價 P：toll=[空地,1棟,2棟,旅館]、house=每棟造價、hotel=升旅館費用。
type Tier = {
  toll: [number, number, number, number];
  house: number;
  hotel: number;
};

const ECO: Tier = { toll: [0.15, 0.45, 0.9, 1.5], house: 0.4, hotel: 0.6 }; // 經濟地 ≤1400
const MID: Tier = { toll: [0.12, 0.45, 0.95, 1.6], house: 0.4, hotel: 0.6 }; // 中價地 1500–2400
const PRIME: Tier = { toll: [0.1, 0.4, 0.9, 1.6], house: 0.35, hotel: 0.55 }; // 蛋黃地 ≥2500

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

// 地標圖路徑（編號沿用原素材，移除的格不再引用）
function landmark(n: number): string {
  return `/images/monopoly/landmark-${String(n).padStart(2, "0")}.webp`;
}

// 34 格沿 12×7 方框邊緣排列，順時針。四角皆為特殊格（起點/監獄/機會/命運）。
// 22 個地產，台北101 在 index 32（倒數第二格，命運卡 moveTo 會用到）。
export const BOARD: Tile[] = [
  { index: 0, type: "start", name: "起點", image: START_IMG },
  prop(1, "馬祖藍眼淚", 2300, landmark(23)),
  prop(2, "新北野柳", 1800, landmark(2)),
  { index: 3, type: "chance", name: "機會", image: CHANCE_IMG },
  prop(4, "基隆燈塔", 1100, landmark(3)),
  prop(5, "桃園機場", 2000, landmark(4)),
  { index: 6, type: "fate", name: "命運", image: FATE_IMG },
  prop(7, "新竹米粉", 1300, landmark(5)),
  prop(8, "台中歌劇院", 2800, landmark(6)), // 🔴
  { index: 9, type: "chance", name: "機會", image: CHANCE_IMG },
  prop(10, "彰化扇形車庫", 1200, landmark(7)),
  { index: 11, type: "jail", name: "監獄", image: JAIL_IMG },
  prop(12, "南投日月潭", 2200, landmark(8)),
  prop(13, "雲林太平雲梯", 1000, landmark(9)),
  { index: 14, type: "fate", name: "命運", image: FATE_IMG },
  prop(15, "嘉義阿里山", 2600, landmark(10)), // 🔴
  prop(16, "台南安平古堡", 1900, landmark(11)),
  { index: 17, type: "chance", name: "機會", image: CHANCE_IMG },
  prop(18, "高雄85大樓", 3000, landmark(12)), // 🔴
  prop(19, "屏東海生館", 1400, landmark(13)),
  { index: 20, type: "fate", name: "命運", image: FATE_IMG },
  prop(21, "花蓮太魯閣", 2400, landmark(14)),
  prop(22, "台東熱氣球", 900, landmark(15)), // 🟢 最便宜
  { index: 23, type: "chance", name: "機會", image: CHANCE_IMG },
  prop(24, "龍騰斷橋", 1300, landmark(16)),
  prop(25, "宜蘭龜山島", 1600, landmark(17)),
  { index: 26, type: "fate", name: "命運", image: FATE_IMG },
  prop(27, "阿里山神木", 3400, landmark(19)), // 🔴
  { index: 28, type: "fate", name: "命運", image: FATE_IMG },
  prop(29, "嘉義噴水池", 1000, landmark(20)),
  prop(30, "澎湖玄武岩", 1700, landmark(22)),
  { index: 31, type: "chance", name: "機會", image: CHANCE_IMG },
  prop(32, "台北101", 4000, landmark(1)), // 🔴 蛋黃地王（倒數第二格）
  prop(33, "三峽老街", 1500, landmark(24)),
];

export const BOARD_SIZE = BOARD.length;
