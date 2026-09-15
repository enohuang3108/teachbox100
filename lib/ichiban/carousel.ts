const DRAG_DEGREES_PER_PIXEL = 0.2;

function normalizeIndex(index: number, count: number): number {
  return ((index % count) + count) % count;
}

export function carouselRotationFromDrag(startRotation: number, deltaX: number): number {
  return startRotation + deltaX * DRAG_DEGREES_PER_PIXEL;
}

export function snapCarousel(rotation: number, count: number): { rotation: number; index: number } {
  if (count <= 0) return { rotation: 0, index: 0 };
  const step = 360 / count;
  const snappedRotation = Math.round(rotation / step) * step;
  return {
    rotation: snappedRotation,
    index: normalizeIndex(Math.round(-snappedRotation / step), count),
  };
}

export function carouselTargetForIndex(index: number, count: number, currentRotation: number): number {
  if (count <= 0) return 0;
  const step = 360 / count;
  const baseTarget = -normalizeIndex(index, count) * step;
  return baseTarget + Math.round((currentRotation - baseTarget) / 360) * 360;
}
