"use client";

import { IchibanCarousel } from "./IchibanCarousel";
import { IchibanPrizeList } from "./IchibanPrizeList";

// 選票、轉橫放大、撕票都在同一個 3D 場景裡完成，中間不換 canvas。
export function IchibanExperience() {
  return (
    // 列表跟扭蛋機、轉盤的抽籤紀錄一樣浮在左上角，不佔版面
    <div>
      <IchibanPrizeList />
      <IchibanCarousel />
    </div>
  );
}
