import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { encodeSetup } from "@/lib/monopoly/share";
import { DEFAULT_SETTINGS } from "@/lib/monopoly/types";
import { territoryShare } from "@/lib/territory/share";
import { timerShare } from "@/lib/timer/share";
import { GET } from "./route";

const peekShortLink = vi.fn();
vi.mock("@/lib/short-link", () => ({
  peekShortLink: (...a: unknown[]) => peekShortLink(...a),
}));

const get = (id: string) =>
  GET(new Request(`http://x/api/share/${id}`), {
    params: Promise.resolve({ id }),
  });

let monopolyDefault = "";
let territoryCustom = "";
let timer = "";
beforeAll(async () => {
  monopolyDefault = await encodeSetup({
    settings: DEFAULT_SETTINGS,
    players: [{ name: "小明", color: "#f43f5e", character: "cat" }],
    questions: null,
  });
  territoryCustom = await territoryShare.encode({
    bank: [
      {
        id: "q1",
        type: "choice",
        text: "1+1",
        options: ["1", "2"],
        answer: "2",
      },
    ],
    cap: "hard",
    names: ["紅", "藍"],
    countdown: 3,
    size: "auto",
    title: "三年級加法",
  });
  timer = await timerShare.encode({
    mode: "timer",
    seconds: 60,
    date: "2026-10-19",
    slots: [],
    warnMin: 1,
  });
});

beforeEach(() => {
  peekShortLink.mockReset();
});

describe("GET /api/share/[id]", () => {
  it("回遊戲名稱與自訂題庫名稱", async () => {
    peekShortLink.mockResolvedValue(`quiz-territory#${territoryCustom}`);
    const res = await get("abcdEFGH");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ game: "領地戰", bank: "三年級加法" });
    expect(peekShortLink).toHaveBeenCalledWith("abcdEFGH");
  });

  it("沒帶題目的出題遊戲標內建題庫", async () => {
    peekShortLink.mockResolvedValue(`monopoly#${monopolyDefault}`);
    expect(await (await get("abcdEFGH")).json()).toMatchObject({
      bank: "內建題庫",
    });
  });

  it("沒有題庫的單元不回 bank", async () => {
    peekShortLink.mockResolvedValue(`timer#${timer}`);
    expect(await (await get("abcdEFGH")).json()).not.toHaveProperty("bank");
  });

  it("格式不對回 400，不碰 Redis", async () => {
    expect((await get("abc")).status).toBe(400);
    expect(peekShortLink).not.toHaveBeenCalled();
  });

  it("找不到或內容壞掉回 404", async () => {
    peekShortLink.mockResolvedValue(null);
    expect((await get("abcdEFGH")).status).toBe(404);
    peekShortLink.mockResolvedValue("monopoly#setup=AAAA");
    expect((await get("abcdEFGH")).status).toBe(404);
  });

  it("Redis 連不上回 503", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    peekShortLink.mockRejectedValue(new Error("down"));
    expect((await get("abcdEFGH")).status).toBe(503);
  });
});
