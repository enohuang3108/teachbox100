import { describe, expect, it } from "vitest";
import { drawQuestion, playableQuestions, rangeError, resolveGuess, resolveRoundGuess, rulerStep, startRound } from "./game";

describe("ultimate password game", () => {
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
    expect(drawQuestion(questions, null, () => 0.75).question).toEqual(questions[0]);
  });

  it("keeps one hidden password while questions change between guesses", () => {
    const round = startRound({}, () => 0.11); // secret 12
    const afterWrongGuess = resolveRoundGuess(50, round);
    expect(afterWrongGuess.round).toMatchObject({
      secret: 12,
      range: { low: 1, high: 49 },
    });
    expect(resolveRoundGuess(12, afterWrongGuess.round).correct).toBe(true);
  });

  it("hides the password inside the teacher's range and accepts guesses only there", () => {
    const bounds = { low: 200, high: 500 };
    expect(startRound({ bounds }, () => 0).secret).toBe(200);
    expect(startRound({ bounds }, () => 0.9999).secret).toBe(500);
    const round = startRound({ bounds }, () => 0.5);
    expect(round.range).toEqual(bounds);
    expect(resolveRoundGuess(100, round).valid).toBe(false);
    expect(resolveRoundGuess(501, round).valid).toBe(false);
    expect(resolveRoundGuess(200, round).valid).toBe(true);
  });

  it("rejects a range that is reversed, too narrow, fractional or out of 0 to 1000", () => {
    expect(rangeError({ low: 1, high: 100 })).toBeNull();
    expect(rangeError({ low: 0, high: 1000 })).toBeNull();
    expect(rangeError({ low: 50, high: 10 })).not.toBeNull();
    expect(rangeError({ low: 1, high: 9 })).not.toBeNull();
    expect(rangeError({ low: 1.5, high: 100 })).not.toBeNull();
    expect(rangeError({ low: -1, high: 100 })).not.toBeNull();
    expect(rangeError({ low: 1, high: 1001 })).not.toBeNull();
  });

  it("sets the deadline from the time limit, none when untimed", () => {
    expect(startRound({ minutes: 5 }, Math.random, 1000).endsAt).toBe(1000 + 5 * 60_000);
    expect(startRound({ minutes: 0 }, Math.random, 1000).endsAt).toBeNull();
  });

  it("keeps about twenty ruler ticks as the range grows", () => {
    expect(rulerStep({ low: 1, high: 100 })).toBe(5);
    expect(rulerStep({ low: 1, high: 20 })).toBe(1);
    expect(rulerStep({ low: 0, high: 1000 })).toBe(50);
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


it("出完整份才重新洗牌，還原進度後繼續未出的題目", () => {
  const questions = ["a", "b", "c"].map(id => ({ id, type: "boolean" as const, text: id, answer: "是" }));
  let deck: import("@/lib/questions/deck").QuestionDeck | null = null;
  const ids: string[] = [];
  for (let i = 0; i < 9; i++) {
    const result = drawQuestion(questions, deck, () => 0);
    ids.push(result.question!.id);
    deck = JSON.parse(JSON.stringify(result.questionDeck));
  }
  for (let i = 0; i < ids.length; i += 3) expect(new Set(ids.slice(i, i + 3)).size).toBe(3);
});
