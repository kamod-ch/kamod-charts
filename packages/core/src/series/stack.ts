import type { DataAccessor } from "../core";
import { normalizeAccessor } from "../core";
import type { NumericDomain } from "../scales";

export interface StackSeries<TDatum> {
  id: string;
  value: DataAccessor<TDatum, number | null | undefined>;
}

export interface StackedValue<TDatum> {
  datum: TDatum;
  index: number;
  seriesId: string;
  value: number;
  y0: number;
  y1: number;
}

export const getStackedValues = <TDatum>(
  data: readonly TDatum[],
  series: readonly StackSeries<TDatum>[],
): StackedValue<TDatum>[][] => {
  const accessors = series.map((entry) => ({ id: entry.id, read: normalizeAccessor(entry.value) }));
  const layers = series.map((): StackedValue<TDatum>[] => []);

  for (const [index, datum] of data.entries()) {
    let positive = 0;
    let negative = 0;

    accessors.forEach((entry, seriesIndex) => {
      const raw = entry.read(datum, index);
      const value = typeof raw === "number" && Number.isFinite(raw) ? raw : 0;
      const y0 = value >= 0 ? positive : negative;
      const y1 = y0 + value;

      if (value >= 0) {
        positive = y1;
      } else {
        negative = y1;
      }

      layers[seriesIndex]?.push({ datum, index, seriesId: entry.id, value, y0, y1 });
    });
  }

  return layers;
};

export const inferStackedDomain = <TDatum>(
  data: readonly TDatum[],
  series: readonly StackSeries<TDatum>[],
): NumericDomain => {
  let min = 0;
  let max = 0;
  const accessors = series.map((entry) => normalizeAccessor(entry.value));

  for (const [index, datum] of data.entries()) {
    let positive = 0;
    let negative = 0;

    for (const read of accessors) {
      const raw = read(datum, index);
      const value = typeof raw === "number" && Number.isFinite(raw) ? raw : 0;
      if (value >= 0) {
        positive += value;
      } else {
        negative += value;
      }
    }

    min = Math.min(min, negative);
    max = Math.max(max, positive);
  }

  if (min === max) {
    return [min - 1, max + 1];
  }

  return [min, max];
};

export const inferGroupedDomain = <TDatum>(
  data: readonly TDatum[],
  series: readonly StackSeries<TDatum>[],
): NumericDomain => {
  let min = 0;
  let max = 0;

  for (const entry of series) {
    const read = normalizeAccessor(entry.value);
    for (const [index, datum] of data.entries()) {
      const raw = read(datum, index);
      if (typeof raw === "number" && Number.isFinite(raw)) {
        min = Math.min(min, raw);
        max = Math.max(max, raw);
      }
    }
  }

  if (min === max) {
    return [min - 1, max + 1];
  }

  return [min, max];
};
