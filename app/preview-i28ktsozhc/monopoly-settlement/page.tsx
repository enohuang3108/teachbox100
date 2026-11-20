import type { Metadata } from "next";
import { SettlementDemo } from "./SettlementDemo";

// 用假資料直接看大富翁結算頁，之後優化畫面用，不用真的玩完一局。
// 正式站也開得到，但不放任何入口、不進 sitemap（只收 pages.config 的頁），網址刻意難猜，也不給搜尋引擎收
export const metadata: Metadata = {
  title: "結算預覽",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <SettlementDemo />;
}
