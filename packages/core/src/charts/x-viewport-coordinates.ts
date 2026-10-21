import { getScalePosition } from "../axes";
import type { ChartCartesianScaleKind, DataAccessor } from "../core";
import { createCartesianScales } from "../series/cartesian";
import type { NumericDomain } from "../scales";
import { clampXViewportDomain, type ChartXViewportDomain } from "./x-viewport";

const indexAccessor = <TDatum>(_datum: TDatum, index: number): number => index;

export const projectXValueToPlot = <TDatum>(
  value: number | Date,
  {
    data,
    xKey,
    xScale,
    xDomain,
    plotWidth,
    yDomain = [0, 1],
  }: {
    data: readonly TDatum[];
    xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
    xScale?: ChartCartesianScaleKind;
    xDomain?: ChartXViewportDomain;
    plotWidth: number;
    yDomain?: NumericDomain;
  },
): number | null => {
  const { xScale: scale } = createCartesianScales({
    data,
    xKey,
    yKey: indexAccessor,
    xScale,
    xDomain,
    yDomain,
    xRange: [0, plotWidth],
    yRange: [1, 0],
  });
  const plotX = getScalePosition(scale, value as never);
  return typeof plotX === "number" && Number.isFinite(plotX) ? plotX : null;
};

export const invertPlotXToComparable = <TDatum>(
  plotX: number,
  {
    data,
    xKey,
    xScale,
    xDomain,
    plotWidth,
    yDomain = [0, 1],
  }: {
    data: readonly TDatum[];
    xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
    xScale?: ChartCartesianScaleKind;
    xDomain?: ChartXViewportDomain;
    plotWidth: number;
    yDomain?: NumericDomain;
  },
): number | null => {
  const left = projectXValueToPlot(xDomain?.[0] ?? (xScale === "time" ? new Date(0) : 0), {
    data,
    xKey,
    xScale,
    xDomain,
    plotWidth,
    yDomain,
  });
  const right = projectXValueToPlot(xDomain?.[1] ?? (xScale === "time" ? new Date(1) : 1), {
    data,
    xKey,
    xScale,
    xDomain,
    plotWidth,
    yDomain,
  });
  if (left == null || right == null || plotWidth <= 0) {
    return null;
  }
  const ratio = plotX / plotWidth;
  if (xDomain?.[0] instanceof Date) {
    const start = (xDomain[0] as Date).getTime();
    const end = (xDomain[1] as Date).getTime();
    return start + ratio * (end - start);
  }
  const start = xDomain?.[0] as number;
  const end = xDomain?.[1] as number;
  return start + ratio * (end - start);
};

export const panDomainByPlotDelta = (
  domain: ChartXViewportDomain,
  deltaPlotPx: number,
  plotWidth: number,
  extents: ChartXViewportDomain,
  xScale?: ChartCartesianScaleKind,
): ChartXViewportDomain => {
  if (plotWidth <= 0) {
    return domain;
  }
  if (domain[0] instanceof Date && domain[1] instanceof Date) {
    const span = domain[1].getTime() - domain[0].getTime();
    const deltaMs = (-deltaPlotPx / plotWidth) * span;
    const start = domain[0].getTime() + deltaMs;
    const end = domain[1].getTime() + deltaMs;
    return clampXViewportDomain([new Date(start), new Date(end)], extents, xScale);
  }
  const span = (domain[1] as number) - (domain[0] as number);
  const delta = (-deltaPlotPx / plotWidth) * span;
  return clampXViewportDomain(
    [(domain[0] as number) + delta, (domain[1] as number) + delta],
    extents,
    xScale,
  );
};
