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

// 地標圖依棋盤 property 出現順序對應 landmark-01..15
function landmark(n: number): string {
  return `/images/monopoly/landmark-${String(n).padStart(2, "0")}.webp`;
}

export const BOARD: Tile[] = [
  { index: 0, type: "start", name: "起點" },
  prop(1, "台北", 2000, landmark(1)),
  { index: 2, type: "chance", name: "機會", image: CHANCE_IMG },
  prop(3, "新北", 1800, landmark(2)),
  prop(4, "基隆", 1200, landmark(3)),
  { index: 5, type: "fate", name: "命運", image: FATE_IMG },
  prop(6, "桃園", 1600, landmark(4)),
  prop(7, "新竹", 1500, landmark(5)),
  { index: 8, type: "jail", name: "監獄" },
  { index: 9, type: "chance", name: "機會", image: CHANCE_IMG },
  prop(10, "台中", 1900, landmark(6)),
  prop(11, "彰化", 1300, landmark(7)),
  { index: 12, type: "fate", name: "命運", image: FATE_IMG },
  prop(13, "南投", 1100, landmark(8)),
  prop(14, "雲林", 1000, landmark(9)),
  { index: 15, type: "chance", name: "機會", image: CHANCE_IMG },
  prop(16, "嘉義", 1200, landmark(10)),
  prop(17, "台南", 1700, landmark(11)),
  { index: 18, type: "fate", name: "命運", image: FATE_IMG },
  prop(19, "高雄", 1900, landmark(12)),
  { index: 20, type: "chance", name: "機會", image: CHANCE_IMG },
  prop(21, "屏東", 1100, landmark(13)),
  prop(22, "花蓮", 1000, landmark(14)),
  prop(23, "台東", 900, landmark(15)),
];

export const BOARD_SIZE = BOARD.length;
