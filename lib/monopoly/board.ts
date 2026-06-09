import type { PropertyTile, Tile } from "./types";

const CHANCE_IMG = "/images/monopoly/chance.webp";
const FATE_IMG = "/images/monopoly/fate.webp";

function prop(
  index: number,
  name: string,
  price: number,
  image: string,
): PropertyTile {
  const base = Math.round(price / 10);
  return {
    index,
    type: "property",
    name,
    image,
    price,
    toll: [base, base * 3, base * 6, base * 9],
    houseCost: Math.round(price / 2),
    maxHouses: 3,
  };
}

// 地標圖路徑（編號沿用原素材，移除的格不再引用）
function landmark(n: number): string {
  return `/images/monopoly/landmark-${String(n).padStart(2, "0")}.webp`;
}

// 34 格沿 12×7 方框邊緣排列，順時針。四角皆為特殊格（起點/監獄/機會/命運）。
// 22 個地產，台北固定在 index 1（命運卡 moveTo 會用到）。
export const BOARD: Tile[] = [
  { index: 0, type: "start", name: "起點" },
  prop(1, "台北101", 2000, landmark(1)),
  prop(2, "新北野柳", 1800, landmark(2)),
  { index: 3, type: "chance", name: "機會", image: CHANCE_IMG },
  prop(4, "基隆燈塔", 1200, landmark(3)),
  prop(5, "桃園機場", 1600, landmark(4)),
  { index: 6, type: "fate", name: "命運", image: FATE_IMG },
  prop(7, "新竹米粉", 1500, landmark(5)),
  prop(8, "台中歌劇院", 1900, landmark(6)),
  { index: 9, type: "chance", name: "機會", image: CHANCE_IMG },
  prop(10, "彰化扇形車庫", 1300, landmark(7)),
  { index: 11, type: "jail", name: "監獄" },
  prop(12, "南投日月潭", 1100, landmark(8)),
  prop(13, "雲林太平雲梯", 1000, landmark(9)),
  { index: 14, type: "fate", name: "命運", image: FATE_IMG },
  prop(15, "嘉義阿里山", 1200, landmark(10)),
  prop(16, "台南安平古堡", 1700, landmark(11)),
  { index: 17, type: "chance", name: "機會", image: CHANCE_IMG },
  prop(18, "高雄85大樓", 1900, landmark(12)),
  prop(19, "屏東海生館", 1100, landmark(13)),
  { index: 20, type: "fate", name: "命運", image: FATE_IMG },
  prop(21, "花蓮太魯閣", 1000, landmark(14)),
  prop(22, "台東熱氣球", 900, landmark(15)),
  { index: 23, type: "chance", name: "機會", image: CHANCE_IMG },
  prop(24, "龍騰斷橋", 1400, landmark(16)),
  prop(25, "宜蘭龜山島", 1300, landmark(17)),
  { index: 26, type: "fate", name: "命運", image: FATE_IMG },
  prop(27, "阿里山神木", 1600, landmark(19)),
  { index: 28, type: "fate", name: "命運", image: FATE_IMG },
  prop(29, "嘉義噴水池", 1100, landmark(20)),
  prop(30, "澎湖玄武岩", 1300, landmark(22)),
  { index: 31, type: "chance", name: "機會", image: CHANCE_IMG },
  prop(32, "馬祖藍眼淚", 1700, landmark(23)),
  prop(33, "三峽老街", 1400, landmark(24)),
];

export const BOARD_SIZE = BOARD.length;
