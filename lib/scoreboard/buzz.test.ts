import { describe, expect, it } from "vitest";
import {
  addPlayer,
  nextOrder,
  synchronizeNewPeer,
  STATE_RETRY_MS,
} from "./buzz";

const a = { id: "a", uid: "u-a", name: "小明" };
const b = { id: "b", uid: "u-b", name: "小華" };
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
  it("新的裝置排到最後面", () => {
    expect(addPlayer([a], "b", { uid: "u-b", name: "小華" })).toEqual([a, b]);
  });

  it("同一台裝置重連只換 peer id，順位不動（分數才不會跑掉）", () => {
    expect(addPlayer([a, b], "a2", { uid: "u-a", name: "小明" })).toEqual([
      { ...a, id: "a2" },
      b,
    ]);
  });

  it("同名的兩個學生各佔一格：不然被擠掉的那個按鈴老師端不會顯示", () => {
    const both = addPlayer([a], "b", { uid: "u-b", name: "小明" });
    expect(both).toHaveLength(2);
    expect(both[0].id).toBe("a");
  });

  it("都沒填名字也是兩個人，不會互相擠掉", () => {
    const both = addPlayer(
      addPlayer([], "p1", { uid: "u-1", name: "" }),
      "p2",
      { uid: "u-2", name: "  " },
    );
    expect(both.map((p) => p.name)).toEqual(["同學", "同學"]);
    expect(both.map((p) => p.id)).toEqual(["p1", "p2"]);
  });

  it("改了名字再連，還是同一格", () => {
    expect(addPlayer([a], "a2", { uid: "u-a", name: "阿明" })).toEqual([
      { id: "a2", uid: "u-a", name: "阿明" },
    ]);
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
