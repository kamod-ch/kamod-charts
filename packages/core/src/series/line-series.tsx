import { useMemo } from "preact/hooks";
import { pointKey, uniquifyKeys } from "../animation/keys";
import { useChartContext, type DataAccessor } from "../core";
import type { ScaleKind } from "../scales";
import { getCartesianPoints, useCartesianScales } from "./cartesian";
import { type RenderPoint, renderPointSlot } from "./mark-slots";
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
  seriesLabel?: string;
  renderPoint?: RenderPoint<TDatum>;
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
  seriesLabel,
  renderPoint,
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
        ? points.map((point, pointIndex) => {
            if (!point.defined || point.x == null || point.y == null) {
              return null;
            }
            const key = keys[pointIndex] ?? pointKey(seriesId, point.xValue, point.index);
            const active = activeIndex === point.index;
            return (
              <g key={key}>
                {renderPointSlot(
                  {
                    datum: point.datum,
                    index: point.index,
                    seriesId,
                    seriesLabel,
                    value: point.yValue ?? null,
                    x: point.x,
                    y: point.y,
                    color,
                    opacity: 1,
                    active,
                    hidden: false,
                    key,
                    pointRadius,
                  },
                  renderPoint,
                )}
              </g>
            );
          })
        : null}
    </g>
  );
};
