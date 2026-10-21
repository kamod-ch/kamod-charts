import type { ChartCartesianScaleKind, DataAccessor } from "../core";
import type { NumericDomain } from "../scales";
import {
  type CartesianYAutoscale,
  type ChartXViewportDomain,
  filterDataForVisibleYAutoscale,
  resolveControlledChartXDomain,
} from "./x-viewport";

export const resolveCartesianYData = <TDatum>({
  data,
  xKey,
  xScale,
  resolvedXDomain,
  yAutoscale = "data",
}: {
  data: readonly TDatum[];
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ChartCartesianScaleKind;
  resolvedXDomain?: ChartXViewportDomain;
  yAutoscale?: CartesianYAutoscale;
}): readonly TDatum[] => {
  if (yAutoscale !== "visible" || resolvedXDomain == null) {
    return data;
  }
  const filtered = filterDataForVisibleYAutoscale(data, xKey, xScale, resolvedXDomain);
  return filtered.length > 0 ? filtered : data;
};

export const resolveCartesianViewport = <TDatum>({
  data,
  xKey,
  xScale,
  xDomain,
  yAutoscale = "data",
}: {
  data: readonly TDatum[];
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ChartCartesianScaleKind;
  xDomain?: ChartXViewportDomain;
  yAutoscale?: CartesianYAutoscale;
}): {
  resolvedXDomain?: ChartXViewportDomain;
  dataForYDomain: readonly TDatum[];
} => {
  const resolvedXDomain = resolveControlledChartXDomain(xDomain, xScale);
  const dataForYDomain = resolveCartesianYData({
    data,
    xKey,
    xScale,
    resolvedXDomain,
    yAutoscale,
  });
  return { resolvedXDomain, dataForYDomain };
};

export type { NumericDomain };
