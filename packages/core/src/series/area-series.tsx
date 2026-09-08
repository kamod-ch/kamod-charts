import { useMemo } from "preact/hooks";
import { pointKey, uniquifyKeys } from "../animation/keys";
import { useChartContext, type DataAccessor } from "../core";
import type { ScaleKind } from "../scales";
import type { AreaFill } from "./area-fill";
import { isAreaGradientFill } from "./area-fill";
import {
  AreaGradientDef,
  AreaPointMarkers,
  createAreaGradientId,
  resolveAreaPathFill,
  resolveAreaStrokeStyle,
  shouldShowAreaPoints,
} from "./area-style";
import { getCartesianPoints, useCartesianScales } from "./cartesian";
import { buildAreaPath, type LineCurve } from "./paths";

export type { AreaFill, AreaGradientDirection, AreaGradientFill } from "./area-fill";

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
  fill?: AreaFill;
  curve?: LineCurve;
  outline?: boolean;
  strokeWidth?: number;
  strokeDasharray?: string;
  showPoints?: boolean | "auto";
  pointRadius?: number;
  activeIndex?: number | null;
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
  fill = "solid",
  curve = "linear",
  outline = false,
  strokeWidth,
  strokeDasharray,
  showPoints = false,
  pointRadius = 2.5,
  activeIndex = null,
  class: className,
}: AreaSeriesProps<TDatum>) => {
  const { data, xKey: contextXKey, ids } = useChartContext<TDatum>();
  const resolvedXKey = xKey ?? contextXKey;
  const seriesId = id ?? "series";
  const gradientId = createAreaGradientId(ids.root, seriesId);
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
  const keys = uniquifyKeys(points.map((point) => pointKey(seriesId, point.xValue, point.index)));
  const path = useMemo(() => buildAreaPath(points, curve, baselineY), [baselineY, curve, points]);
  const pathFill = resolveAreaPathFill(fill, color, opacity, gradientId);
  const strokeStyle = resolveAreaStrokeStyle(outline, color, strokeWidth, strokeDasharray);
  const markerPoints = useMemo(
    () =>
      points.flatMap((point, pointIndex) => {
        if (!point.defined || point.x == null || point.y == null) {
          return [];
        }

        return [
          {
            key: keys[pointIndex] ?? pointKey(seriesId, point.xValue, point.index),
            index: point.index,
            x: point.x,
            y: point.y,
          },
        ];
      }),
    [keys, points, seriesId],
  );
  const renderPoints = shouldShowAreaPoints(showPoints, points.length);

  return (
    <g class={className} data-kamod-chart-area-series="" data-kamod-chart-series-id={id}>
      {isAreaGradientFill(fill) ? (
        <defs>
          <AreaGradientDef id={gradientId} color={color} fill={fill} opacity={opacity} />
        </defs>
      ) : null}
      <path
        d={path}
        fill={pathFill.fill}
        fill-opacity={pathFill.fillOpacity}
        stroke={strokeStyle.stroke}
        stroke-width={strokeStyle.strokeWidth}
        stroke-dasharray={strokeStyle.strokeDasharray}
      />
      {renderPoints ? (
        <AreaPointMarkers
          points={markerPoints}
          color={color}
          pointRadius={pointRadius}
          activeIndex={activeIndex}
        />
      ) : null}
    </g>
  );
};
