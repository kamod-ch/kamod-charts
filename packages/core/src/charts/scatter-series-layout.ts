import { pointKey } from "../animation/keys";
import type { ScatterCategoryContext } from "./scatter-model";
import type { DataAccessor } from "../core";
import type { CartesianPoint } from "../series/cartesian";
import {
  DEFAULT_SCATTER_POINT_RADIUS,
  resolveScatterRadius,
  type ScatterSizeScale,
} from "./scatter-size";

export const ACTIVE_SCATTER_RADIUS_OFFSET = 2;
export const ACTIVE_SCATTER_STROKE_WIDTH = 2;
export const DEFAULT_SCATTER_STROKE_WIDTH = 1;

export const clampScatterOpacity = (value: unknown): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 1;
  }

  return Math.min(Math.max(value, 0), 1);
};

export const resolveScatterOpacity = <TDatum>(
  datum: TDatum,
  index: number,
  opacity: number | ((datum: TDatum, index: number) => number) | undefined,
): number => {
  if (typeof opacity === "function") {
    return clampScatterOpacity(opacity(datum, index));
  }

  return clampScatterOpacity(opacity ?? 1);
};

export const renderedScatterRadius = (baseRadius: number, active: boolean): number =>
  active ? baseRadius + ACTIVE_SCATTER_RADIUS_OFFSET : baseRadius;

export interface ScatterSeriesLayoutOptions<TDatum> {
  points: readonly CartesianPoint<TDatum>[];
  seriesId: string;
  keys: readonly string[];
  color: string | ((datum: TDatum, index: number) => string);
  activeIndex?: number | null;
  pointOpacity?: number | ((datum: TDatum, index: number) => number);
  data: readonly TDatum[];
  sizeKey?: DataAccessor<TDatum, number | null | undefined>;
  sizeScale?: ScatterSizeScale;
  sizeDomain?: readonly [number, number];
  pointRadiusRange?: readonly [number, number];
  pointRadius?: number | ((datum: TDatum, index: number) => number);
  pointSize?: number | ((datum: TDatum, index: number) => number);
  seriesPointRadius?: number | ((datum: TDatum, index: number) => number);
  /** Low-level direct radius override. Legacy alias: {@link ScatterSeriesLayoutOptions.size}. */
  radius?: number | ((datum: TDatum, index: number) => number);
  /** @deprecated Prefer {@link ScatterSeriesLayoutOptions.radius}. */
  size?: number | ((datum: TDatum, index: number) => number);
  /** @internal Chart-level category resolution from ScatterChart. */
  categoryContext?: ScatterCategoryContext<TDatum> | null;
  sortByRadius?: boolean;
}

export interface ScatterSeriesLayoutPoint<TDatum> {
  key: string;
  datum: TDatum;
  index: number;
  cx: number;
  cy: number;
  baseRadius: number;
  renderedRadius: number;
  opacity: number;
  fill: string;
  active: boolean;
  visible: boolean;
  sizeValue: number | null;
  categoryId: string | null;
}

const resolveDirectRadius = <TDatum>(
  datum: TDatum,
  index: number,
  radius: number | ((datum: TDatum, index: number) => number),
): number => (typeof radius === "function" ? radius(datum, index) : radius);

const usesChartSizing = <TDatum>(options: ScatterSeriesLayoutOptions<TDatum>): boolean =>
  options.sizeKey !== undefined ||
  options.pointRadius !== undefined ||
  options.pointSize !== undefined ||
  options.seriesPointRadius !== undefined;

const usesDirectRadius = <TDatum>(options: ScatterSeriesLayoutOptions<TDatum>): boolean =>
  options.radius !== undefined || options.size !== undefined;

export const buildScatterSeriesLayout = <TDatum>(
  options: ScatterSeriesLayoutOptions<TDatum>,
): ScatterSeriesLayoutPoint<TDatum>[] => {
  const {
    points,
    seriesId,
    keys,
    color,
    activeIndex = null,
    pointOpacity,
    data,
    sizeKey,
    sizeScale,
    sizeDomain,
    pointRadiusRange,
    pointRadius,
    pointSize,
    seriesPointRadius,
    radius,
    size,
    categoryContext = null,
    sortByRadius = false,
  } = options;

  const chartSizing = usesChartSizing(options);
  const directRadius = usesDirectRadius(options);
  const layouts: ScatterSeriesLayoutPoint<TDatum>[] = [];

  for (const [pointIndex, point] of points.entries()) {
    if (!point.defined || point.x == null || point.y == null) {
      continue;
    }

    const key = keys[pointIndex] ?? pointKey(seriesId, point.xValue, point.index);
    const categoryState = categoryContext?.resolveDatumCategory(point.datum, point.index);
    let fill = typeof color === "function" ? color(point.datum, point.index) : color;
    const active = activeIndex === point.index;
    const opacity = resolveScatterOpacity(point.datum, point.index, pointOpacity);
    let baseRadius = DEFAULT_SCATTER_POINT_RADIUS;
    let sizeValue: number | null = null;
    let visible = true;
    let categoryId: string | null = null;

    if (categoryContext) {
      if (!categoryState?.renderable) {
        visible = false;
      } else if (categoryState.categoryColor) {
        fill = categoryState.categoryColor;
      }
      categoryId = categoryState?.categoryId ?? null;
    }

    if (directRadius && !chartSizing) {
      const resolvedDirect = resolveDirectRadius(
        point.datum,
        point.index,
        radius ?? size ?? DEFAULT_SCATTER_POINT_RADIUS,
      );
      baseRadius = resolvedDirect;
      if (!Number.isFinite(baseRadius) || baseRadius < 0) {
        visible = false;
        baseRadius = DEFAULT_SCATTER_POINT_RADIUS;
      }
    } else {
      const resolved = resolveScatterRadius({
        datum: point.datum,
        index: point.index,
        sizeKey,
        sizeScale,
        sizeDomain,
        pointRadiusRange,
        pointRadius,
        pointSize,
        seriesPointRadius,
        data,
      });
      sizeValue = resolved.sizeValue;
      baseRadius = resolved.radius;
      if (sizeKey != null && !resolved.sizeValid) {
        visible = false;
      }
    }

    layouts.push({
      key,
      datum: point.datum,
      index: point.index,
      cx: point.x,
      cy: point.y,
      baseRadius,
      renderedRadius: renderedScatterRadius(baseRadius, active),
      opacity,
      fill,
      active,
      visible,
      sizeValue,
      categoryId,
    });
  }

  if (!sortByRadius || sizeKey == null) {
    return layouts;
  }

  return layouts
    .map((entry, order) => ({ entry, order }))
    .sort(
      (left, right) => right.entry.baseRadius - left.entry.baseRadius || left.order - right.order,
    )
    .map(({ entry }) => entry);
};
