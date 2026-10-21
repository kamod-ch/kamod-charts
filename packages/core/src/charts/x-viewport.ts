import type { ChartCartesianScaleKind, DataAccessor } from "../core";
import { normalizeAccessor } from "../core";

export type CartesianYAutoscale = "data" | "visible";

export type ChartXViewportDomain = readonly [number, number] | readonly [Date, Date];

const indexAccessor = <TDatum>(_datum: TDatum, index: number): number => index;

export const isContinuousCartesianXScale = (xScale?: ChartCartesianScaleKind): boolean =>
  xScale === "linear" || xScale === "time";

export const supportsChartXDomain = (
  xDomain: ChartXViewportDomain | undefined,
  xScale?: ChartCartesianScaleKind,
): boolean => xDomain != null && isContinuousCartesianXScale(xScale);

export const normalizeXViewportBound = (value: number | Date): number | Date => {
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isFinite(time) ? new Date(time) : value;
  }
  return Number.isFinite(value) ? value : value;
};

export const normalizeChartXDomain = (domain: ChartXViewportDomain): ChartXViewportDomain => {
  const start = normalizeXViewportBound(domain[0]);
  const end = normalizeXViewportBound(domain[1]);
  if (start instanceof Date && end instanceof Date) {
    return start.getTime() <= end.getTime() ? [start, end] : [end, start];
  }
  const a = start as number;
  const b = end as number;
  return a <= b ? [a, b] : [b, a];
};

const readComparableX = <TDatum>(
  datum: TDatum,
  index: number,
  xKey: DataAccessor<TDatum, string | number | Date | null | undefined> | undefined,
  xScale?: ChartCartesianScaleKind,
): number | null => {
  const readX = normalizeAccessor(xKey ?? indexAccessor);
  const value = readX(datum, index);
  if (value == null) {
    return null;
  }
  if (xScale === "time" || value instanceof Date) {
    const time = value instanceof Date ? value.getTime() : Number(value);
    return Number.isFinite(time) ? time : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return null;
};

export const inferContinuousXDomainFromData = <TDatum>(
  data: readonly TDatum[],
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>,
  xScale?: ChartCartesianScaleKind,
): ChartXViewportDomain | null => {
  if (!isContinuousCartesianXScale(xScale) || data.length === 0) {
    return null;
  }

  let min: number | null = null;
  let max: number | null = null;
  for (const [index, datum] of data.entries()) {
    const comparable = readComparableX(datum, index, xKey, xScale);
    if (comparable == null) {
      continue;
    }
    min = min == null ? comparable : Math.min(min, comparable);
    max = max == null ? comparable : Math.max(max, comparable);
  }

  if (min == null || max == null) {
    return null;
  }

  if (xScale === "time") {
    return [new Date(min), new Date(max)];
  }

  return [min, max];
};

export const resolveControlledChartXDomain = (
  xDomain: ChartXViewportDomain | undefined,
  xScale?: ChartCartesianScaleKind,
): ChartXViewportDomain | undefined => {
  if (!supportsChartXDomain(xDomain, xScale)) {
    return undefined;
  }
  return normalizeChartXDomain(xDomain!);
};

export const isXValueWithinDomain = (
  comparableX: number,
  domain: ChartXViewportDomain,
): boolean => {
  const [start, end] = normalizeChartXDomain(domain);
  const min = start instanceof Date ? start.getTime() : (start as number);
  const max = end instanceof Date ? end.getTime() : (end as number);
  return comparableX >= min && comparableX <= max;
};

export const filterDataForVisibleYAutoscale = <TDatum>(
  data: readonly TDatum[],
  xKey: DataAccessor<TDatum, string | number | Date | null | undefined> | undefined,
  xScale: ChartCartesianScaleKind | undefined,
  xDomain: ChartXViewportDomain,
): readonly TDatum[] => {
  const rows: TDatum[] = [];
  for (const [index, datum] of data.entries()) {
    const comparable = readComparableX(datum, index, xKey, xScale);
    if (comparable != null && isXValueWithinDomain(comparable, xDomain)) {
      rows.push(datum);
    }
  }
  return rows;
};

export const minXViewportSpan = (xScale?: ChartCartesianScaleKind): number =>
  xScale === "time" ? 1 : Number.EPSILON;

export const clampXViewportDomain = (
  domain: ChartXViewportDomain,
  extents: ChartXViewportDomain,
  xScale?: ChartCartesianScaleKind,
  minSpanOverride?: number,
): ChartXViewportDomain => {
  const [viewStart, viewEnd] = normalizeChartXDomain(domain);
  const [extentStart, extentEnd] = normalizeChartXDomain(extents);
  const minSpan = minSpanOverride ?? minXViewportSpan(xScale);

  if (viewStart instanceof Date && viewEnd instanceof Date) {
    const extentMin = extentStart instanceof Date ? extentStart.getTime() : 0;
    const extentMax = extentEnd instanceof Date ? extentEnd.getTime() : 0;
    let start = viewStart.getTime();
    let end = viewEnd.getTime();
    if (end - start < minSpan) {
      end = start + minSpan;
    }
    if (start < extentMin) {
      start = extentMin;
      end = Math.max(start + minSpan, end);
    }
    if (end > extentMax) {
      end = extentMax;
      start = Math.min(end - minSpan, start);
    }
    return normalizeChartXDomain([new Date(start), new Date(end)]);
  }

  let start = viewStart as number;
  let end = viewEnd as number;
  const extentMin = extentStart as number;
  const extentMax = extentEnd as number;
  if (end - start < minSpan) {
    end = start + minSpan;
  }
  if (start < extentMin) {
    start = extentMin;
    end = Math.max(start + minSpan, end);
  }
  if (end > extentMax) {
    end = extentMax;
    start = Math.min(end - minSpan, start);
  }
  return normalizeChartXDomain([start, end]);
};

export const panXViewportDomain = (
  domain: ChartXViewportDomain,
  delta: number,
  extents: ChartXViewportDomain,
  xScale?: ChartCartesianScaleKind,
): ChartXViewportDomain => {
  const [start, end] = normalizeChartXDomain(domain);
  if (start instanceof Date && end instanceof Date) {
    return clampXViewportDomain(
      [new Date(start.getTime() + delta), new Date(end.getTime() + delta)],
      extents,
      xScale,
    );
  }
  return clampXViewportDomain(
    [(start as number) + delta, (end as number) + delta],
    extents,
    xScale,
  );
};

export const zoomXViewportDomain = (
  domain: ChartXViewportDomain,
  factor: number,
  anchor: number,
  extents: ChartXViewportDomain,
  xScale?: ChartCartesianScaleKind,
): ChartXViewportDomain => {
  const safeFactor = Number.isFinite(factor) && factor > 0 ? factor : 1;
  const [start, end] = normalizeChartXDomain(domain);
  if (start instanceof Date && end instanceof Date) {
    const startMs = start.getTime();
    const endMs = end.getTime();
    const nextStart = anchor + (startMs - anchor) * safeFactor;
    const nextEnd = anchor + (endMs - anchor) * safeFactor;
    return clampXViewportDomain([new Date(nextStart), new Date(nextEnd)], extents, xScale);
  }
  const startNum = start as number;
  const endNum = end as number;
  const nextStart = anchor + (startNum - anchor) * safeFactor;
  const nextEnd = anchor + (endNum - anchor) * safeFactor;
  return clampXViewportDomain([nextStart, nextEnd], extents, xScale);
};

const domainComparableBounds = (domain: ChartXViewportDomain): readonly [number, number] => {
  const [start, end] = normalizeChartXDomain(domain);
  if (start instanceof Date && end instanceof Date) {
    return [start.getTime(), end.getTime()];
  }
  return [start as number, end as number];
};

/** Overlap of multiple continuous domains; null when ranges do not intersect. */
export const intersectContinuousXDomains = (
  domains: readonly ChartXViewportDomain[],
  xScale?: ChartCartesianScaleKind,
): ChartXViewportDomain | null => {
  if (domains.length === 0) {
    return null;
  }
  let [min, max] = domainComparableBounds(domains[0]!);
  for (let index = 1; index < domains.length; index += 1) {
    const [nextMin, nextMax] = domainComparableBounds(domains[index]!);
    min = Math.max(min, nextMin);
    max = Math.min(max, nextMax);
    if (min > max) {
      return null;
    }
  }
  if (xScale === "time") {
    return [new Date(min), new Date(max)];
  }
  return [min, max];
};

/** Smallest envelope covering all domains (used when intersection is empty). */
export const unionContinuousXDomains = (
  domains: readonly ChartXViewportDomain[],
  xScale?: ChartCartesianScaleKind,
): ChartXViewportDomain | null => {
  if (domains.length === 0) {
    return null;
  }
  let min = Infinity;
  let max = -Infinity;
  for (const domain of domains) {
    const [start, end] = domainComparableBounds(domain);
    min = Math.min(min, start);
    max = Math.max(max, end);
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return null;
  }
  if (xScale === "time") {
    return [new Date(min), new Date(max)];
  }
  return [min, max];
};

/**
 * Shared clamp extents for synchronized charts: intersection when it exists,
 * otherwise the union so sparse series can still share a window.
 */
export const resolveSynchronizedXExtents = (
  chartExtents: readonly (ChartXViewportDomain | null)[],
  xScale?: ChartCartesianScaleKind,
): ChartXViewportDomain | null => {
  const valid = chartExtents.filter((entry): entry is ChartXViewportDomain => entry != null);
  if (valid.length === 0) {
    return null;
  }
  return intersectContinuousXDomains(valid, xScale) ?? unionContinuousXDomains(valid, xScale);
};

export const createTrailingTimeWindowDomain = (
  end: Date,
  windowMs: number,
  extents: ChartXViewportDomain,
): ChartXViewportDomain => {
  const endMs = end.getTime();
  const startMs = endMs - Math.max(1, windowMs);
  return clampXViewportDomain([new Date(startMs), new Date(endMs)], extents, "time");
};
