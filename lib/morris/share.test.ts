import { describe, expect, it } from "vitest";
import { defineCodec, RS, US } from "@/lib/share/codec";
import { morrisShare, type MorrisSetup } from "./share";

const rawShare = defineCodec<string>((text) => text, (text) => text);

const setup: MorrisSetup = {
  cap: "normal",
  names: ["紅鶴隊", "藍鯨隊"],
  bank: [
    {
      id: "q0",
      type: "choice",
      text: "哪一個是水果？",
      options: ["蘋果", "鉛筆"],
      answer: "蘋果",
      difficulty: "easy",
      explanation: "蘋果是水果。",
    },
  ],
};

describe("圈叉搶答分享設定", () => {
  it("來回編碼保留題庫、難度與隊名", async () => {
    const hash = await morrisShare.encode(setup);
    expect(await morrisShare.decode(hash)).toEqual(setup);
  });

  it("內建題庫不塞進連結", async () => {
    const builtIn = { ...setup, bank: null };
    const hash = await morrisShare.encode(builtIn);
    expect(await morrisShare.decode(hash)).toEqual(builtIn);
  });

  it("壞掉的連結不採用", async () => {
    expect(await morrisShare.decode("#setup=%%%")).toBeNull();
  });

  it.each([
    ["缺少欄位", ["1", "n", "紅隊", "藍隊"].join(US)],
    ["未知題庫來源", ["1", "n", "紅隊", "藍隊", "x"].join(US)],
    ["空隊名", ["1", "n", "", "藍隊", "d"].join(US)],
    ["過長隊名", ["1", "n", "這是一個超過十二個字的紅隊名稱", "藍隊", "d"].join(US)],
    ["內建題庫卻夾帶題目", [["1", "n", "紅隊", "藍隊", "d"].join(US), "多餘資料"].join(RS)],
  ])("%s 的分享內容不採用", async (_label, raw) => {
    expect(await morrisShare.decode(await rawShare.encode(raw))).toBeNull();
  });
});
