import { describe, expect, it } from "vitest";
import { Quaternion, Vector3 } from "three";
import { orientDie, readTopFace } from "./dice";

describe("骰子落定結果", () => {
  it("兩種落定方向的六個結果，朝上點數都等於遊戲點數", () => {
    const landings = [new Quaternion(), new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2)];
    for (const landing of landings) {
      for (let value = 1; value <= 6; value++) {
        expect(readTopFace(landing.clone().multiply(orientDie(value, landing)))).toBe(value);
      }
    }
  });
});

it("Blender 左右落定軌跡的所有點數組合，都以指定實體面朝上", async () => {
  const { readFileSync } = await import("node:fs");
  const { tracks } = JSON.parse(readFileSync("public/3d_model/monopoly-dice-motion.json", "utf8")) as { tracks: number[][][] };
  for (const track of tracks) {
    const landing = new Quaternion().fromArray(track.at(-1)!, 3);
    for (let value = 1; value <= 6; value++) {
      expect(readTopFace(landing.clone().multiply(orientDie(value, landing)))).toBe(value);
    }
  }
});

it("動畫時鐘在起點之前或終點之後，仍保持有效的骰子姿態", async () => {
  const { sampleDie } = await import("./dice");
  const track = [[0, 1, 0, 0, 0, 0, 1], [2, 1, 0, 0, 0, 0, 1]];
  expect(sampleDie(track, -0.1).position.toArray()).toEqual([0, 1, 0]);
  expect(sampleDie(track, 10).position.toArray()).toEqual([2, 1, 0]);
  expect(sampleDie(track, 0.5).position.toArray()).toEqual([1, 1, 0]);
});
