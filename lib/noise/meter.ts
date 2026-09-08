/**
 * 噪音計的純數學。麥克風給的是 -1..1 的波形取樣，
 * 這裡把它換成 0..100 的音量刻度，不是真的分貝（沒有校準過的參考聲壓）。
 */

/** 顯示範圍：安靜教室約 -60 dBFS，全班喧嘩約 -12 dBFS */
const DB_FLOOR = -60;
const DB_CEIL = -12;

export const SEGMENTS = 24;

/** 一段取樣的均方根振幅 */
export function rms(samples: Float32Array): number {
  let sum = 0;
  for (const v of samples) sum += v * v;
  return Math.sqrt(sum / samples.length);
}

/** 振幅換成 0..100 的刻度 */
export function toLevel(amplitude: number): number {
  if (amplitude <= 0) return 0;
  const db = 20 * Math.log10(amplitude);
  const ratio = (db - DB_FLOOR) / (DB_CEIL - DB_FLOOR);
  return Math.min(100, Math.max(0, ratio * 100));
}

/**
 * 指針平滑：漲得快、落得慢，跟真的 VU 表一樣。
 * 兩邊同速的話一有人咳嗽整條就閃一下，看不出趨勢。
 */
export function smooth(prev: number, next: number): number {
  const k = next > prev ? 0.5 : 0.08;
  return prev + (next - prev) * k;
}

/** 刻度落在哪一區，決定配色與表情 */
export function zoneOf(level: number, limit: number): "quiet" | "ok" | "loud" {
  if (level >= limit) return "loud";
  if (level >= limit * 0.7) return "ok";
  return "quiet";
}
