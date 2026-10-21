import { downsampleMinMax, type MinMaxDownsamplePoint } from "./downsample-min-max";

export interface SegmentedMinMaxDownsampleOptions {
  /** Maximum number of drawable numeric points (finite X and Y) across all segments. */
  budget: number;
  /**
   * When set, splits segments when `readX` increases by more than this amount between
   * consecutive valid rows (array order). Must be explicit; never inferred from data.
   */
  gapThreshold?: number;
}

export interface SegmentedMinMaxDownsampleSegment {
  firstIndex: number;
  lastIndex: number;
  validCount: number;
}

export interface SegmentedMinMaxDownsampleResult<TDatum> {
  points: readonly MinMaxDownsamplePoint<TDatum>[];
  segments: readonly SegmentedMinMaxDownsampleSegment[];
  /** Original indices with invalid or missing Y (explicit value gaps). */
  valueGapIndices: readonly number[];
  /** Original index of the last point before a time-gap split. */
  timeGapAfterIndices: readonly number[];
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const normalizeBudget = (budget: number): number => {
  if (!Number.isFinite(budget) || budget <= 0) {
    return 0;
  }
  return Math.floor(budget);
};

const readXAsNumber = <TDatum>(
  datum: TDatum,
  index: number,
  readX: (datum: TDatum, index: number) => number | Date | null | undefined,
): number | null => {
  const value = readX(datum, index);
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value.getTime() : null;
  }
  return isFiniteNumber(value) ? value : null;
};

const splitSegments = <TDatum>(
  data: readonly TDatum[],
  readX: (datum: TDatum, index: number) => number | Date | null | undefined,
  readY: (datum: TDatum, index: number) => number | null | undefined,
  gapThreshold?: number,
): {
  segments: SegmentedMinMaxDownsampleSegment[];
  valueGapIndices: number[];
  timeGapAfterIndices: number[];
} => {
  const segments: SegmentedMinMaxDownsampleSegment[] = [];
  const valueGapIndices: number[] = [];
  const timeGapAfterIndices: number[] = [];
  let run: number[] = [];

  const flush = () => {
    if (run.length === 0) {
      return;
    }
    segments.push({
      firstIndex: run[0]!,
      lastIndex: run[run.length - 1]!,
      validCount: run.length,
    });
    run = [];
  };

  const threshold =
    gapThreshold != null && Number.isFinite(gapThreshold) && gapThreshold > 0 ? gapThreshold : null;

  for (let index = 0; index < data.length; index += 1) {
    const x = readXAsNumber(data[index]!, index, readX);
    const y = readY(data[index]!, index);
    if (!isFiniteNumber(x) || !isFiniteNumber(y)) {
      valueGapIndices.push(index);
      flush();
      continue;
    }

    if (run.length > 0 && threshold != null) {
      const previousIndex = run[run.length - 1]!;
      const previousX = readXAsNumber(data[previousIndex]!, previousIndex, readX);
      if (isFiniteNumber(previousX) && x - previousX > threshold) {
        timeGapAfterIndices.push(previousIndex);
        flush();
      }
    }

    run.push(index);
  }

  flush();
  return { segments, valueGapIndices, timeGapAfterIndices };
};

const minimumSegmentBudget = (validCount: number): number => (validCount <= 1 ? 1 : 2);

/**
 * Deterministic budget split: reserve segment endpoints first (in order), then distribute
 * leftover budget by segment size (larger segments receive +1 first).
 */
const allocateSegmentBudgets = (
  segments: readonly SegmentedMinMaxDownsampleSegment[],
  budget: number,
): number[] => {
  if (budget <= 0 || segments.length === 0) {
    return segments.map(() => 0);
  }

  const allocations = segments.map((segment) => minimumSegmentBudget(segment.validCount));
  let spent = allocations.reduce((sum, value) => sum + value, 0);

  if (spent > budget) {
    const tight = segments.map(() => 0);
    let remaining = budget;
    for (let index = 0; index < segments.length; index += 1) {
      if (remaining <= 0) {
        break;
      }
      tight[index] = 1;
      remaining -= 1;
    }
    return tight.map((value, index) => Math.min(value, segments[index]!.validCount));
  }

  let remaining = budget - spent;
  const order = segments
    .map((segment, index) => ({ index, weight: segment.validCount }))
    .sort((left, right) => right.weight - left.weight || left.index - right.index);

  let guard = 0;
  while (remaining > 0 && guard < order.length * 10_000) {
    guard += 1;
    let progressed = false;
    for (const entry of order) {
      const segment = segments[entry.index]!;
      if (allocations[entry.index]! >= segment.validCount) {
        continue;
      }
      allocations[entry.index]! += 1;
      remaining -= 1;
      progressed = true;
      if (remaining <= 0) {
        break;
      }
    }
    if (!progressed) {
      break;
    }
  }

  return allocations.map((value, index) => Math.min(value, segments[index]!.validCount));
};

const downsampleSegment = <TDatum>(
  data: readonly TDatum[],
  indices: readonly number[],
  readX: (datum: TDatum, index: number) => number | Date | null | undefined,
  readY: (datum: TDatum, index: number) => number | null | undefined,
  budget: number,
): readonly MinMaxDownsamplePoint<TDatum>[] => {
  if (budget <= 0 || indices.length === 0) {
    return [];
  }

  const slice = indices.map((index) => data[index]!);
  const sampled = downsampleMinMax(
    slice,
    (datum, position) => readXAsNumber(datum, indices[position]!, readX),
    (datum, position) => readY(datum, indices[position]!),
    { budget },
  ).map((entry) => ({
    datum: entry.datum,
    index: indices[entry.index]!,
  }));

  const merged = new Map<number, MinMaxDownsamplePoint<TDatum>>();
  for (const point of sampled) {
    merged.set(point.index, point);
  }
  const firstIndex = indices[0]!;
  const lastIndex = indices[indices.length - 1]!;
  merged.set(firstIndex, { datum: data[firstIndex]!, index: firstIndex });
  if (budget >= 2 && indices.length >= 2) {
    merged.set(lastIndex, { datum: data[lastIndex]!, index: lastIndex });
  }

  const ordered = [...merged.values()].sort((left, right) => left.index - right.index);
  if (ordered.length <= budget) {
    return ordered;
  }

  const keep = new Set<number>([firstIndex]);
  if (budget >= 2 && indices.length >= 2) {
    keep.add(lastIndex);
  }
  for (const point of ordered) {
    if (keep.size >= budget) {
      break;
    }
    keep.add(point.index);
  }

  return ordered.filter((point) => keep.has(point.index)).slice(0, budget);
};

/**
 * Segment-preserving min/max downsampling. Invalid Y values break segments; optional
 * `gapThreshold` splits on large X jumps in array order. Does not reorder or mutate input.
 */
export const downsampleMinMaxSegmented = <TDatum>(
  data: readonly TDatum[],
  readX: (datum: TDatum, index: number) => number | Date | null | undefined,
  readY: (datum: TDatum, index: number) => number | null | undefined,
  { budget, gapThreshold }: SegmentedMinMaxDownsampleOptions,
): SegmentedMinMaxDownsampleResult<TDatum> => {
  const normalizedBudget = normalizeBudget(budget);
  const { segments, valueGapIndices, timeGapAfterIndices } = splitSegments(
    data,
    readX,
    readY,
    gapThreshold,
  );

  if (normalizedBudget <= 0 || segments.length === 0) {
    return {
      points: [],
      segments,
      valueGapIndices,
      timeGapAfterIndices,
    };
  }

  const totalValid = segments.reduce((sum, segment) => sum + segment.validCount, 0);
  if (totalValid <= normalizedBudget) {
    const points = segments.flatMap((segment) =>
      Array.from({ length: segment.validCount }, (_, offset) => {
        const index = segment.firstIndex + offset;
        return { datum: data[index]!, index };
      }),
    );
    return { points, segments, valueGapIndices, timeGapAfterIndices };
  }

  const allocations = allocateSegmentBudgets(segments, normalizedBudget);
  const selected = new Map<number, MinMaxDownsamplePoint<TDatum>>();

  segments.forEach((segment, segmentIndex) => {
    const indices = Array.from(
      { length: segment.validCount },
      (_, offset) => segment.firstIndex + offset,
    );
    const segmentBudget = allocations[segmentIndex] ?? 0;
    for (const point of downsampleSegment(data, indices, readX, readY, segmentBudget)) {
      selected.set(point.index, point);
    }
  });

  const points = [...selected.values()].sort((left, right) => left.index - right.index);
  return { points, segments, valueGapIndices, timeGapAfterIndices };
};
