// 盤面欄數。一般頁面跟全螢幕的目標不同：前者要整齊的矩形，後者要把牌放到最大。

/** 讓盤面盡量排成整齊的矩形：先取 √n，除不盡就再多一欄試試，上限 6 */
export function columnsFor(n: number): number {
  const base = Math.min(6, Math.max(2, Math.ceil(Math.sqrt(n))));
  return n % base !== 0 && base < 6 && n % (base + 1) === 0 ? base + 1 : base;
}

/** 牌是 3:4 直式 */
const CARD_ASPECT = 3 / 4;

/**
 * 全螢幕：在 width × height 的空間裡，試每一種欄數，挑讓單張牌最大的那個。
 * 寬度或高度誰先頂到就以誰為準，所以不會算出塞不下的欄數。
 */
export function fullscreenColumnsFor(n: number, width: number, height: number): number {
  if (n <= 1) return 1;
  let best = 1;
  let bestSize = 0;
  for (let cols = 1; cols <= n; cols++) {
    const rows = Math.ceil(n / cols);
    const size = Math.min(width / cols, (height / rows) * CARD_ASPECT);
    if (size > bestSize) {
      bestSize = size;
      best = cols;
    }
  }
  return best;
}

/** 估字寬：中日韓全形字算 1em，英數半形約 0.62em */
const textUnits = (s: string) =>
  Array.from(s).reduce((n, ch) => n + (ch.charCodeAt(0) < 0x2e80 ? 0.62 : 1), 0);

/**
 * 卡面字級，回傳「牌寬的幾倍」，畫面用 cqw 套上去，所以一般頁與全螢幕同一套。
 * 字少就大（上限 0.36），字多照面積縮：寬 0.9、高 4/3（3:4 牌）、行高 1.25 再留一成餘裕；
 * 最長的英數單字還得一行放得下，英文長字才不會被拆成兩行。
 */
export function faceFontScale(text: string): number {
  const units = Math.max(1, textUnits(text));
  // 短詞一行放得下就別折行：「冰淇淋」折成兩行比稍微小一點難讀
  const oneLine = 0.9 / units;
  if (oneLine >= 0.2) return Math.min(0.36, oneLine);
  const byArea = Math.sqrt((0.9 * (4 / 3)) / (1.25 * 1.1 * units));
  // 只有英數連在一起的才算單字，中文字之間本來就能斷行
  const words = text.match(/[^\s\u2e80-\uffff]+/g) ?? [];
  const longest = Math.max(1, ...words.map(textUnits));
  return Math.min(0.36, byArea, 0.9 / longest);
}
