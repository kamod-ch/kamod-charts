import { arc, pie, type PieArcDatum } from "d3-shape";
import { sliceKey, uniquifyKeys } from "../animation/keys";
import { normalizeAccessor, type DataAccessor } from "../core";
import { FULL_PIE_END_ANGLE, FULL_PIE_START_ANGLE, type ResolvedPieLayout } from "./pie-layout";
import {
  computeRoseOuterRadius,
  resolvePieRoseOptions,
  resolveRoseMinRadius,
  type PieRose,
} from "./pie-rose";

export type { PieRose, PieRoseOptions } from "./pie-rose";
export {
  computeRoseOuterRadius,
  normalizeRoseScale,
  resolvePieRoseOptions,
  resolveRoseMinRadius,
} from "./pie-rose";

export interface PieDatum<TDatum> {
  datum: TDatum;
  index: number;
  key: string;
  label: string;
  value: number;
  color: string;
  total: number;
  percentage: number;
}

export const defaultPieColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];

export const valueToPieLabel = (
  value: string | number | Date | null | undefined,
  index: number,
): string => {
  if (value == null) {
    return `Segment ${index + 1}`;
  }

  return value instanceof Date ? value.toISOString() : String(value);
};

/**
 * Normalizes a raw pie value for layout purposes.
 *
 * Non-finite values (`NaN`, `Infinity`, `null`, `undefined`) and negatives become `0`.
 * Only finite values strictly greater than `0` produce visible, navigable slices.
 */
export const normalizePieValue = (raw: number | null | undefined): number => {
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    return 0;
  }

  return Math.max(0, raw);
};

export type PieSortComparator<TDatum> = (a: PieDatum<TDatum>, b: PieDatum<TDatum>) => number;

export interface NormalizePieDataOptions<TDatum> {
  data: readonly TDatum[];
  valueKey: DataAccessor<TDatum, number | null | undefined>;
  labelKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  colors?: readonly string[];
  sort?: boolean | PieSortComparator<TDatum>;
  /** Stable slice keys excluded from geometry, totals, navigation, and tooltips. */
  hiddenKeys?: readonly string[];
}

export interface NormalizePieDataResult<TDatum> {
  /** Every input row in original order, including zero-value entries. */
  entries: PieDatum<TDatum>[];
  /** Positive slices in render order (sorted when requested). */
  visible: PieDatum<TDatum>[];
  total: number;
}

const sortVisibleEntries = <TDatum>(
  entries: PieDatum<TDatum>[],
  sort: boolean | PieSortComparator<TDatum> | undefined,
): PieDatum<TDatum>[] => {
  const positive = entries.filter((entry) => entry.value > 0);

  if (sort === false || sort === undefined) {
    return positive;
  }

  if (typeof sort === "function") {
    return [...positive].sort(sort);
  }

  return [...positive].sort((left, right) => right.value - left.value);
};

export const normalizePieData = <TDatum>({
  data,
  valueKey,
  labelKey,
  colors = defaultPieColors,
  sort = false,
  hiddenKeys = [],
}: NormalizePieDataOptions<TDatum>): NormalizePieDataResult<TDatum> => {
  const readValue = normalizeAccessor(valueKey);
  const readLabel = normalizeAccessor(labelKey ?? ((_datum: TDatum, index: number) => index));
  const hiddenKeySet = new Set(hiddenKeys);
  const provisional = data.map((datum, index) => {
    const value = normalizePieValue(readValue(datum, index));
    return {
      datum,
      index,
      label: valueToPieLabel(readLabel(datum, index), index),
      value,
      color: colors[index % colors.length] ?? "var(--chart-1)",
    };
  });
  const keys = uniquifyKeys(provisional.map((entry) => sliceKey(entry.label, entry.index)));
  const positive = provisional.filter((entry) => entry.value > 0);
  const drawable = positive.filter((entry) => {
    const key = keys[entry.index] ?? sliceKey(entry.label, entry.index);
    return !hiddenKeySet.has(key);
  });
  const total = drawable.reduce((sum, entry) => sum + entry.value, 0);
  const entries = provisional.map((entry) => {
    const key = keys[entry.index] ?? sliceKey(entry.label, entry.index);
    const isDrawable = entry.value > 0 && !hiddenKeySet.has(key);
    return {
      ...entry,
      key,
      total,
      percentage: isDrawable && total > 0 ? entry.value / total : 0,
    };
  });
  const visible = sortVisibleEntries(
    entries.filter((entry) => entry.value > 0 && !hiddenKeySet.has(entry.key)),
    sort,
  );

  return { entries, visible, total };
};

/** Picks the next visible slice index after hiding the active one in render order. */
export const resolveNextActiveIndexAfterHide = (
  hiddenIndex: number,
  currentVisible: readonly number[],
  nextVisible: readonly number[],
): number | null => {
  const position = currentVisible.indexOf(hiddenIndex);
  if (position === -1) {
    return null;
  }

  if (nextVisible.length === 0) {
    return null;
  }

  return nextVisible[Math.min(position, nextVisible.length - 1)] ?? null;
};

export interface PieSlice<TDatum> extends PieDatum<TDatum> {
  startAngle: number;
  endAngle: number;
  padAngle: number;
  innerRadius: number;
  outerRadius: number;
  cornerRadius: number;
}

export interface BuildPieSlicesOptions<TDatum> {
  data: readonly TDatum[];
  valueKey: DataAccessor<TDatum, number | null | undefined>;
  labelKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  innerRadius: number;
  outerRadius: number;
  padAngle: number;
  cornerRadius: number;
  sort?: boolean | PieSortComparator<TDatum>;
  colors?: readonly string[];
  hiddenKeys?: readonly string[];
  activeIndex?: number | null;
  activeOffset?: number;
  rose?: PieRose;
  startAngle?: number;
  endAngle?: number;
}

export const buildPieSlices = <TDatum>({
  data,
  valueKey,
  labelKey,
  innerRadius,
  outerRadius,
  padAngle,
  cornerRadius,
  sort = false,
  colors = defaultPieColors,
  hiddenKeys = [],
  activeIndex = null,
  activeOffset = 6,
  rose,
  startAngle = FULL_PIE_START_ANGLE,
  endAngle = FULL_PIE_END_ANGLE,
}: BuildPieSlicesOptions<TDatum>): { slices: PieSlice<TDatum>[]; total: number } => {
  const { visible, total } = normalizePieData({
    data,
    valueKey,
    labelKey,
    colors,
    sort,
    hiddenKeys,
  });
  const roseOptions = resolvePieRoseOptions(rose);

  if (roseOptions) {
    const scale = roseOptions.scale ?? "sqrt";
    const minRadius = resolveRoseMinRadius(innerRadius, outerRadius, roseOptions.minRadius);
    const maxValue = visible.reduce((max, entry) => Math.max(max, entry.value), 0);
    const generator = pie<PieDatum<TDatum>>()
      .value(() => 1)
      .padAngle(padAngle)
      .startAngle(startAngle)
      .endAngle(endAngle);

    if (sort === false) {
      generator.sort(null);
    } else if (typeof sort === "function") {
      generator.sort(sort);
    }

    const arcs = generator(visible);
    const slices = arcs.map((segment) => {
      const isActive = activeIndex === segment.data.index;
      const baseOuterRadius = computeRoseOuterRadius(
        segment.data.value,
        maxValue,
        innerRadius,
        outerRadius,
        minRadius,
        scale,
      );

      return {
        ...segment.data,
        startAngle: segment.startAngle,
        endAngle: segment.endAngle,
        padAngle: segment.padAngle,
        innerRadius,
        outerRadius: baseOuterRadius + (isActive ? activeOffset : 0),
        cornerRadius,
      };
    });

    return { slices, total };
  }

  const generator = pie<PieDatum<TDatum>>()
    .value((entry) => entry.value)
    .padAngle(padAngle)
    .startAngle(startAngle)
    .endAngle(endAngle);

  if (sort === false) {
    generator.sort(null);
  } else if (typeof sort === "function") {
    generator.sort(sort);
  }

  const arcs = generator(visible);
  const slices = arcs.map((segment) => {
    const isActive = activeIndex === segment.data.index;
    return {
      ...segment.data,
      startAngle: segment.startAngle,
      endAngle: segment.endAngle,
      padAngle: segment.padAngle,
      innerRadius,
      outerRadius: outerRadius + (isActive ? activeOffset : 0),
      cornerRadius,
    };
  });

  return { slices, total };
};

export const pieSlicePath = <TDatum>(slice: PieSlice<TDatum>): string => {
  const generator = arc<PieArcDatum<PieDatum<TDatum>>>()
    .innerRadius(slice.innerRadius)
    .outerRadius(slice.outerRadius)
    .cornerRadius(slice.cornerRadius);

  return (
    generator({
      data: slice,
      index: slice.index,
      value: slice.value,
      startAngle: slice.startAngle,
      endAngle: slice.endAngle,
      padAngle: slice.padAngle,
    }) ?? ""
  );
};

export const pieLabelPoint = <TDatum>(
  slice: PieSlice<TDatum>,
  labelPosition: "inside" | "outside",
): readonly [number, number] => {
  const radius =
    labelPosition === "outside"
      ? slice.outerRadius + 18
      : (slice.innerRadius + slice.outerRadius) / 2;
  const generator = arc<PieArcDatum<PieDatum<TDatum>>>().innerRadius(radius).outerRadius(radius);

  return generator.centroid({
    data: slice,
    index: slice.index,
    value: slice.value,
    startAngle: slice.startAngle,
    endAngle: slice.endAngle,
    padAngle: slice.padAngle,
  });
};

export const pieSliceAnchor = <TDatum>(slice: PieSlice<TDatum>): readonly [number, number] =>
  pieLabelPoint(slice, "inside");

export interface PieSliceContext<TDatum> {
  datum: TDatum;
  index: number;
  key: string;
  label: string;
  value: number;
  total: number;
  percentage: number;
  color: string;
  startAngle: number;
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
  active: boolean;
}

export const toPieSliceContext = <TDatum>(
  slice: PieSlice<TDatum>,
  active: boolean,
): PieSliceContext<TDatum> => ({
  datum: slice.datum,
  index: slice.index,
  key: slice.key,
  label: slice.label,
  value: slice.value,
  total: slice.total,
  percentage: slice.percentage,
  color: slice.color,
  startAngle: slice.startAngle,
  endAngle: slice.endAngle,
  innerRadius: slice.innerRadius,
  outerRadius: slice.outerRadius,
  active,
});

export const pieSliceSurfacePoint = <TDatum>(
  slice: PieSlice<TDatum>,
  plotArea: { x: number; y: number; width: number; height: number },
  layout: ResolvedPieLayout,
): { x: number; y: number } => {
  const [localX, localY] = pieSliceAnchor(slice);

  return {
    x: plotArea.x + layout.centerX + localX,
    y: plotArea.y + layout.centerY + localY,
  };
};
