export function rulerTicks({
  min,
  max,
  every,
  majorEvery,
  start = min,
}: {
  min: number;
  max: number;
  every: number;
  majorEvery: number;
  start?: number;
}) {
  const ticks = Array.from(
    { length: Math.floor((max - start) / every) + 1 },
    (_, index) => start + index * every,
  );
  return ticks.map((value) => ({
    value,
    major: value > start && value < max && (value - start) % majorEvery === 0,
  }));
}

/** Place marks on the same numeric axis as the slider thumb. */
export function rulerPosition(value: number, min: number, max: number) {
  return ((value - min) / (max - min)) * 100;
}
