export const TEAR_REVEAL_THRESHOLD = 0.62;

export type TearResult = "closed" | "revealed";

export function tearProgress(startX: number, currentX: number, travel: number): number {
  if (travel <= 0) return 0;
  return Math.min(1, Math.max(0, (currentX - startX) / travel));
}

export function prizeRevealProgress(progress: number): number {
  return Math.min(1, Math.max(0, progress));
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
