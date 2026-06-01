import type { PropertyTile, Tile } from "./types";

function prop(index: number, name: string, price: number): PropertyTile {
  const base = Math.round(price / 10);
  return {
    index,
    type: "property",
    name,
    price,
    toll: [base, base * 3, base * 6, base * 9],
    houseCost: Math.round(price / 2),
    maxHouses: 3,
  };
}

export const BOARD: Tile[] = [
  { index: 0, type: "start", name: "起點" },
  prop(1, "台北", 2000),
  { index: 2, type: "chance", name: "機會" },
  prop(3, "新北", 1800),
  prop(4, "基隆", 1200),
  { index: 5, type: "fate", name: "命運" },
  prop(6, "桃園", 1600),
  { index: 7, type: "jail", name: "監獄" },
  prop(8, "新竹", 1500),
  { index: 9, type: "chance", name: "機會" },
  prop(10, "台中", 1900),
  prop(11, "彰化", 1300),
  { index: 12, type: "fate", name: "命運" },
  prop(13, "南投", 1100),
  prop(14, "雲林", 1000),
  { index: 15, type: "chance", name: "機會" },
  prop(16, "嘉義", 1200),
  prop(17, "台南", 1700),
  { index: 18, type: "fate", name: "命運" },
  prop(19, "高雄", 1900),
  prop(20, "屏東", 1100),
  { index: 21, type: "chance", name: "機會" },
  prop(22, "花蓮", 1000),
  prop(23, "台東", 900),
];

export const BOARD_SIZE = BOARD.length;
