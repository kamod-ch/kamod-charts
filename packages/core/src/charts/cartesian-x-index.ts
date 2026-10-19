import { getScalePosition } from "../axes";
import type { ChartCartesianScaleKind, DataAccessor } from "../core";
import { normalizeAccessor } from "../core";
import { createCartesianScales } from "../series/cartesian";
import type { NumericDomain } from "../scales";

const indexAccessor = <TDatum>(_datum: TDatum, index: number): number => index;

export interface CartesianXIndex {
  /** Datum row indices sorted by projected x (ascending). */
  indices: readonly number[];
  /** Projected x positions matching `indices`. */
  xs: readonly number[];
}

export const buildCartesianXIndex = <TDatum>({
  data,
  xKey,
  xScale: xScaleKind,
  yDomain,
  plotWidth,
  seriesKey,
}: {
  data: readonly TDatum[];
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ChartCartesianScaleKind;
  yDomain: NumericDomain;
  plotWidth: number;
  seriesKey: DataAccessor<TDatum, number | null | undefined>;
}): CartesianXIndex | null => {
  if (data.length === 0 || plotWidth <= 0) {
    return null;
  }

  const { xScale } = createCartesianScales({
    data,
    xKey,
    yKey: seriesKey,
    xScale: xScaleKind,
    yDomain,
    xRange: [0, plotWidth],
    yRange: [1, 0],
  });
  const readX = normalizeAccessor(xKey ?? indexAccessor);
  const entries: { index: number; x: number }[] = [];

  for (const [index, datum] of data.entries()) {
    const xValue = readX(datum, index);
    if (xValue == null) {
      continue;
    }
    const x = getScalePosition(xScale, xValue as never);
    if (typeof x !== "number" || !Number.isFinite(x)) {
      continue;
    }
    entries.push({ index, x });
  }

  entries.sort((a, b) => a.x - b.x || a.index - b.index);
  return {
    indices: entries.map((entry) => entry.index),
    xs: entries.map((entry) => entry.x),
  };
};

export const findNearestIndexOnXIndex = (index: CartesianXIndex, plotX: number): number | null => {
  const { indices, xs } = index;
  if (indices.length === 0) {
    return null;
  }

  let low = 0;
  let high = xs.length - 1;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (xs[mid]! < plotX) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  const right = low;
  const left = Math.max(0, right - 1);
  const distLeft = Math.abs(xs[left]! - plotX);
  const distRight = Math.abs(xs[right]! - plotX);
  const pick = distRight < distLeft ? right : left;
  return indices[pick] ?? null;
};
