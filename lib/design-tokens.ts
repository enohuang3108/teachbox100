/**
 * 給 canvas 與 JS 用的色票。`styles/globals.css` 是唯一的權威來源 ——
 * canvas 2D 與 particle 引擎吃不到 CSS 變數，只能拿實色，這份就是那份副本。
 *
 * 兩邊的值由 `lib/design-tokens.test.ts` 比對，改了 CSS 沒同步這裡會紅。
 * DOM 與 SVG 不要 import 這裡：用 `bg-brand-red`、`fill="var(--brand-red)"`，
 * 那條路徑會跟著暗色模式走，這份常數不會。
 */
export const BRAND = {
  paper: "#fdfcf8",
  paperWarm: "#f8f0e3",
  sand: "#ede6d8",
  stone: "#beb9b1",
  ink: "#020d15",
  inkSoft: "#4a5560",
  yellow: "#f8b003",
  red: "#cb2108",
  blue: "#02569b",
  green: "#2c5427",
} as const;

/** 暗色的品牌四色。畫在暗底上的 canvas 用這組，亮色那組在暗底會太重。 */
export const BRAND_DARK = {
  yellow: "#f8b003",
  red: "#e4522f",
  blue: "#3e92d6",
  green: "#6fa24e",
} as const;
