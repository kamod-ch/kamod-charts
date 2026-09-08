import { uniquifyKeys } from "../animation/keys";
import type { DataAccessor } from "../core";
import { normalizeAccessor } from "../core";
import { getSeriesId } from "./series-identity";
import {
  DEFAULT_SCATTER_POINT_RADIUS_RANGE,
  DEFAULT_SCATTER_SIZE_SCALE,
  inferScatterSizeDomain,
  resolveScatterRadius,
  type ScatterSizeScale,
} from "./scatter-size";
import type { ScatterCategoryConfig, ScatterCategoryValue, ScatterSeriesConfig } from "./types";

export const SCATTER_CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
] as const;

export const SCATTER_CHART_COLOR_COUNT = SCATTER_CHART_COLORS.length;

export const encodeScatterCategoryId = (value: ScatterCategoryValue): string =>
  typeof value === "number" ? `n:${value}` : `s:${value}`;

export const isValidScatterCategoryValue = (value: unknown): value is ScatterCategoryValue => {
  if (typeof value === "string") {
    return value.length > 0;
  }

  return typeof value === "number" && Number.isFinite(value);
};

export const defaultScatterCategoryLabel = (value: ScatterCategoryValue): string => String(value);

export interface ResolvedScatterCategory {
  id: string;
  value: ScatterCategoryValue;
  label: string;
  color: string;
  hidden: boolean;
}

export interface ResolvedScatterPoint<TDatum> {
  datum: TDatum;
  index: number;
  seriesId: string;
  seriesLabel: string | undefined;
  xValue: string | number | Date | null;
  yValue: number | null;
  sizeValue: number | null;
  radius: number;
  categoryValue: ScatterCategoryValue | null;
  categoryId: string | null;
  categoryLabel: string | null;
  color: string;
  active: boolean;
  visible: boolean;
}

export const deriveScatterCategoriesFromData = <TDatum>(
  data: readonly TDatum[],
  categoryKey: DataAccessor<TDatum, ScatterCategoryValue | null | undefined>,
): ScatterCategoryValue[] => {
  const read = normalizeAccessor(categoryKey);
  const seen = new Set<string>();
  const order: ScatterCategoryValue[] = [];

  for (const [index, datum] of data.entries()) {
    const value = read(datum, index);
    if (!isValidScatterCategoryValue(value)) {
      continue;
    }

    const id = encodeScatterCategoryId(value);
    if (seen.has(id)) {
      continue;
    }

    seen.add(id);
    order.push(value);
  }

  return order;
};

const defaultCategoryColor = (
  index: number,
  colors: readonly string[] = SCATTER_CHART_COLORS,
): string => colors[index % colors.length] ?? SCATTER_CHART_COLORS[0]!;

type ProvisionalScatterCategory = {
  rawId: string;
  value: ScatterCategoryValue;
  label: string;
  color: string;
  hidden: boolean;
};

export const mergeScatterCategories = (
  explicit: readonly ScatterCategoryConfig[] | undefined,
  discovered: readonly ScatterCategoryValue[],
  colors: readonly string[] = SCATTER_CHART_COLORS,
): ResolvedScatterCategory[] => {
  const provisional: ProvisionalScatterCategory[] = [];

  if (explicit) {
    for (const config of explicit) {
      provisional.push({
        rawId: config.id ?? encodeScatterCategoryId(config.value),
        value: config.value,
        label: config.label ?? defaultScatterCategoryLabel(config.value),
        color: config.color ?? "",
        hidden: config.hidden ?? false,
      });
    }
  }

  const explicitIds = new Set(provisional.map((entry) => encodeScatterCategoryId(entry.value)));

  for (const value of discovered) {
    if (explicitIds.has(encodeScatterCategoryId(value))) {
      continue;
    }

    provisional.push({
      rawId: encodeScatterCategoryId(value),
      value,
      label: defaultScatterCategoryLabel(value),
      color: "",
      hidden: false,
    });
  }

  const uniqueIds = uniquifyKeys(provisional.map((entry) => entry.rawId));

  return provisional.map((entry, index) => ({
    id: uniqueIds[index] ?? entry.rawId,
    value: entry.value,
    label: entry.label,
    color: entry.color || defaultCategoryColor(index, colors),
    hidden: entry.hidden,
  }));
};

export interface ScatterDatumCategoryState {
  categoryValue: ScatterCategoryValue | null;
  categoryId: string | null;
  categoryLabel: string | null;
  categoryColor: string | null;
  renderable: boolean;
}

export interface ScatterCategoryContext<TDatum> {
  categories: readonly ResolvedScatterCategory[];
  resolveDatumCategory: (datum: TDatum, index: number) => ScatterDatumCategoryState;
  isCategoryLegendHidden: (categoryId: string) => boolean;
}

export const isScatterCategoryHidden = (
  category: ResolvedScatterCategory,
  hiddenCategoryIds: readonly string[],
): boolean => category.hidden || hiddenCategoryIds.includes(category.id);

export const resolveScatterDatumCategoryState = <TDatum>(
  datum: TDatum,
  index: number,
  categoryKey: DataAccessor<TDatum, ScatterCategoryValue | null | undefined>,
  categoryByValue: ReadonlyMap<string, ResolvedScatterCategory>,
  hiddenCategoryIds: readonly string[],
): ScatterDatumCategoryState => {
  const read = normalizeAccessor(categoryKey);
  const raw = read(datum, index);

  if (!isValidScatterCategoryValue(raw)) {
    return {
      categoryValue: null,
      categoryId: null,
      categoryLabel: null,
      categoryColor: null,
      renderable: false,
    };
  }

  const entry = categoryByValue.get(encodeScatterCategoryId(raw));
  if (!entry) {
    return {
      categoryValue: raw,
      categoryId: null,
      categoryLabel: null,
      categoryColor: null,
      renderable: false,
    };
  }

  const hidden = isScatterCategoryHidden(entry, hiddenCategoryIds);

  return {
    categoryValue: raw,
    categoryId: entry.id,
    categoryLabel: entry.label,
    categoryColor: entry.color,
    renderable: !hidden,
  };
};

export const createScatterCategoryContext = <TDatum>({
  data,
  categoryKey,
  categories,
  hiddenCategoryIds = [],
}: {
  data: readonly TDatum[];
  categoryKey: DataAccessor<TDatum, ScatterCategoryValue | null | undefined>;
  categories?: readonly ScatterCategoryConfig[];
  hiddenCategoryIds?: readonly string[];
}): ScatterCategoryContext<TDatum> => {
  const discovered = deriveScatterCategoriesFromData(data, categoryKey);
  const resolvedCategories = mergeScatterCategories(categories, discovered);
  const categoryByValue = new Map(
    resolvedCategories.map((entry) => [encodeScatterCategoryId(entry.value), entry]),
  );

  return {
    categories: resolvedCategories,
    isCategoryLegendHidden: (categoryId: string) => {
      const entry = resolvedCategories.find((item) => item.id === categoryId);
      return entry ? isScatterCategoryHidden(entry, hiddenCategoryIds) : false;
    },
    resolveDatumCategory: (datum, index) =>
      resolveScatterDatumCategoryState(
        datum,
        index,
        categoryKey,
        categoryByValue,
        hiddenCategoryIds,
      ),
  };
};

export const isScatterDatumActiveHidden = <TDatum>(
  data: readonly TDatum[],
  activeIndex: number | null,
  categoryContext: ScatterCategoryContext<TDatum> | null,
): boolean => {
  if (activeIndex == null || categoryContext == null) {
    return false;
  }

  const datum = data[activeIndex];
  if (datum == null) {
    return true;
  }

  return !categoryContext.resolveDatumCategory(datum, activeIndex).renderable;
};

export interface ResolveScatterPointsOptions<TDatum> {
  data: readonly TDatum[];
  series: readonly ScatterSeriesConfig<TDatum>[];
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  sizeKey?: DataAccessor<TDatum, number | null | undefined>;
  sizeScale?: ScatterSizeScale;
  sizeDomain?: readonly [number, number];
  pointRadiusRange?: readonly [number, number];
  pointRadius?: number | ((datum: TDatum, index: number) => number);
  pointSize?: number | ((datum: TDatum, index: number) => number);
  categoryKey?: DataAccessor<TDatum, ScatterCategoryValue | null | undefined>;
  categories?: readonly ScatterCategoryConfig[];
  hiddenCategoryIds?: readonly string[];
  hiddenSeriesIds?: readonly string[];
  activeIndex?: number | null;
  activeSeriesId?: string | null;
}

export interface ResolveScatterPointsResult<TDatum> {
  points: ResolvedScatterPoint<TDatum>[];
  categories: readonly ResolvedScatterCategory[];
  sizeDomain: [number, number];
}

const isFiniteYValue = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export const resolveScatterPoints = <TDatum>({
  data,
  series,
  xKey,
  sizeKey,
  sizeScale = DEFAULT_SCATTER_SIZE_SCALE,
  sizeDomain,
  pointRadiusRange = DEFAULT_SCATTER_POINT_RADIUS_RANGE,
  pointRadius,
  pointSize,
  categoryKey,
  categories,
  hiddenCategoryIds = [],
  hiddenSeriesIds = [],
  activeIndex = null,
  activeSeriesId = null,
}: ResolveScatterPointsOptions<TDatum>): ResolveScatterPointsResult<TDatum> => {
  const hiddenSeries = new Set(hiddenSeriesIds);
  const readX = normalizeAccessor(xKey ?? ((_datum: TDatum, index: number) => index));
  const categoryContext =
    categoryKey != null
      ? createScatterCategoryContext({ data, categoryKey, categories, hiddenCategoryIds })
      : null;
  const resolvedSizeDomain =
    sizeKey != null
      ? inferScatterSizeDomain(data, sizeKey, sizeDomain)
      : ([0, 0] as [number, number]);
  const resolvedCategories = categoryContext?.categories ?? [];
  const visibleSeries = series.filter(
    (entry, index) => !entry.hidden && !hiddenSeries.has(getSeriesId(entry, index)),
  );
  const points: ResolvedScatterPoint<TDatum>[] = [];

  for (const [index, datum] of data.entries()) {
    const xValue = readX(datum, index) ?? null;
    const categoryState = categoryContext?.resolveDatumCategory(datum, index);
    const categoryRenderable = categoryContext == null || (categoryState?.renderable ?? false);

    for (const [seriesIndex, entry] of visibleSeries.entries()) {
      const seriesId = getSeriesId(entry, seriesIndex);
      const readY = normalizeAccessor(entry.key);
      const yValue = readY(datum, index);
      const yValid = isFiniteYValue(yValue);
      const seriesColor = entry.color ?? defaultCategoryColor(seriesIndex);
      const color =
        categoryContext && categoryState?.categoryColor ? categoryState.categoryColor : seriesColor;
      const { radius, sizeValue, sizeValid } = resolveScatterRadius({
        datum,
        index,
        sizeKey,
        sizeScale,
        sizeDomain: resolvedSizeDomain,
        pointRadiusRange,
        pointRadius,
        pointSize,
        seriesPointRadius: entry.pointRadius,
        data,
      });
      const active =
        activeIndex === index && (activeSeriesId == null || activeSeriesId === seriesId);
      const visible = categoryRenderable && sizeValid && yValid && xValue != null;

      points.push({
        datum,
        index,
        seriesId,
        seriesLabel: entry.label,
        xValue,
        yValue: yValid ? yValue : null,
        sizeValue,
        radius,
        categoryValue: categoryState?.categoryValue ?? null,
        categoryId: categoryState?.categoryId ?? null,
        categoryLabel: categoryState?.categoryLabel ?? null,
        color,
        active,
        visible,
      });
    }
  }

  return {
    points,
    categories: resolvedCategories,
    sizeDomain: resolvedSizeDomain,
  };
};
