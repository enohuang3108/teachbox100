import { describe, expect, it } from "vitest";
import { decodeSetup, encodeSetup, type SharedSetup } from "./share";
import { DEFAULT_SETTINGS } from "./types";

const players = [
  {
    name: "小明",
    color: "#f43f5e",
    character: "cat",
    difficulty: "hard" as const,
  },
  { name: "小華", color: "#3b82f6", character: "dog" },
];

describe("分享連結", () => {
  it("設定、玩家、三種題型來回編碼不變", async () => {
    const setup: SharedSetup = {
      settings: {
        ...DEFAULT_SETTINGS,
        endCondition: { type: "laps", count: 3 },
      },
      players,
      questions: [
        {
          id: "q0",
          type: "choice",
          text: "3 × 4？",
          options: ["7", "12"],
          answer: "12",
          explanation: "3 組 4 個",
          difficulty: "easy",
        },
        { id: "q1", type: "boolean", text: "8 × 7 = 54。", answer: "否" },
        {
          id: "q2",
          type: "short",
          text: "7 × 9？",
          answer: "63 顆",
          difficulty: "normal",
        },
      ],
    };
    expect(await decodeSetup("#" + (await encodeSetup(setup)))).toEqual(setup);
  });

  it("預設題庫只帶設定，舊 persist 沒有的欄位維持 undefined", async () => {
    const setup: SharedSetup = {
      settings: {
        playerCount: 2,
        startingMoney: 8000,
        diceCount: 1,
        passStartBonus: 2000,
        endCondition: { type: "lastOneStanding" },
      },
      players,
      questions: null,
    };
    expect(await decodeSetup("#" + (await encodeSetup(setup)))).toEqual(setup);
  });

  it("壞掉的連結回 null", async () => {
    expect(await decodeSetup("#setup=%%%")).toBeNull();
    expect(await decodeSetup("#setup=AAAA")).toBeNull();
    expect(await decodeSetup("#other")).toBeNull();
  });
});

describe("分享連結的加分設定", () => {
  it("加分項目跟著連結走，沒開的項目維持沒開", async () => {
    const setup: SharedSetup = {
      settings: {
        ...DEFAULT_SETTINGS,
        bonuses: { land: 500, mostCorrect: 2000, mostFate: 300 },
      },
      players,
      questions: null,
    };
    expect(await decodeSetup("#" + (await encodeSetup(setup)))).toEqual(setup);
  });

  it("沒設加分時編碼跟舊版一樣，舊連結解出來沒有加分", async () => {
    const setup: SharedSetup = {
      settings: DEFAULT_SETTINGS,
      players,
      questions: null,
    };
    const withEmpty = await encodeSetup({
      ...setup,
      settings: { ...DEFAULT_SETTINGS, bonuses: {} },
    });
    expect(withEmpty).toBe(await encodeSetup(setup));
    const decoded = await decodeSetup("#" + withEmpty);
    expect(decoded?.settings.bonuses).toBeUndefined();
  });
});
