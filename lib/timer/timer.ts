/** 計時器的純邏輯。倒數走 deadline 時間戳，不累加 tick —— 分頁被節流也不會走慢。 */

export const PRESETS = [60, 180, 300, 600, 900] as const;

/** 剩下不到這個秒數就進入警示配色與加速的節拍 */
export const WARN_AT = 10;

export const MAX_SECONDS = 99 * 60 + 59;

/** 把秒數格式化成 MM:SS；負數一律當 0。超過 99 分就變三位數（考試模式排整個上午） */
export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.ceil(seconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

/** 進度環的比例：1 是滿的（剛開始），0 是走完 */
export function progress(remaining: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, remaining / total));
}

/** 加時間：夾在 0 與上限之間，老師連按也不會爆表 */
export function addSeconds(current: number, delta: number): number {
  return Math.min(MAX_SECONDS, Math.max(0, current + delta));
}
