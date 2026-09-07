import { useMemo } from "preact/hooks";
import { useChartContext, type DataAccessor } from "../core";
import type { ScaleKind } from "../scales";
import { getCartesianPoints, useCartesianScales } from "./cartesian";
import { buildAreaPath, type LineCurve } from "./paths";

export interface AreaSeriesProps<TDatum> {
  dataKey: DataAccessor<TDatum, number | null | undefined>;
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ScaleKind;
  xDomain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
  yDomain?: readonly [number, number];
  baseline?: number;
  id?: string;
  color?: string;
  opacity?: number;
  curve?: LineCurve;
  outline?: boolean;
  class?: string;
}

export const AreaSeries = <TDatum,>({
  dataKey,
  xKey,
  xScale,
  xDomain,
  yDomain,
  baseline = 0,
  id,
  color = "var(--chart-1)",
  opacity = 0.2,
  curve = "linear",
  outline = false,
  class: className,
}: AreaSeriesProps<TDatum>) => {
  const { data, xKey: contextXKey } = useChartContext<TDatum>();
  const resolvedXKey = xKey ?? contextXKey;
  const scales = useCartesianScales({
    xKey: resolvedXKey,
    yKey: dataKey,
    xScale,
    xDomain,
    yDomain,
  });
  const baselineY = scales.yScale(baseline as never) ?? 0;
  const points = useMemo(
    () => getCartesianPoints(data, scales.xScale, scales.yScale, resolvedXKey, dataKey),
    [data, dataKey, resolvedXKey, scales.xScale, scales.yScale],
  );
  const path = useMemo(() => buildAreaPath(points, curve, baselineY), [baselineY, curve, points]);

  return (
    <g class={className} data-kamod-chart-area-series="" data-kamod-chart-series-id={id}>
      <path d={path} fill={color} fill-opacity={opacity} stroke={outline ? color : "none"} />
    </g>
  );
};
