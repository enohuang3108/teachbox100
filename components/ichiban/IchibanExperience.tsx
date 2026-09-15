"use client";

import { IchibanCarousel } from "./IchibanCarousel";
import { IchibanPrizeList } from "./IchibanPrizeList";

// 選票、轉橫放大、撕票都在同一個 3D 場景裡完成，中間不換 canvas。
export function IchibanExperience() {
  return (
    <div className="grid items-start gap-5 lg:-ml-24 lg:grid-cols-[15rem_minmax(0,1fr)] xl:-ml-56">
      <IchibanPrizeList />
      <IchibanCarousel />
    </div>
  );
}
