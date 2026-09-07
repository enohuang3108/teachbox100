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
