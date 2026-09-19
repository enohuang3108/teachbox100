import assert from "node:assert/strict";
import test from "node:test";

import { assertMatrixRows, parseArguments } from "./verify-change.mjs";

test("parses a declared proof and its command", () => {
  assert.deepEqual(
    parseArguments([
      "--matrix",
      "計分板",
      "--behavior",
      "搶答排序正確",
      "--seam",
      "unit",
      "--",
      "pnpm",
      "test",
      "--",
      "lib/scoreboard/game.test.ts",
    ]),
    {
      matrix: ["計分板"],
      behavior: "搶答排序正確",
      seam: "unit",
      command: ["pnpm", "test", "--", "lib/scoreboard/game.test.ts"],
    },
  );
});

test("accepts pnpm's leading argument separator", () => {
  assert.equal(
    parseArguments([
      "--",
      "--matrix",
      "計分板",
      "--behavior",
      "搶答排序正確",
      "--seam",
      "unit",
      "--",
      "pnpm",
      "test",
    ]).matrix[0],
    "計分板",
  );
});

test("requires a known seam and a command", () => {
  assert.throws(
    () => parseArguments(["--matrix", "計分板", "--behavior", "排序", "--seam", "browser"]),
    /unit or e2e/,
  );
});

test("accepts only matrix rows that still exist", () => {
  assert.doesNotThrow(() => assertMatrixRows(["計分板"], "| 計分板 | rules | devices |"));
  assert.throws(() => assertMatrixRows(["不存在"], "| 計分板 | rules | devices |"));
});
