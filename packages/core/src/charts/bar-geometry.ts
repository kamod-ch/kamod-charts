import { normalizeAccessor, type DataAccessor } from "../core";
import {
  createBandScale,
  createLinearScale,
  inferCategoricalDomain,
  type NumericDomain,
} from "../scales";
import { getStackedValues } from "../series";
import type { CartesianTooltipMode } from "./types";
import { getSeriesId } from "./series-identity";
import type { BarSeriesConfig } from "./types";

export type BarGeometry<TDatum> = {
  datum: TDatum;
  index: number;
  series: BarSeriesConfig<TDatum>;
  seriesId: string;
  seriesIndex: number;
  value: number | null;
  valueStart: number;
  valueEnd: number;
  x: number;
  y: number;
  width: number;
  height: number;
  anchorX: number;
  anchorY: number;
  category: string;
  categoryValue: string | number | Date | null;
  defined: boolean;
};

export type ResolveBarGeometryOptions<TDatum> = {
  data: readonly TDatum[];
  series: readonly BarSeriesConfig<TDatum>[];
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  yDomain: NumericDomain;
  stacked?: boolean;
  grouped?: boolean;
  horizontal?: boolean;
  minBarSize?: number;
  /** Caps bar width (vertical) or bar height (horizontal). Ignored when not finite or <= 0. */
  maxBarSize?: number;
  plotWidth: number;
  plotHeight: number;
};

/**
 * Applies an optional max size cap on the category axis dimension.
 * Non-finite and non-positive limits are ignored so SVG output never receives NaN.
 */
export const resolveMaxBarCategorySize = (naturalSize: number, maxBarSize?: number): number => {
  if (maxBarSize == null || !Number.isFinite(maxBarSize) || maxBarSize <= 0) {
    return naturalSize;
  }

  return Math.min(naturalSize, maxBarSize);
};

export const categoryOf = (
  value: string | number | Date | null | undefined,
  index: number,
): string => {
  if (value == null) {
    return String(index);
  }

  return value instanceof Date ? value.toISOString() : String(value);
};

const containsPoint = <TDatum>(bar: BarGeometry<TDatum>, plotX: number, plotY: number): boolean =>
  plotX >= bar.x && plotX <= bar.x + bar.width && plotY >= bar.y && plotY <= bar.y + bar.height;

export const resolveBarGeometry = <TDatum>({
  data,
  series,
  xKey,
  yDomain,
  stacked = false,
  grouped = true,
  horizontal = false,
  minBarSize = 0,
  maxBarSize,
  plotWidth,
  plotHeight,
}: ResolveBarGeometryOptions<TDatum>): BarGeometry<TDatum>[] => {
  if (data.length === 0 || series.length === 0 || plotWidth <= 0 || plotHeight <= 0) {
    return [];
  }

  const readX = normalizeAccessor(xKey ?? ((_datum: TDatum, index: number) => index));
  const domain = inferCategoricalDomain(data, xKey ?? ((_datum, index) => index));
  const categoryScale = createBandScale({
    domain,
    range: horizontal ? [0, plotHeight] : [0, plotWidth],
  });
  const innerScale = createBandScale({
    domain: series.map((entry, index) => getSeriesId(entry, index)),
    range: [0, categoryScale.bandwidth()],
    paddingInner: grouped ? 0.1 : 0,
    paddingOuter: 0,
  });
  const valueScale = createLinearScale({
    domain: yDomain,
    range: horizontal ? [0, plotWidth] : [plotHeight, 0],
  });
  const stackedLayers = stacked
    ? getStackedValues(
        data,
        series.map((entry, index) => ({ id: getSeriesId(entry, index), value: entry.key })),
      )
    : [];
  const categoryBandwidth = categoryScale.bandwidth();
  const naturalSlotSize = stacked ? categoryBandwidth : innerScale.bandwidth();
  const barCategorySize = resolveMaxBarCategorySize(naturalSlotSize, maxBarSize);
  const groupedLayout =
    !stacked && grouped && series.length > 1
      ? (() => {
          const firstId = getSeriesId(series[0]!, 0);
          const groupStart = innerScale(firstId) ?? 0;
          return {
            groupStart,
            groupCenterOffset: groupStart + (naturalSlotSize - barCategorySize) / 2,
          };
        })()
      : null;

  const bars: BarGeometry<TDatum>[] = [];

  for (const [seriesIndex, entry] of series.entries()) {
    const readY = normalizeAccessor(entry.key);
    const seriesId = getSeriesId(entry, seriesIndex);

    for (const [index, datum] of data.entries()) {
      const categoryValue = readX(datum, index) ?? null;
      const category = categoryOf(categoryValue, index);
      const categoryPosition = categoryScale(category);
      if (categoryPosition == null) {
        continue;
      }

      const raw = readY(datum, index);
      const defined = typeof raw === "number" && Number.isFinite(raw);
      const value = defined ? raw : null;
      const stackValue = stackedLayers[seriesIndex]?.[index];
      const valueStart = stacked ? (stackValue?.y0 ?? 0) : 0;
      const valueEnd = stacked ? (stackValue?.y1 ?? value ?? 0) : (value ?? 0);
      const scaledStart = valueScale(valueStart);
      const scaledEnd = valueScale(valueEnd);
      const slotOffset = stacked ? 0 : (innerScale(seriesId) ?? 0);
      const categoryOffset = stacked
        ? (categoryBandwidth - barCategorySize) / 2
        : groupedLayout
          ? groupedLayout.groupCenterOffset + (slotOffset - groupedLayout.groupStart)
          : series.length === 1
            ? (categoryBandwidth - barCategorySize) / 2
            : slotOffset + (naturalSlotSize - barCategorySize) / 2;
      const x = horizontal ? Math.min(scaledStart, scaledEnd) : categoryPosition + categoryOffset;
      const y = horizontal ? categoryPosition + categoryOffset : Math.min(scaledStart, scaledEnd);
      const width = horizontal
        ? Math.max(Math.abs(scaledEnd - scaledStart), minBarSize)
        : barCategorySize;
      const height = horizontal
        ? barCategorySize
        : Math.max(Math.abs(scaledEnd - scaledStart), minBarSize);
      const anchorX = horizontal ? scaledEnd : x + width / 2;
      const anchorY = horizontal ? y + height / 2 : scaledEnd;

      bars.push({
        datum,
        index,
        series: entry,
        seriesId,
        seriesIndex,
        value,
        valueStart,
        valueEnd,
        x,
        y,
        width,
        height,
        anchorX,
        anchorY,
        category,
        categoryValue,
        defined,
      });
    }
  }

  return bars;
};

export const hitTestBars = <TDatum>(
  bars: readonly BarGeometry<TDatum>[],
  plotX: number,
  plotY: number,
  mode: CartesianTooltipMode,
  horizontal: boolean,
): BarGeometry<TDatum> | null => {
  const selectable = bars.filter((bar) => bar.defined);
  const contained = selectable.find((bar) => containsPoint(bar, plotX, plotY));
  if (contained) {
    return contained;
  }

  if (mode !== "axis" || selectable.length === 0) {
    return null;
  }

  let nearest = selectable[0]!;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const bar of selectable) {
    const center = horizontal ? bar.y + bar.height / 2 : bar.x + bar.width / 2;
    const pointer = horizontal ? plotY : plotX;
    const distance = Math.abs(center - pointer);
    if (
      distance < nearestDistance ||
      (distance === nearestDistance &&
        (bar.index < nearest.index ||
          (bar.index === nearest.index && bar.seriesIndex < nearest.seriesIndex)))
    ) {
      nearest = bar;
      nearestDistance = distance;
    }
  }

  return nearest;
};

export const findDefinedBar = <TDatum>(
  bars: readonly BarGeometry<TDatum>[],
  index: number,
  seriesIndex: number,
): BarGeometry<TDatum> | undefined =>
  bars.find((bar) => bar.defined && bar.index === index && bar.seriesIndex === seriesIndex);

export const stepDefinedBar = <TDatum>(
  bars: readonly BarGeometry<TDatum>[],
  index: number,
  seriesIndex: number,
  deltaIndex: number,
  deltaSeries: number,
  pointCount: number,
  seriesCount: number,
): { index: number; seriesIndex: number } | null => {
  const selectable = bars.filter((bar) => bar.defined);
  if (selectable.length === 0 || pointCount <= 0 || seriesCount <= 0) {
    return null;
  }

  const inBounds = (nextIndex: number, nextSeries: number) =>
    nextIndex >= 0 && nextIndex < pointCount && nextSeries >= 0 && nextSeries < seriesCount;

  let nextIndex = index;
  let nextSeries = seriesIndex;
  const signIndex = Math.sign(deltaIndex);
  const signSeries = Math.sign(deltaSeries);

  for (let step = 0; step < pointCount * seriesCount; step += 1) {
    const match = findDefinedBar(bars, nextIndex, nextSeries);
    if (match) {
      return { index: match.index, seriesIndex: match.seriesIndex };
    }

    if (signIndex !== 0) {
      const candidate = nextIndex + signIndex;
      if (!inBounds(candidate, nextSeries)) {
        break;
      }
      nextIndex = candidate;
      continue;
    }

    if (signSeries !== 0) {
      const candidate = nextSeries + signSeries;
      if (!inBounds(nextIndex, candidate)) {
        break;
      }
      nextSeries = candidate;
      continue;
    }

    const atIndex = selectable.find((bar) => bar.index === nextIndex);
    if (atIndex) {
      return { index: atIndex.index, seriesIndex: atIndex.seriesIndex };
    }

    const nearest = [...selectable].sort(
      (left, right) =>
        Math.abs(left.index - index) - Math.abs(right.index - index) ||
        left.seriesIndex - right.seriesIndex,
    )[0];
    return nearest ? { index: nearest.index, seriesIndex: nearest.seriesIndex } : null;
  }

  return findDefinedBar(bars, index, seriesIndex)
    ? { index, seriesIndex }
    : selectable[0]
      ? { index: selectable[0].index, seriesIndex: selectable[0].seriesIndex }
      : null;
};
