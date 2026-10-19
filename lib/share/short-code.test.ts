import { describe, expect, it } from "vitest";
import { shareCodeFrom } from "./short-code";

describe("shareCodeFrom", () => {
  it.each([
    ["abcdEFGH", "abcdEFGH"],
    ["  s/abcdEFGH ", "abcdEFGH"],
    ["https://teachbox100.com/s/abcdEFGH", "abcdEFGH"],
    ["https://teachbox100.com/s/abcdEFGH/", "abcdEFGH"],
  ])("%s → %s，大小寫原樣", (input, code) => {
    expect(shareCodeFrom(input)).toBe(code);
  });

  it.each(["abcdEFG", "abcdEFGHi", "s/abcd-EFG", ""])("%s 不是代碼", (input) => {
    expect(shareCodeFrom(input)).toBeNull();
  });
});
