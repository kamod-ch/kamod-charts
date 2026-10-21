import { getScalePosition } from "../axes";
import { defaultChartMargin, normalizeMargin, calculatePlotArea } from "../core/chart-layout";
import type { ChartCartesianScaleKind, DataAccessor } from "../core";
import { normalizeAccessor } from "../core";
import {
  findNearestProjectedPoint,
  findNearestProjectedX,
  type CartesianHitResult,
} from "../interaction/hit-testing";
import type { NumericDomain } from "../scales";
import { createCartesianScales, getCartesianPoints } from "../series/cartesian";
import { type CartesianXIndex, findNearestIndexOnXIndex } from "./cartesian-x-index";
import type { ChartXViewportDomain } from "./x-viewport";
import { getStackedSeriesValueAt } from "../series/stacked-line-points";
import type { StackSeries } from "../series/stack";

export type CartesianActivePoint = {
  surfaceX: number;
  surfaceY: number;
  plotX: number;
  plotY: number;
};

export type { CartesianHitResult };

type CartesianHitSeries<TDatum> = {
  key: DataAccessor<TDatum, number | null | undefined>;
};

const indexAccessor = <TDatum>(_datum: TDatum, index: number): number => index;

export const resolvePlotAreaFromSize = (width: number, height: number) =>
  calculatePlotArea({ width, height }, normalizeMargin(defaultChartMargin));

export const resolveCartesianActivePoint = <TDatum>({
  data,
  index,
  seriesKey,
  xKey,
  xScale: xScaleKind,
  xDomain,
  yDomain,
  plotWidth,
  plotHeight,
  plotOffsetX,
  plotOffsetY,
}: {
  data: readonly TDatum[];
  index: number;
  seriesKey: DataAccessor<TDatum, number | null | undefined>;
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ChartCartesianScaleKind;
  xDomain?: ChartXViewportDomain;
  yDomain: NumericDomain;
  plotWidth: number;
  plotHeight: number;
  plotOffsetX: number;
  plotOffsetY: number;
}): CartesianActivePoint | null => {
  const datum = data[index];
  if (!datum) {
    return null;
  }

  const { xScale, yScale } = createCartesianScales({
    data,
    xKey,
    yKey: seriesKey,
    xScale: xScaleKind,
    xDomain,
    yDomain,
    xRange: [0, plotWidth],
    yRange: [plotHeight, 0],
  });
  const readX = normalizeAccessor(xKey ?? indexAccessor);
  const readY = normalizeAccessor(seriesKey);
  const xValue = readX(datum, index);
  const yValue = readY(datum, index);

  if (xValue == null || typeof yValue !== "number" || !Number.isFinite(yValue)) {
    return null;
  }

  const plotX = getScalePosition(xScale, xValue as never);
  const plotY = getScalePosition(yScale, yValue);

  if (typeof plotX !== "number" || typeof plotY !== "number") {
    return null;
  }

  return {
    plotX,
    plotY,
    surfaceX: plotOffsetX + plotX,
    surfaceY: plotOffsetY + plotY,
  };
};

export const resolveStackedCartesianActivePoint = <TDatum>({
  data,
  index,
  stackSeries,
  activeSeriesId,
  xKey,
  xScale: xScaleKind,
  xDomain,
  yDomain,
  plotWidth,
  plotHeight,
  plotOffsetX,
  plotOffsetY,
}: {
  data: readonly TDatum[];
  index: number;
  stackSeries: readonly StackSeries<TDatum>[];
  activeSeriesId: string;
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ChartCartesianScaleKind;
  xDomain?: ChartXViewportDomain;
  yDomain: NumericDomain;
  plotWidth: number;
  plotHeight: number;
  plotOffsetX: number;
  plotOffsetY: number;
}): CartesianActivePoint | null => {
  const datum = data[index];
  if (!datum) {
    return null;
  }

  const stackPoint = getStackedSeriesValueAt(data, stackSeries, activeSeriesId, index);
  if (!stackPoint) {
    return null;
  }

  const { xScale, yScale } = createCartesianScales({
    data,
    xKey,
    yKey: stackSeries[0]?.value ?? indexAccessor,
    xScale: xScaleKind,
    xDomain,
    yDomain,
    xRange: [0, plotWidth],
    yRange: [plotHeight, 0],
  });
  const readX = normalizeAccessor(xKey ?? indexAccessor);
  const xValue = readX(datum, index);

  if (xValue == null) {
    return null;
  }

  const plotX = getScalePosition(xScale, xValue as never);
  const plotY = getScalePosition(yScale, stackPoint.y1);

  if (typeof plotX !== "number" || typeof plotY !== "number") {
    return null;
  }

  return {
    plotX,
    plotY,
    surfaceX: plotOffsetX + plotX,
    surfaceY: plotOffsetY + plotY,
  };
};

export const findNearestCartesianIndexByX = <TDatum>({
  data,
  xKey,
  xScale: xScaleKind,
  plotWidth,
  plotX,
  xIndex,
  xDomain,
  yDomain = [0, 1],
  seriesKey = indexAccessor as DataAccessor<TDatum, number | null | undefined>,
}: {
  data: readonly TDatum[];
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ChartCartesianScaleKind;
  plotWidth: number;
  plotX: number;
  xIndex?: CartesianXIndex | null;
  xDomain?: ChartXViewportDomain;
  yDomain?: NumericDomain;
  seriesKey?: DataAccessor<TDatum, number | null | undefined>;
}): number | null => {
  if (data.length === 0 || plotWidth <= 0) {
    return null;
  }

  if (xIndex) {
    return findNearestIndexOnXIndex(xIndex, plotX);
  }

  const { xScale } = createCartesianScales({
    data,
    xKey,
    yKey: seriesKey,
    xScale: xScaleKind,
    xDomain,
    yDomain,
    xRange: [0, plotWidth],
    yRange: [1, 0],
  });
  const readX = normalizeAccessor(xKey ?? indexAccessor);
  const candidates: { index: number; x: number }[] = [];

  for (const [index, datum] of data.entries()) {
    const xValue = readX(datum, index);
    if (xValue == null) {
      continue;
    }

    const x = getScalePosition(xScale, xValue as never);
    if (typeof x !== "number" || !Number.isFinite(x)) {
      continue;
    }

    candidates.push({ index, x });
  }

  const nearest = findNearestProjectedX(candidates, plotX);

  return nearest?.index ?? null;
};

export const findNearestCartesianPoint = <TDatum>({
  data,
  series,
  xKey,
  xScale: xScaleKind,
  yDomain,
  plotWidth,
  plotHeight,
  plotX,
  plotY,
}: {
  data: readonly TDatum[];
  series: readonly CartesianHitSeries<TDatum>[];
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ChartCartesianScaleKind;
  yDomain: NumericDomain;
  plotWidth: number;
  plotHeight: number;
  plotX: number;
  plotY: number;
}): CartesianHitResult | null => {
  if (data.length === 0 || series.length === 0 || plotWidth <= 0 || plotHeight <= 0) {
    return null;
  }

  const { xScale, yScale } = createCartesianScales({
    data,
    xKey,
    yKey: series[0]!.key,
    xScale: xScaleKind,
    yDomain,
    xRange: [0, plotWidth],
    yRange: [plotHeight, 0],
  });
  const candidates = series.flatMap((entry, seriesIndex) =>
    getCartesianPoints(data, xScale, yScale, xKey, entry.key).flatMap((point) =>
      point.defined &&
      point.x != null &&
      point.y != null &&
      Number.isFinite(point.x) &&
      Number.isFinite(point.y)
        ? [{ index: point.index, seriesIndex, x: point.x, y: point.y }]
        : [],
    ),
  );

  return findNearestProjectedPoint(candidates, plotX, plotY);
};
