import { describe, expect, it } from "vitest";
import { BoxDraw } from "./box-draw";

describe("BoxDraw", () => {
  it("選球後可取消並把同一顆球放回", () => {
    const draw = new BoxDraw(3);

    expect(draw.select(1)).toBe(true);
    expect(draw.phase).toBe("selected");
    expect(draw.remainingIds).toEqual([0, 2]);

    expect(draw.cancel()).toBe(1);
    expect(draw.phase).toBe("ready");
    expect(draw.remainingIds).toEqual([0, 1, 2]);
  });

  it("只有打開後才能確認抽出並繼續", () => {
    const draw = new BoxDraw(2);

    draw.select(0);
    expect(draw.confirm()).toBeNull();
    expect(draw.open()).toBe(0);
    expect(draw.phase).toBe("revealed");
    expect(draw.confirm()).toBe(0);
    expect(draw.phase).toBe("ready");
    expect(draw.remainingIds).toEqual([1]);
  });

  it("最後一顆確認抽出後進入抽完狀態，也能放回", () => {
    const draw = new BoxDraw(1);

    draw.select(0);
    draw.open();
    expect(draw.confirm()).toBe(0);
    expect(draw.phase).toBe("empty");

    draw.restore(0);
    expect(draw.phase).toBe("ready");
    expect(draw.remainingIds).toEqual([0]);
  });
});
