import { pointKey, uniquifyKeys } from "../animation/keys";
import type { ChartCartesianScaleKind, DataAccessor } from "../core";
import { createCartesianScales, getCartesianPoints } from "../series/cartesian";
import { getSeriesId } from "./series-identity";
import type { ScatterCategoryContext } from "./scatter-model";
import { resolveScatterPoints, type ResolvedScatterPoint } from "./scatter-model";
import { buildScatterSeriesLayout } from "./scatter-series-layout";
import type { ScatterSizeScale } from "./scatter-size";
import type {
  ScatterCategoryConfig,
  ScatterCategoryValue,
  ScatterPointContext,
  ScatterSeriesConfig,
} from "./types";

export interface ScatterInteractionCandidate<TDatum> {
  index: number;
  seriesIndex: number;
  seriesId: string;
  plotX: number;
  plotY: number;
  baseRadius: number;
  zOrder: number;
  point: ResolvedScatterPoint<TDatum>;
}

export interface ScatterInteractionTarget {
  index: number;
  seriesIndex: number;
  seriesId: string;
}

export interface BuildScatterInteractionCandidatesOptions<TDatum> {
  data: readonly TDatum[];
  series: readonly ScatterSeriesConfig<TDatum>[];
  visibleSeries: readonly ScatterSeriesConfig<TDatum>[];
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ChartCartesianScaleKind;
  yDomain: readonly [number, number];
  plotWidth: number;
  plotHeight: number;
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
  categoryContext?: ScatterCategoryContext<TDatum> | null;
  sortByRadius?: boolean;
}

const indexXKey = <TDatum>(_datum: TDatum, index: number): number => index;

export const toScatterPointContext = <TDatum>(
  point: ResolvedScatterPoint<TDatum>,
  active: boolean,
): ScatterPointContext<TDatum> => ({
  datum: point.datum,
  index: point.index,
  seriesId: point.seriesId,
  seriesLabel: point.seriesLabel,
  xValue: point.xValue,
  yValue: point.yValue,
  sizeValue: point.sizeValue,
  radius: point.radius,
  categoryValue: point.categoryValue,
  categoryId: point.categoryId,
  categoryLabel: point.categoryLabel,
  color: point.color,
  active,
});

export const buildScatterInteractionCandidates = <TDatum>({
  data,
  series,
  visibleSeries,
  xKey,
  xScale,
  yDomain,
  plotWidth,
  plotHeight,
  sizeKey,
  sizeScale,
  sizeDomain,
  pointRadiusRange,
  pointRadius,
  pointSize,
  categoryKey,
  categories,
  hiddenCategoryIds = [],
  hiddenSeriesIds = [],
  categoryContext = null,
  sortByRadius = false,
}: BuildScatterInteractionCandidatesOptions<TDatum>): ScatterInteractionCandidate<TDatum>[] => {
  const { points } = resolveScatterPoints({
    data,
    series,
    xKey,
    sizeKey,
    sizeScale,
    sizeDomain,
    pointRadiusRange,
    pointRadius,
    pointSize,
    categoryKey,
    categories,
    hiddenCategoryIds,
    hiddenSeriesIds,
  });
  const pointByKey = new Map(points.map((point) => [`${point.index}:${point.seriesId}`, point]));
  const yKey = visibleSeries[0]?.key ?? indexXKey;
  const { xScale: resolvedXScale, yScale } = createCartesianScales({
    data,
    xKey,
    yKey,
    xScale,
    yDomain,
    xRange: [0, plotWidth],
    yRange: [plotHeight, 0],
  });
  const resolvedXKey = xKey ?? indexXKey;
  const candidates: ScatterInteractionCandidate<TDatum>[] = [];
  let zOrder = 0;

  for (const [seriesIndex, entry] of visibleSeries.entries()) {
    const seriesId = getSeriesId(entry, seriesIndex);
    const cartesianPoints = getCartesianPoints(
      data,
      resolvedXScale,
      yScale,
      resolvedXKey,
      entry.key,
    );
    const keys = uniquifyKeys(
      cartesianPoints.map((point) =>
        pointKey(
          seriesId,
          point.xValue,
          point.index,
          typeof point.yValue === "number" ? point.yValue : null,
        ),
      ),
    );
    const layouts = buildScatterSeriesLayout({
      points: cartesianPoints,
      seriesId,
      keys,
      color: entry.color ?? "var(--chart-1)",
      data,
      sizeKey,
      sizeScale,
      sizeDomain,
      pointRadiusRange,
      pointRadius,
      pointSize,
      seriesPointRadius: entry.pointRadius,
      categoryContext,
      sortByRadius,
    });

    for (const layout of layouts) {
      if (!layout.visible) {
        continue;
      }

      const point = pointByKey.get(`${layout.index}:${seriesId}`);
      if (!point?.visible) {
        continue;
      }

      candidates.push({
        index: layout.index,
        seriesIndex,
        seriesId,
        plotX: layout.cx,
        plotY: layout.cy,
        baseRadius: layout.baseRadius,
        zOrder: zOrder++,
        point,
      });
    }
  }

  return candidates;
};

export const findNearestScatterCandidate = <TDatum>(
  candidates: readonly ScatterInteractionCandidate<TDatum>[],
  plotX: number,
  plotY: number,
): ScatterInteractionCandidate<TDatum> | null => {
  let nearest: ScatterInteractionCandidate<TDatum> | null = null;
  let nearestEdge = Number.POSITIVE_INFINITY;
  let nearestCenter = Number.POSITIVE_INFINITY;
  let nearestZOrder = Number.NEGATIVE_INFINITY;

  for (const candidate of candidates) {
    const centerDistance = Math.hypot(candidate.plotX - plotX, candidate.plotY - plotY);
    const edgeDistance = Math.max(0, centerDistance - candidate.baseRadius);
    const isBetter =
      nearest == null ||
      edgeDistance < nearestEdge ||
      (edgeDistance === nearestEdge && centerDistance < nearestCenter) ||
      (edgeDistance === nearestEdge &&
        centerDistance === nearestCenter &&
        candidate.zOrder > nearestZOrder);

    if (isBetter) {
      nearest = candidate;
      nearestEdge = edgeDistance;
      nearestCenter = centerDistance;
      nearestZOrder = candidate.zOrder;
    }
  }

  return nearest;
};

export const buildScatterInteractionTargets = <TDatum>(
  candidates: readonly ScatterInteractionCandidate<TDatum>[],
): ScatterInteractionTarget[] =>
  candidates.map((candidate) => ({
    index: candidate.index,
    seriesIndex: candidate.seriesIndex,
    seriesId: candidate.seriesId,
  }));

export const isScatterInteractionTargetValid = (
  targets: readonly ScatterInteractionTarget[],
  activeIndex: number | null,
  activeSeriesIndex: number,
): boolean => {
  if (activeIndex == null || targets.length === 0) {
    return false;
  }

  return targets.some(
    (target) => target.index === activeIndex && target.seriesIndex === activeSeriesIndex,
  );
};
