import { describe, expect, it } from "vitest";
import { defineCodec, US } from "@/lib/share/codec";
import { territoryShare } from "./share";

// 直接把一段原始文字包成分享連結，模擬舊版產生的連結
const raw = defineCodec<string>(
  (text) => text,
  (text) => text,
);

describe("territoryShare", () => {
  it("加入倒數設定之前的舊連結照樣打得開，倒數用 3 秒", async () => {
    const hash = await raw.encode(["1", "h", "藍隊", "紅隊", "d"].join(US));
    const setup = await territoryShare.decode("#" + hash);
    expect(setup?.countdown).toBe(3);
    expect(setup?.size).toBe("auto");
    expect(setup?.names).toEqual(["藍隊", "紅隊"]);
  });

  it("倒數收 3、4、5 秒，其他值當壞連結", async () => {
    for (const seconds of [3, 4, 5]) {
      const valid = await raw.encode(["1", "h", "藍隊", "紅隊", "d", String(seconds)].join(US));
      expect((await territoryShare.decode("#" + valid))?.countdown).toBe(seconds);
    }
    const hash = await raw.encode(["1", "h", "藍隊", "紅隊", "d", "7"].join(US));
    expect(await territoryShare.decode("#" + hash)).toBeNull();
  });
});
