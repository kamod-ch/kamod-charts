import { useMemo } from "preact/hooks";
import { pointKey, uniquifyKeys } from "../animation/keys";
import { normalizeAccessor, useChartContext, type DataAccessor } from "../core";
import type { ScaleKind } from "../scales";
import { shouldShowAreaPoints } from "./area-style";
import { useCartesianScales } from "./cartesian";
import { buildLinePath, type LineCurve } from "./paths";
import { getStackedValues, type StackSeries } from "./stack";
import { stackedLayerToCartesianPoints } from "./stacked-line-points";

export interface StackedLineSeriesEntry<TDatum> extends StackSeries<TDatum> {
  color?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  showPoints?: boolean | "auto";
  pointRadius?: number;
}

export interface StackedLineSeriesProps<TDatum> {
  series: readonly StackedLineSeriesEntry<TDatum>[];
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ScaleKind;
  yDomain: readonly [number, number];
  curve?: LineCurve;
  connectNulls?: boolean;
  strokeWidth?: number;
  strokeDasharray?: string;
  showPoints?: boolean | "auto";
  pointRadius?: number;
  activeIndex?: number | null;
  activeSeriesId?: string | null;
}

interface StackedLineLayerProps<TDatum> {
  entry: StackedLineSeriesEntry<TDatum>;
  layerIndex: number;
  layer: ReturnType<typeof getStackedValues<TDatum>>[number];
  resolvedXKey: DataAccessor<TDatum, string | number | Date | null | undefined> | undefined;
  xScale?: ScaleKind;
  yDomain: readonly [number, number];
  curve: LineCurve;
  connectNulls: boolean;
  chartStrokeWidth?: number;
  chartStrokeDasharray?: string;
  chartShowPoints: boolean | "auto";
  chartPointRadius?: number;
  activeIndex: number | null;
  activeSeriesId: string | null;
  dataLength: number;
}

const StackedLineLayer = <TDatum,>({
  entry,
  layerIndex,
  layer,
  resolvedXKey,
  xScale,
  yDomain,
  curve,
  connectNulls,
  chartStrokeWidth,
  chartStrokeDasharray,
  chartShowPoints,
  chartPointRadius,
  activeIndex,
  activeSeriesId,
  dataLength,
}: StackedLineLayerProps<TDatum>) => {
  const seriesId = entry.id ?? `series-${layerIndex}`;
  const color = entry.color ?? `var(--chart-${(layerIndex % 4) + 1})`;
  const strokeWidth = entry.strokeWidth ?? chartStrokeWidth ?? 2;
  const strokeDasharray = entry.strokeDasharray ?? chartStrokeDasharray;
  const showPoints = entry.showPoints ?? chartShowPoints;
  const pointRadius = entry.pointRadius ?? chartPointRadius ?? 2.5;
  const activePointRadius = pointRadius + 1.5;
  const scales = useCartesianScales({
    xKey: resolvedXKey,
    yKey: entry.value,
    xScale,
    yDomain,
  });
  const readX = normalizeAccessor(resolvedXKey ?? ((_datum: TDatum, index: number) => index));
  const readValue = normalizeAccessor(entry.value);
  const points = useMemo(
    () =>
      stackedLayerToCartesianPoints(
        layer,
        entry.value,
        scales.xScale,
        scales.yScale,
        resolvedXKey,
        connectNulls,
      ),
    [connectNulls, entry.value, layer, resolvedXKey, scales.xScale, scales.yScale],
  );
  const keys = uniquifyKeys(
    points.map((point) => pointKey(seriesId, readX(point.datum, point.index), point.index)),
  );
  const path = useMemo(
    () => buildLinePath(points, curve, connectNulls),
    [connectNulls, curve, points],
  );
  const renderPoints = shouldShowAreaPoints(showPoints, dataLength);

  return (
    <g data-kamod-chart-line-series="" data-kamod-chart-series-id={seriesId}>
      <path
        d={path}
        fill="none"
        stroke={color}
        stroke-width={strokeWidth}
        stroke-dasharray={strokeDasharray}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      {renderPoints
        ? points.map((point, pointIndex) => {
            const raw = readValue(point.datum, point.index);
            if (typeof raw !== "number" || !Number.isFinite(raw)) {
              return null;
            }

            if (!point.defined || point.x == null || point.y == null) {
              return null;
            }

            const isActive = activeSeriesId === seriesId && activeIndex === point.index;

            return (
              <circle
                key={keys[pointIndex]}
                cx={point.x}
                cy={point.y}
                r={isActive ? activePointRadius : pointRadius}
                fill={color}
                stroke="var(--chart-tooltip-background)"
                stroke-width={isActive ? 2 : 1}
                data-kamod-chart-key={keys[pointIndex]}
                data-kamod-chart-active={isActive ? "true" : undefined}
              />
            );
          })
        : null}
    </g>
  );
};

export const StackedLineSeries = <TDatum,>({
  series,
  xKey,
  xScale,
  yDomain,
  curve = "linear",
  connectNulls = false,
  strokeWidth: chartStrokeWidth,
  strokeDasharray: chartStrokeDasharray,
  showPoints: chartShowPoints = "auto",
  pointRadius: chartPointRadius,
  activeIndex = null,
  activeSeriesId = null,
}: StackedLineSeriesProps<TDatum>) => {
  const { data, xKey: contextXKey } = useChartContext<TDatum>();
  const resolvedXKey = xKey ?? contextXKey;
  const layers = getStackedValues(data, series);

  return (
    <g data-kamod-chart-stacked-line-series="">
      {layers.map((layer, layerIndex) => {
        const entry = series[layerIndex];
        if (!entry) {
          return null;
        }

        return (
          <StackedLineLayer
            key={entry.id ?? `series-${layerIndex}`}
            entry={entry}
            layerIndex={layerIndex}
            layer={layer}
            resolvedXKey={resolvedXKey}
            xScale={xScale}
            yDomain={yDomain}
            curve={curve}
            connectNulls={connectNulls}
            chartStrokeWidth={chartStrokeWidth}
            chartStrokeDasharray={chartStrokeDasharray}
            chartShowPoints={chartShowPoints}
            chartPointRadius={chartPointRadius}
            activeIndex={activeIndex}
            activeSeriesId={activeSeriesId}
            dataLength={data.length}
          />
        );
      })}
    </g>
  );
};
