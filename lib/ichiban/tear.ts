export const TEAR_REVEAL_THRESHOLD = 0.62;
export const TEAR_SOUND_SEGMENTS = 14;
const SILENT_START_SEGMENTS = 1;
const SILENT_END_SEGMENTS = 2;

export type TearResult = "closed" | "revealed";

export function tearProgress(startX: number, currentX: number, travel: number): number {
  if (travel <= 0) return 0;
  return Math.min(1, Math.max(0, (currentX - startX) / travel));
}

export function prizeRevealProgress(progress: number): number {
  return Math.min(1, Math.max(0, progress));
}

/** 將撕開距離均分為固定格數，音效判斷不受螢幕／票券寬度影響。 */
export function tearSoundSegment(progress: number): number {
  return Math.floor(prizeRevealProgress(progress) * TEAR_SOUND_SEGMENTS);
}

export function shouldPlayTearTick(segment: number): boolean {
  return (
    segment > SILENT_START_SEGMENTS &&
    segment <= TEAR_SOUND_SEGMENTS - SILENT_END_SEGMENTS
  );
}

export function fitPrizeTextSize(
  measuredWidth: number,
  availableWidth: number,
  preferredSize: number,
  minimumSize: number,
): number {
  if (measuredWidth <= 0 || availableWidth <= 0) return preferredSize;
  const fittedSize = Math.floor(preferredSize * (availableWidth / measuredWidth));
  return Math.min(preferredSize, Math.max(minimumSize, fittedSize));
}

export function finishTear(progress: number): TearResult {
  return progress >= TEAR_REVEAL_THRESHOLD ? "revealed" : "closed";
}
