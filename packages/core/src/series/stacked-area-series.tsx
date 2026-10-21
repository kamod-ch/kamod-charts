import { area } from "d3-shape";
import { pointKey, uniquifyKeys } from "../animation/keys";
import { normalizeAccessor, useChartContext, type DataAccessor } from "../core";
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
import { getStackedValues, type StackSeries } from "./stack";
import { useCartesianScales } from "./cartesian";
import { resolveCurve, type LineCurve } from "./paths";

export interface StackedAreaSeriesProps<TDatum> {
  series: readonly (StackSeries<TDatum> & { color?: string })[];
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ScaleKind;
  xDomain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
  yDomain: readonly [number, number];
  opacity?: number;
  fill?: AreaFill;
  curve?: LineCurve;
  outline?: boolean;
  strokeWidth?: number;
  strokeDasharray?: string;
  showPoints?: boolean | "auto";
  pointRadius?: number;
  activeIndex?: number | null;
  activeSeriesId?: string | null;
}

export const StackedAreaSeries = <TDatum,>({
  series,
  xKey,
  xScale,
  xDomain,
  yDomain,
  opacity = 0.2,
  fill = "solid",
  curve = "linear",
  outline = false,
  strokeWidth,
  strokeDasharray,
  showPoints = false,
  pointRadius = 2.5,
  activeIndex = null,
  activeSeriesId = null,
}: StackedAreaSeriesProps<TDatum>) => {
  const { data, xKey: contextXKey, ids } = useChartContext<TDatum>();
  const resolvedXKey = xKey ?? contextXKey;
  const scales = useCartesianScales({
    xKey: resolvedXKey,
    yKey: series[0]?.value ?? (() => 0),
    xScale,
    xDomain,
    yDomain,
  });
  const readX = normalizeAccessor(resolvedXKey ?? ((_datum: TDatum, index: number) => index));
  const layers = getStackedValues(data, series);
  const renderPoints = shouldShowAreaPoints(showPoints, data.length);

  return (
    <g data-kamod-chart-stacked-area-series="">
      {isAreaGradientFill(fill) ? (
        <defs>
          {series.map((entry, layerIndex) => {
            const seriesId = entry.id ?? `series-${layerIndex}`;
            const color = entry.color ?? `var(--chart-${(layerIndex % 4) + 1})`;
            return (
              <AreaGradientDef
                key={seriesId}
                id={createAreaGradientId(ids.root, seriesId)}
                color={color}
                fill={fill}
                opacity={opacity}
              />
            );
          })}
        </defs>
      ) : null}
      {layers.map((layer, layerIndex) => {
        const seriesId = series[layerIndex]?.id ?? `series-${layerIndex}`;
        const color = series[layerIndex]?.color ?? `var(--chart-${(layerIndex % 4) + 1})`;
        const gradientId = createAreaGradientId(ids.root, seriesId);
        const pathFill = resolveAreaPathFill(fill, color, opacity, gradientId);
        const strokeStyle = resolveAreaStrokeStyle(outline, color, strokeWidth, strokeDasharray);
        const path = area<(typeof layer)[number]>()
          .x((point) => scales.xScale(readX(point.datum, point.index) as never) ?? 0)
          .y0((point) => scales.yScale(point.y0 as never) ?? 0)
          .y1((point) => scales.yScale(point.y1 as never) ?? 0)
          .curve(resolveCurve(curve))(layer);
        const keys = uniquifyKeys(
          layer.map((point) => pointKey(seriesId, readX(point.datum, point.index), point.index)),
        );
        const markerPoints = layer.flatMap((point, pointIndex) => {
          const raw = series[layerIndex]?.value;
          const readValue = raw ? normalizeAccessor(raw) : () => 0;
          const value = readValue(point.datum, point.index);
          if (typeof value !== "number" || !Number.isFinite(value)) {
            return [];
          }

          const x = scales.xScale(readX(point.datum, point.index) as never);
          const y = scales.yScale(point.y1 as never);
          if (typeof x !== "number" || typeof y !== "number") {
            return [];
          }

          return [
            {
              key:
                keys[pointIndex] ??
                pointKey(seriesId, readX(point.datum, point.index), point.index),
              index: point.index,
              x,
              y,
            },
          ];
        });

        return (
          <g key={seriesId} data-kamod-chart-series-id={seriesId}>
            <path
              d={path ?? ""}
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
                activeIndex={activeSeriesId === seriesId ? activeIndex : null}
              />
            ) : null}
          </g>
        );
      })}
    </g>
  );
};
