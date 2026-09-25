import { describe, expect, it } from "vitest";
import type { Question } from "@/lib/questions/types";
import {
  boardCells,
  cellCount,
  countOf,
  gridFor,
  leaderOf,
  newBoard,
  playableOf,
  resolveAnswer,
  spread,
  winnerOf,
  type Board,
  type Owner,
} from "./rules";

const q = (over: Partial<Question> = {}): Question => ({
  id: "q",
  type: "choice",
  text: "1+1？",
  options: ["1", "2"],
  answer: "2",
  ...over,
});

/** 用字串畫棋盤：L 藍、R 紅、. 中立，一列一行 */
const board = (...lines: string[]): Board => ({
  cols: lines[0].length,
  rows: lines.length,
  cells: lines
    .join("")
    .split("")
    .map((c): Owner => (c === "L" ? "left" : c === "R" ? "right" : null)),
});
const draw = (b: Board) =>
  Array.from({ length: b.rows }, (_, y) =>
    b.cells
      .slice(y * b.cols, (y + 1) * b.cols)
      .map((c) => (c === "left" ? "L" : c === "right" ? "R" : "."))
      .join(""),
  );

describe("棋盤大小", () => {
  it("題目越多棋盤越大，最少 6 格", () => {
    expect(cellCount(0)).toBe(6);
    expect(cellCount(10)).toBe(7);
    expect(cellCount(22)).toBe(12);
    expect(cellCount(50)).toBe(20);
  });

  it("格子盡量接近正方形，行列都至少 3、格數不少於公式", () => {
    expect(gridFor(20, 16 / 9)).toEqual({ cols: 6, rows: 4 }); // 50 題
    expect(gridFor(12, 16 / 9)).toEqual({ cols: 5, rows: 3 }); // 內建題庫
    expect(gridFor(10, 16 / 10)).toEqual({ cols: 4, rows: 3 }); // 不排 5×2
    expect(gridFor(7, 16 / 9)).toEqual({ cols: 3, rows: 3 }); // 最小九宮格
    // 直立的手機
    expect(gridFor(12, 9 / 19.5)).toEqual({ cols: 3, rows: 5 });
  });

  it("藍隊從左上、紅隊從右下各占一格開始", () => {
    expect(draw(newBoard(4, 3))).toEqual(["L...", "....", "...R"]);
  });
});

describe("暈開", () => {
  it("先長中立格，挑離自己起點最近的", () => {
    const r = spread(newBoard(4, 3), "left", 3);
    expect(draw(r.board)).toEqual(["LL..", "LL..", "...R"]);
    expect(r.changed).toEqual([1, 4, 5]);
  });

  it("碰不到中立格才吃對方，先咬離對方起點最遠的前線", () => {
    const r = spread(board("LLRR", "LLRR", "LLRR"), "left", 2);
    expect(draw(r.board)).toEqual(["LLLL", "LLRR", "LLRR"]);
  });

  it("還碰得到中立格就不吃對方", () => {
    const r = spread(board("LR..", "....", "...R"), "left", 1);
    expect(draw(r.board)).toEqual(["LR..", "L...", "...R"]);
  });

  it("吃光對方就贏，整盤都是自己的就停", () => {
    const r = spread(board("LLLR"), "left", 3);
    expect(draw(r.board)).toEqual(["LLLL"]);
    expect(r.changed).toEqual([3]);
    expect(winnerOf(r.board)).toBe("left");
  });
});

describe("判勝", () => {
  it("雙方都還有格子就還沒分出來", () => {
    expect(winnerOf(newBoard(4, 3))).toBeNull();
  });

  it("題目出完時格子多的贏，一樣多平手", () => {
    expect(leaderOf(board("LL.R"))).toBe("left");
    expect(leaderOf(board("L..R"))).toBeNull();
    expect(countOf(board("LL.R"), "right")).toBe(1);
  });
});

describe("作答結算", () => {
  it("答對依難度暈開 1／2／3 格，這題結束", () => {
    for (const [difficulty, cells] of [
      ["easy", 1],
      ["normal", 2],
      ["hard", 3],
    ] as const) {
      expect(resolveAnswer(q({ difficulty }), "left", "2", null)).toMatchObject(
        { correct: true, side: "left", cells, roundOver: true },
      );
    }
  });

  it("答錯讓對方暈開 1 格並出局，對方接手同一題", () => {
    expect(
      resolveAnswer(q({ difficulty: "hard" }), "left", "1", null),
    ).toEqual({
      correct: false,
      side: "right",
      cells: 1,
      roundOver: false,
      lockedOut: "left",
    });
  });

  it("兩隊都答錯，這題結束", () => {
    expect(resolveAnswer(q(), "right", "1", "left")).toMatchObject({
      side: "left",
      roundOver: true,
    });
  });

  it("出局的那隊不能再答", () => {
    expect(() => resolveAnswer(q(), "left", "2", "left")).toThrow();
  });
});

it("只收選擇與是非，並套難度上限", () => {
  const bank = [
    q({ id: "a", difficulty: "easy" }),
    q({ id: "b", type: "short", answer: "x" }),
    q({ id: "c", type: "boolean", answer: "是", difficulty: "hard" }),
  ];
  expect(playableOf(bank).map((x) => x.id)).toEqual(["a", "c"]);
  expect(playableOf(bank, "easy").map((x) => x.id)).toEqual(["a"]);
});

describe("boardCells", () => {
  it("自動照題數算，指定大小就用固定格數", () => {
    expect(boardCells("auto", 20)).toBe(cellCount(20));
    expect(boardCells("small", 80)).toBe(12);
    expect(boardCells("medium", 5)).toBe(20);
    expect(boardCells("large", 5)).toBe(35);
  });
});
