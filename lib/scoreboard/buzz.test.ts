import { describe, expect, it } from "vitest";
import {
  addPlayer,
  nextOrder,
  synchronizeNewPeer,
  STATE_RETRY_MS,
} from "./buzz";

const a = { id: "a", name: "小明" };
const b = { id: "b", name: "小華" };
const base = { open: true, players: [a, b], order: [] };

describe("nextOrder", () => {
  it("依按鈴先後排序", () => {
    const first = nextOrder(base, "b")!;
    expect(first).toEqual([b]);
    expect(nextOrder({ ...base, order: first }, "a")).toEqual([b, a]);
  });

  it("沒開放搶答時不計", () => {
    expect(nextOrder({ ...base, open: false }, "a")).toBeNull();
  });

  it("沒報到的 peer 不計", () => {
    expect(nextOrder(base, "ghost")).toBeNull();
  });

  it("同一個人按第二次不計", () => {
    expect(nextOrder({ ...base, order: [a] }, "a")).toBeNull();
  });
});

describe("addPlayer", () => {
  it("新名字排到最後面", () => {
    expect(addPlayer([a], "b", "小華")).toEqual([a, b]);
  });

  it("同名重連只換 peer id，順位不動（分數才不會跑掉）", () => {
    expect(addPlayer([a, b], "a2", "小明")).toEqual([{ ...a, id: "a2" }, b]);
  });

  it("空白名字給預設值", () => {
    expect(addPlayer([], "x", "  ")[0].name).toBe("同學");
  });
});

describe("synchronizeNewPeer", () => {
  it("新 peer 一建立資料通道就先收到目前狀態，不等待固定半秒", () => {
    const sent: string[] = [];
    const scheduled: { delay: number; task: () => void }[] = [];

    synchronizeNewPeer(
      () => sent.push("state"),
      (task, delay) => void scheduled.push({ task, delay }),
    );

    expect(sent).toEqual(["state"]);
    expect(scheduled).toHaveLength(1);
    expect(scheduled[0].delay).toBe(STATE_RETRY_MS);
  });
});
