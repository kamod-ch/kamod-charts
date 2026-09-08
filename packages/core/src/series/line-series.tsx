import { useMemo } from "preact/hooks";
import { pointKey, uniquifyKeys } from "../animation/keys";
import { useChartContext, type DataAccessor } from "../core";
import type { ScaleKind } from "../scales";
import { getCartesianPoints, useCartesianScales } from "./cartesian";
import { buildLinePath, type LineCurve } from "./paths";

export type { LineCurve };

export interface LineSeriesProps<TDatum> {
  dataKey: DataAccessor<TDatum, number | null | undefined>;
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ScaleKind;
  xDomain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
  yDomain?: readonly [number, number];
  id?: string;
  color?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  curve?: LineCurve;
  connectNulls?: boolean;
  showPoints?: boolean | "auto";
  pointRadius?: number;
  activeIndex?: number | null;
  class?: string;
}

export const LineSeries = <TDatum,>({
  dataKey,
  xKey,
  xScale,
  xDomain,
  yDomain,
  id,
  color = "var(--chart-1)",
  strokeWidth = 2,
  strokeDasharray,
  curve = "linear",
  connectNulls = false,
  showPoints = "auto",
  pointRadius = 2.5,
  activeIndex = null,
  class: className,
}: LineSeriesProps<TDatum>) => {
  const { data, xKey: contextXKey } = useChartContext<TDatum>();
  const resolvedXKey = xKey ?? contextXKey;
  const seriesId = id ?? "series";
  const scales = useCartesianScales({
    xKey: resolvedXKey,
    yKey: dataKey,
    xScale,
    xDomain,
    yDomain,
  });
  const points = useMemo(
    () => getCartesianPoints(data, scales.xScale, scales.yScale, resolvedXKey, dataKey),
    [data, dataKey, resolvedXKey, scales.xScale, scales.yScale],
  );
  const keys = uniquifyKeys(points.map((point) => pointKey(seriesId, point.xValue, point.index)));
  const path = useMemo(
    () => buildLinePath(points, curve, connectNulls),
    [connectNulls, curve, points],
  );
  const shouldShowPoints = showPoints === true || (showPoints === "auto" && points.length <= 500);
  const activePointRadius = pointRadius + 1.5;

  return (
    <g class={className} data-kamod-chart-line-series="" data-kamod-chart-series-id={id}>
      <path
        d={path}
        fill="none"
        stroke={color}
        stroke-width={strokeWidth}
        stroke-dasharray={strokeDasharray}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      {shouldShowPoints
        ? points.map((point, pointIndex) =>
            point.defined ? (
              <circle
                key={keys[pointIndex]}
                cx={point.x ?? 0}
                cy={point.y ?? 0}
                r={activeIndex === point.index ? activePointRadius : pointRadius}
                fill={color}
                stroke="var(--chart-tooltip-background)"
                stroke-width={activeIndex === point.index ? 2 : 1}
                data-kamod-chart-key={keys[pointIndex]}
                data-kamod-chart-active={activeIndex === point.index ? "true" : undefined}
              />
            ) : null,
          )
        : null}
    </g>
  );
};
