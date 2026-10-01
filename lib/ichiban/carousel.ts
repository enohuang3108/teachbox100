let model: Promise<ArrayBuffer> | undefined;
/** 票券的 3D 模型（1.2 MB）。頁面在設定階段先呼叫，場景掛上時拿同一個 promise，不重抓 */
export function loadIchibanModel() {
  model ??= fetch("/3d_model/ichiban-crayon.glb").then((r) => {
    if (!r.ok) throw new Error(`ichiban model ${r.status}`);
    return r.arrayBuffer();
  });
  // 失敗不留快取，下次掛上場景可以重試
  model.catch(() => (model = undefined));
  return model;
}

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

/** 甩動放手：依速度推算慣性會滑到哪，再停在最近的一張。速度單位為度/秒。 */
export function flingCarousel(rotation: number, velocity: number, count: number) {
  return snapCarousel(rotation + velocity * 0.5, count);
}
