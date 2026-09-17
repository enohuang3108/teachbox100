import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { encodeSetup } from "@/lib/monopoly/share";
import { DEFAULT_SETTINGS } from "@/lib/monopoly/types";
import { POST } from "./route";

const allowCreate = vi.fn();
const createShortLink = vi.fn();
vi.mock("@/lib/short-link", () => ({
  allowCreate: (...a: unknown[]) => allowCreate(...a),
  createShortLink: (...a: unknown[]) => createShortLink(...a),
}));

let validHash = "";
beforeAll(async () => {
  validHash = await encodeSetup({
    settings: DEFAULT_SETTINGS,
    players: [{ name: "小明", color: "#f43f5e", character: "cat" }],
    questions: null,
  });
});

const post = (body: unknown) =>
  POST(
    new Request("http://x/api/share", {
      method: "POST",
      headers: { "x-forwarded-for": "1.2.3.4, 10.0.0.1" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );

beforeEach(() => {
  allowCreate.mockReset().mockResolvedValue(true);
  createShortLink
    .mockReset()
    .mockResolvedValue({ id: "abcdEFGH", expiresAt: 1 });
});

describe("POST /api/share", () => {
  it("建立成功回 id，次數用第一個 IP 計", async () => {
    const res = await post({ unit: "monopoly", hash: validHash });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: "abcdEFGH", expiresAt: 1 });
    expect(allowCreate).toHaveBeenCalledWith("1.2.3.4");
  });

  // 表格在收集測試時就建好，那時 validHash 還沒算出來，所以每列給函式、跑的時候才取值
  it.each([
    ["不是 JSON", () => "{"],
    ["未知單元", () => ({ unit: "timer", hash: validHash })],
    ["單元和內容對不上", () => ({ unit: "wheel", hash: validHash })],
    ["壞掉的 payload", () => ({ unit: "monopoly", hash: "setup=AAAA" })],
  ])("%s 回 400，不碰 Redis", async (_, body) => {
    expect((await post(body())).status).toBe(400);
    expect(allowCreate).not.toHaveBeenCalled();
  });

  it("超過 64KB 回 413，不碰 Redis", async () => {
    const res = await post({
      unit: "monopoly",
      hash: "setup=" + "A".repeat(64_001),
    });
    expect(res.status).toBe(413);
    expect(allowCreate).not.toHaveBeenCalled();
  });

  it("超過次數回 429，不建立", async () => {
    allowCreate.mockResolvedValue(false);
    expect((await post({ unit: "monopoly", hash: validHash })).status).toBe(
      429,
    );
    expect(createShortLink).not.toHaveBeenCalled();
  });

  it("Redis 出錯回 503", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    createShortLink.mockRejectedValue(new Error("down"));
    expect((await post({ unit: "monopoly", hash: validHash })).status).toBe(
      503,
    );
  });
});
