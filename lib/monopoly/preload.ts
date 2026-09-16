import { BOARD } from "./board";
import { CHARACTERS } from "./characters";

let started = false;

/** 老師在填設定時背景抓遊戲要用的程式碼與素材，按下開始就不用等 */
export function preloadMonopoly() {
  if (started) return;
  started = true;
  void import("@/components/monopoly/MonopolyGame");
  // 直接解析好模型與動作檔留在記憶體；只 fetch 會被 max-age=0 逼著擲骰時再抓一次
  import("@/components/monopoly/DiceScene")
    .then((m) => m.loadAssets())
    .catch(() => {}); // 失敗就等擲骰時再載，DiceScene 自己有退回 emoji
  const images = [
    ...BOARD.flatMap((t) => ("image" in t && t.image ? [t.image] : [])),
    ...CHARACTERS.map((c) => c.src),
    "/images/monopoly/chance-v2.webp",
    "/images/monopoly/fate-v2.webp",
  ];
  for (const src of new Set(images)) new Image().src = src;
}
