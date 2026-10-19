export interface MinMaxDownsampleOptions {
  /** Maximum number of distinct original indices to return (including endpoints). */
  budget: number;
}

export interface MinMaxDownsamplePoint<TDatum> {
  datum: TDatum;
  index: number;
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

/**
 * Min/max bucket downsampling for monotonic numeric X series.
 * Preserves extrema per bucket and always includes first/last indices when budget allows.
 */
export const downsampleMinMax = <TDatum>(
  data: readonly TDatum[],
  readX: (datum: TDatum, index: number) => number | null | undefined,
  readY: (datum: TDatum, index: number) => number | null | undefined,
  { budget }: MinMaxDownsampleOptions,
): readonly MinMaxDownsamplePoint<TDatum>[] => {
  if (budget <= 0 || data.length === 0) {
    return [];
  }

  if (data.length <= budget) {
    return data.map((datum, index) => ({ datum, index }));
  }

  const indices: number[] = [];
  for (let index = 0; index < data.length; index += 1) {
    const x = readX(data[index]!, index);
    const y = readY(data[index]!, index);
    if (isFiniteNumber(x) && isFiniteNumber(y)) {
      indices.push(index);
    }
  }

  if (indices.length <= budget) {
    return indices.map((index) => ({ datum: data[index]!, index }));
  }

  const bucketCount = Math.max(1, Math.floor((budget - 2) / 2));
  const first = indices[0]!;
  const last = indices[indices.length - 1]!;
  const selected = new Set<number>([first, last]);
  const inner = indices.slice(1, -1);
  const bucketSize = Math.max(1, Math.ceil(inner.length / bucketCount));

  for (let bucket = 0; bucket < bucketCount; bucket += 1) {
    const start = bucket * bucketSize;
    const slice = inner.slice(start, start + bucketSize);
    if (slice.length === 0) {
      continue;
    }

    let minIndex = slice[0]!;
    let maxIndex = slice[0]!;
    let minY = readY(data[minIndex]!, minIndex) ?? 0;
    let maxY = minY;

    for (const index of slice) {
      const y = readY(data[index]!, index);
      if (!isFiniteNumber(y)) {
        continue;
      }
      if (y < minY) {
        minY = y;
        minIndex = index;
      }
      if (y > maxY) {
        maxY = y;
        maxIndex = index;
      }
    }

    selected.add(minIndex);
    selected.add(maxIndex);
  }

  const ordered = [...selected].sort((a, b) => a - b);
  if (ordered.length > budget) {
    return ordered
      .filter(
        (index, position) =>
          position === 0 || position === ordered.length - 1 || position % 2 === 0,
      )
      .slice(0, budget)
      .map((index) => ({ datum: data[index]!, index }));
  }

  return ordered.map((index) => ({ datum: data[index]!, index }));
};
