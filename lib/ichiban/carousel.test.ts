import { describe, expect, it } from "vitest";
import { carouselRotationFromDrag, carouselTargetForIndex, snapCarousel } from "./carousel";

describe("一番賞 3D 輪播規則", () => {
  it("左右拖曳會以穩定靈敏度改變旋轉角度", () => {
    expect(carouselRotationFromDrag(-60, 100)).toBe(-40);
    expect(carouselRotationFromDrag(-60, -100)).toBe(-80);
  });

  it("放手後吸附最近的票券，並回傳循環後的正確索引", () => {
    expect(snapCarousel(-92, 6)).toEqual({ rotation: -120, index: 2 });
    expect(snapCarousel(61, 6)).toEqual({ rotation: 60, index: 5 });
    expect(snapCarousel(-361, 6)).toEqual({ rotation: -360, index: 0 });
  });

  it("點擊票券時選擇離目前角度最近的同一圈目標", () => {
    expect(carouselTargetForIndex(5, 6, 50)).toBe(60);
    expect(carouselTargetForIndex(0, 6, -355)).toBe(-360);
  });
});
