import { describe, expect, it } from "vitest";
import { drawQuestion, isValidGuess, nextRange, playableQuestions, resolveGuess, resolveRoundGuess, startRound } from "./game";

describe("ultimate password game", () => {
  it("wrong guesses narrow the range around the numeric answer", () => {
    expect(nextRange(30, 72)).toEqual({ low: 31, high: 100 });
    expect(nextRange(80, 72, { low: 31, high: 100 })).toEqual({ low: 31, high: 79 });
  });

  it("accepts only guesses from 1 to 100", () => {
    expect(isValidGuess(1)).toBe(true);
    expect(isValidGuess(100)).toBe(true);
    expect(isValidGuess(0)).toBe(false);
    expect(isValidGuess(1.5)).toBe(false);
  });

  it("narrows range for a wrong guess and marks the exact answer", () => {
    expect(resolveGuess(30, 72, { low: 1, high: 100 })).toEqual({
      correct: false,
      valid: true,
      range: { low: 31, high: 100 },
    });
    expect(resolveGuess(72, 72, { low: 31, high: 100 })).toMatchObject({
      correct: true,
      valid: true,
    });
  });

  it("keeps the number input domain at 1 to 100 after the hint narrows", () => {
    expect(resolveGuess(20, 72, { low: 31, high: 100 })).toEqual({
      correct: false,
      valid: true,
      range: { low: 31, high: 100 },
    });
  });

  it("draws a question from the selected bank", () => {
    const questions = [
      { id: "a", type: "short" as const, text: "A", answer: "10" },
      { id: "b", type: "short" as const, text: "B", answer: "20" },
    ];
    expect(drawQuestion(questions, () => 0.75)).toEqual(questions[1]);
  });

  it("keeps one hidden password while questions change between guesses", () => {
    const round = startRound(() => 0.11); // secret 12
    const afterWrongGuess = resolveRoundGuess(50, round);
    expect(afterWrongGuess.round).toEqual({
      secret: 12,
      range: { low: 1, high: 49 },
    });
    expect(resolveRoundGuess(12, afterWrongGuess.round).correct).toBe(true);
  });

  it("keeps the hint unchanged when a guess falls outside it", () => {
    expect(resolveGuess(56, 12, { low: 1, high: 49 })).toEqual({
      correct: false,
      valid: true,
      range: { low: 1, high: 49 },
    });
  });

  it("allows choice and boolean questions regardless of their answer text", () => {
    const questions = [
      { id: "choice", type: "choice" as const, text: "A", options: ["12", "13"], answer: "12" },
      { id: "boolean", type: "boolean" as const, text: "B", answer: "是" },
      { id: "short", type: "short" as const, text: "C", answer: "42" },
    ];
    expect(playableQuestions(questions).map((q) => q.id)).toEqual(["choice", "boolean"]);
  });
});
