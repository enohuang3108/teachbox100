import { describe, expect, it } from "vitest";
import { seqRng } from "@/lib/monopoly/rng";
import {
  faceLabel,
  MAX_DICE,
  MAX_FACE_LENGTH,
  rollDice,
  STARTER_FACES,
  validateFaces,
} from "./game";

describe("rollDice", () => {
  it("每顆都是 1 到 6，顆數照設定", () => {
    expect(rollDice(3, seqRng([0, 0.5, 0.999]))).toEqual([1, 4, 6]);
  });

  it("顆數夾在 1 到上限之間", () => {
    expect(rollDice(0, seqRng([0]))).toHaveLength(1);
    expect(rollDice(99, seqRng([0]))).toHaveLength(MAX_DICE);
  });
});

describe("validateFaces", () => {
  it("預設的六面文字合法", () => {
    expect(STARTER_FACES).toHaveLength(6);
    expect(validateFaces(STARTER_FACES)).toBeUndefined();
  });

  it("空白的面要填", () => {
    const faces = [...STARTER_FACES];
    faces[2] = "  ";
    expect(validateFaces(faces)).toBe("第 3 面還沒填");
  });

  it("太長的字貼不上骰面", () => {
    const faces = [...STARTER_FACES];
    faces[0] = "一".repeat(MAX_FACE_LENGTH + 1);
    expect(validateFaces(faces)).toBe(`第 1 面超過 ${MAX_FACE_LENGTH} 個字`);
  });
});

describe("faceLabel", () => {
  it("數字骰顯示點數，文字骰顯示那一面的字", () => {
    expect(faceLabel(4, "number", STARTER_FACES)).toBe("4");
    expect(faceLabel(4, "text", ["a", "b", "c", " 唱歌 ", "e", "f"])).toBe("唱歌");
  });
});
