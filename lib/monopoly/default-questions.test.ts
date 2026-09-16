import { describe, expect, it } from "vitest";
import { DEFAULT_QUESTIONS } from "./default-questions";
import { difficultyOf } from "./types";

describe("預設題庫", () => {
  it("簡單、普通、困難各 10 題", () => {
    const count = (d: string) =>
      DEFAULT_QUESTIONS.filter((q) => difficultyOf(q) === d).length;
    expect([count("easy"), count("normal"), count("hard")]).toEqual([10, 10, 10]);
  });
});
