import { describe, expect, it } from "vitest";
import { encodeNumber, isValidGuess, nextRange } from "./game";

describe("morse number game", () => {
  it("encodes every digit in a number", () => {
    expect(encodeNumber(42)).toBe("....-   ..---");
    expect(encodeNumber(100)).toBe(".----   -----   -----");
  });

  it("narrows the range after each wrong guess", () => {
    expect(nextRange(30, 72)).toEqual({ low: 31, high: 100 });
    expect(nextRange(80, 72, { low: 31, high: 100 })).toEqual({ low: 31, high: 79 });
  });

  it("accepts only guesses from 1 to 100", () => {
    expect(isValidGuess(1)).toBe(true);
    expect(isValidGuess(100)).toBe(true);
    expect(isValidGuess(0)).toBe(false);
    expect(isValidGuess(1.5)).toBe(false);
  });
});
