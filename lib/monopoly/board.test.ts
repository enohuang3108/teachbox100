import { describe, expect, it } from "vitest";
import { BOARD, BOARD_SIZE } from "./board";
import { isProperty } from "./types";

describe("BOARD", () => {
  it("索引連續且與陣列位置一致", () => {
    BOARD.forEach((tile, i) => expect(tile.index).toBe(i));
  });

  it("恰有一個起點與一個監獄", () => {
    expect(BOARD.filter((t) => t.type === "start")).toHaveLength(1);
    expect(BOARD.filter((t) => t.type === "jail")).toHaveLength(1);
  });

  it("起點在 index 0", () => {
    expect(BOARD[0].type).toBe("start");
  });

  it("每個地產 toll 陣列長度 = maxHouses + 1 且遞增", () => {
    BOARD.filter(isProperty).forEach((p) => {
      expect(p.toll).toHaveLength(p.maxHouses + 1);
      for (let i = 1; i < p.toll.length; i++) {
        expect(p.toll[i]).toBeGreaterThan(p.toll[i - 1]);
      }
    });
  });

  it("BOARD_SIZE 等於格子數", () => {
    expect(BOARD_SIZE).toBe(BOARD.length);
  });
});
