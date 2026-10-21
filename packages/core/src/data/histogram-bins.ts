export type HistogramBin = {
  index: number;
  /** Left edge (inclusive). */
  left: number;
  /** Right edge: exclusive for interior bins; inclusive for the last bin. */
  right: number;
  count: number;
};

export type HistogramBinsResult = {
  bins: HistogramBin[];
  /** Valid numeric samples assigned to exactly one bin. */
  assignedCount: number;
  /** Ignored `null`, `undefined`, and non-finite numbers. */
  skippedCount: number;
  edges: readonly number[];
};

export type ComputeHistogramBinsOptions = {
  /**
   * Number of equal-width bins when `edges` is omitted.
   * Ignored when `edges` is provided.
   */
  binCount?: number;
  /** Monotonic bin edges (`length = binCount + 1`). Overrides `binCount`. */
  edges?: readonly number[];
};

const DEFAULT_BIN_COUNT = 10;

const isValidSample = (value: number | null | undefined): value is number =>
  typeof value === "number" && Number.isFinite(value);

const assertStrictlyIncreasingEdges = (edges: readonly number[]) => {
  for (let index = 1; index < edges.length; index += 1) {
    if (!(edges[index]! > edges[index - 1]!)) {
      throw new Error("[kamod-charts] histogram edges must be strictly increasing.");
    }
  }
};

const buildEqualWidthEdges = (min: number, max: number, binCount: number): number[] => {
  if (binCount < 1) {
    throw new Error("[kamod-charts] histogram binCount must be at least 1.");
  }
  if (min === max) {
    return [min, min + 1];
  }
  const step = (max - min) / binCount;
  const edges: number[] = [];
  for (let index = 0; index <= binCount; index += 1) {
    edges.push(index === binCount ? max : min + step * index);
  }
  return edges;
};

const findBinIndex = (value: number, edges: readonly number[]): number => {
  const lastIndex = edges.length - 2;
  for (let index = 0; index <= lastIndex; index += 1) {
    const left = edges[index]!;
    const right = edges[index + 1]!;
    const isLast = index === lastIndex;
    if (value < left) {
      return -1;
    }
    if (isLast) {
      if (value <= right) {
        return index;
      }
      return -1;
    }
    if (value >= left && value < right) {
      return index;
    }
  }
  return -1;
};

const emptyBins = (edges: readonly number[]): HistogramBin[] => {
  const bins: HistogramBin[] = [];
  for (let index = 0; index < edges.length - 1; index += 1) {
    bins.push({
      index,
      left: edges[index]!,
      right: edges[index + 1]!,
      count: 0,
    });
  }
  return bins;
};

/**
 * Count-based histogram binning.
 * Interval rule: `[left, right)` for all bins except the last, which is `[left, right]` (right inclusive).
 */
export const computeHistogramBins = (
  values: readonly (number | null | undefined)[],
  options: ComputeHistogramBinsOptions = {},
): HistogramBinsResult => {
  const samples: number[] = [];
  let skippedCount = 0;
  for (const value of values) {
    if (!isValidSample(value)) {
      skippedCount += 1;
      continue;
    }
    samples.push(value);
  }

  let edges: number[];
  if (options.edges && options.edges.length >= 2) {
    edges = [...options.edges];
    assertStrictlyIncreasingEdges(edges);
  } else {
    const binCount = options.binCount ?? DEFAULT_BIN_COUNT;
    if (samples.length === 0) {
      edges = buildEqualWidthEdges(0, 1, binCount);
    } else {
      let min = samples[0]!;
      let max = samples[0]!;
      for (const sample of samples) {
        if (sample < min) {
          min = sample;
        }
        if (sample > max) {
          max = sample;
        }
      }
      edges = buildEqualWidthEdges(min, max, binCount);
    }
  }

  const bins = emptyBins(edges);
  let assignedCount = 0;

  for (const sample of samples) {
    const binIndex = findBinIndex(sample, edges);
    if (binIndex < 0) {
      skippedCount += 1;
      continue;
    }
    bins[binIndex]!.count += 1;
    assignedCount += 1;
  }

  return {
    bins,
    assignedCount,
    skippedCount,
    edges,
  };
};

export const formatHistogramBinInterval = (bin: HistogramBin, isLast: boolean): string => {
  const rightBracket = isLast ? "]" : ")";
  return `[${bin.left}, ${bin.right}${rightBracket}`;
};

export const histogramBinsToBarData = (
  result: HistogramBinsResult,
): Array<{ bin: string; count: number; left: number; right: number }> => {
  const lastIndex = result.bins.length - 1;
  return result.bins.map((bin) => ({
    bin: formatHistogramBinInterval(bin, bin.index === lastIndex),
    count: bin.count,
    left: bin.left,
    right: bin.right,
  }));
};
