import { describe, expect, it } from "vitest";
import type { Question } from "@/lib/questions/types";
import {
  answerQuestion,
  chooseCell,
  createGame,
  endAsDraw,
  markReady,
  playableOf,
  tickCooldown,
  tickCountdown,
  type GameState,
} from "./game";

const questions: Question[] = Array.from({ length: 6 }, (_, index) => ({
  id: `q${index + 1}`,
  type: index === 5 ? "boolean" : "choice",
  text: `第 ${index + 1} 題`,
  options: index === 5 ? undefined : ["甲", "乙"],
  answer: index === 5 ? "是" : "甲",
  difficulty: index < 2 ? "easy" : index < 4 ? "normal" : "hard",
  explanation: `第 ${index + 1} 題解析`,
}));

const start = () => {
  let state = createGame(questions, "hard", () => 0.37);
  state = markReady(state, "red");
  state = markReady(state, "blue");
  state = tickCountdown(tickCountdown(tickCountdown(state)));
  return state;
};

const correctMove = (state: GameState, side: "red" | "blue", cell: number) => {
  const question = state.lanes[side].current;
  expect(question).not.toBeNull();
  return chooseCell(answerQuestion(state, side, question!.answer), cell);
};

describe("圈叉搶答規則", () => {
  it("只使用難度上限內的選擇題與是非題", () => {
    const bank: Question[] = [
      ...questions,
      { id: "short", type: "short", text: "簡答", answer: "答案", difficulty: "easy" },
    ];

    expect(playableOf(bank, "normal").map((question) => question.id)).toEqual([
      "q1",
      "q2",
      "q3",
      "q4",
    ]);
  });

  it("兩隊各有一份完整題庫，開局題目不同", () => {
    const state = createGame(questions, "hard", () => 0);

    expect(state.lanes.red.queue).toHaveLength(6);
    expect(state.lanes.blue.queue).toHaveLength(6);
    expect(new Set(state.lanes.red.queue.map((q) => q.id))).toEqual(
      new Set(questions.map((q) => q.id)),
    );
    expect(new Set(state.lanes.blue.queue.map((q) => q.id))).toEqual(
      new Set(questions.map((q) => q.id)),
    );
    expect(state.lanes.red.current?.id).not.toBe(state.lanes.blue.current?.id);
  });

  it("雙方準備後倒數三拍才開放作答", () => {
    let state = createGame(questions, "hard", () => 0.2);
    state = markReady(state, "red");
    expect(state.phase).toBe("ready");
    state = markReady(state, "blue");
    expect(state).toMatchObject({ phase: "countdown", countdown: 3 });
    state = tickCountdown(tickCountdown(tickCountdown(state)));
    expect(state).toMatchObject({ phase: "quiz", countdown: null });
  });

  it("答錯只讓該隊冷卻三拍，另一隊仍可答對取得棋步", () => {
    let state = start();
    const redQuestion = state.lanes.red.current!;
    const blueQuestion = state.lanes.blue.current!;

    state = answerQuestion(state, "red", "錯誤答案");
    expect(state.lanes.red).toMatchObject({ cooldown: 3, feedback: { correct: false } });
    expect(state.phase).toBe("quiz");

    state = answerQuestion(state, "blue", blueQuestion.answer);
    expect(state).toMatchObject({ phase: "move", movingSide: "blue" });
    expect(tickCooldown(state, "red").lanes.red.cooldown).toBe(3);
    expect(state.lanes.red.current?.id).toBe(redQuestion.id);
  });

  it("先收到的正確答案鎖住全場，完成棋步後另一隊保留原題", () => {
    let state = start();
    const redAnswer = state.lanes.red.current!.answer;
    const blueQuestion = state.lanes.blue.current!;

    state = answerQuestion(state, "red", redAnswer);
    const ignored = answerQuestion(state, "blue", blueQuestion.answer);
    expect(ignored).toEqual(state);

    state = chooseCell(state, 0);
    expect(state.phase).toBe("quiz");
    expect(state.board[0]).toBe("red");
    expect(state.lanes.blue.current?.id).toBe(blueQuestion.id);
  });

  it("一隊放滿三枚後可把任一枚移到任一空格，不必等另一隊放滿", () => {
    let state = start();
    state = correctMove(state, "red", 0);
    state = correctMove(state, "red", 1);
    state = correctMove(state, "red", 4);

    state = answerQuestion(state, "red", state.lanes.red.current!.answer);
    state = chooseCell(state, 4);
    expect(state.selectedFrom).toBe(4);
    state = chooseCell(state, 8);

    expect(state.board).toEqual(["red", "red", null, null, null, null, null, null, "red"]);
    expect(state.board.filter((cell) => cell === "blue")).toHaveLength(0);
  });

  it.each([
    [0, 1, 2],
    [0, 3, 6],
    [0, 4, 8],
    [2, 4, 6],
  ])("三枚棋在 %s、%s、%s 連線就獲勝", (a, b, c) => {
    let state = start();
    state = correctMove(state, "red", a);
    state = correctMove(state, "red", b);
    state = correctMove(state, "red", c);

    expect(state).toMatchObject({ phase: "over", result: "red" });
    expect(state.winningLine).toEqual([a, b, c]);
  });

  it("兩隊題庫都耗盡才和局，老師也能手動判和", () => {
    let state = start();
    state = {
      ...state,
      lanes: {
        red: { ...state.lanes.red, current: null, index: 6, exhausted: true },
        blue: { ...state.lanes.blue, current: null, index: 6, exhausted: true },
      },
    };
    // 下一個被接受的狀態轉移會收斂成和局。
    state = tickCooldown(state, "red");
    expect(state).toMatchObject({ phase: "over", result: "draw" });

    expect(endAsDraw(start())).toMatchObject({ phase: "over", result: "draw" });
  });
});
