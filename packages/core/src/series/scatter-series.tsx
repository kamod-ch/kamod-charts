import { useMemo } from "preact/hooks";
import { pointKey, uniquifyKeys } from "../animation/keys";
import type { ScatterCategoryContext } from "../charts/scatter-model";
import type { ScatterSizeScale } from "../charts/types";
import {
  ACTIVE_SCATTER_STROKE_WIDTH,
  buildScatterSeriesLayout,
  DEFAULT_SCATTER_STROKE_WIDTH,
} from "../charts/scatter-series-layout";
import { normalizeAccessor, useChartContext, type DataAccessor } from "../core";
import type { ScaleKind } from "../scales";
import { getCartesianPoints, useCartesianScales } from "./cartesian";
import type { RenderPoint } from "./mark-slots";
import { renderPointSlot } from "./mark-slots";

export interface ScatterSeriesProps<TDatum> {
  yKey: DataAccessor<TDatum, number | null | undefined>;
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ScaleKind;
  xDomain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
  yDomain?: readonly [number, number];
  id?: string;
  color?: string | ((datum: TDatum, index: number) => string);
  /** Marker radius in pixels for low-level composable usage. */
  radius?: number | ((datum: TDatum, index: number) => number);
  /** @deprecated Prefer {@link ScatterSeriesProps.radius}. */
  size?: number | ((datum: TDatum, index: number) => number);
  pointOpacity?: number | ((datum: TDatum, index: number) => number);
  sizeKey?: DataAccessor<TDatum, number | null | undefined>;
  sizeScale?: ScatterSizeScale;
  sizeDomain?: readonly [number, number];
  pointRadiusRange?: readonly [number, number];
  pointRadius?: number | ((datum: TDatum, index: number) => number);
  pointSize?: number | ((datum: TDatum, index: number) => number);
  seriesPointRadius?: number | ((datum: TDatum, index: number) => number);
  sortByRadius?: boolean;
  activeIndex?: number | null;
  /** @internal */
  categoryContext?: ScatterCategoryContext<TDatum> | null;
  seriesLabel?: string;
  renderPoint?: RenderPoint<TDatum>;
  class?: string;
}

export const ScatterSeries = <TDatum,>({
  yKey,
  xKey,
  xScale,
  xDomain,
  yDomain,
  id,
  color = "var(--chart-1)",
  radius,
  size = 4,
  pointOpacity,
  sizeKey,
  sizeScale,
  sizeDomain,
  pointRadiusRange,
  pointRadius,
  pointSize,
  seriesPointRadius,
  sortByRadius,
  activeIndex = null,
  categoryContext = null,
  seriesLabel,
  renderPoint,
  class: className,
}: ScatterSeriesProps<TDatum>) => {
  const { data, xKey: contextXKey } = useChartContext<TDatum>();
  const resolvedXKey = xKey ?? contextXKey;
  const readY = useMemo(() => normalizeAccessor(yKey), [yKey]);
  const scales = useCartesianScales({
    xKey: resolvedXKey,
    yKey,
    xScale,
    xDomain,
    yDomain,
  });
  const points = useMemo(
    () => getCartesianPoints(data, scales.xScale, scales.yScale, resolvedXKey, yKey),
    [data, resolvedXKey, scales.xScale, scales.yScale, yKey],
  );
  const seriesId = id ?? "series";
  const keys = uniquifyKeys(
    points.map((point) =>
      pointKey(
        seriesId,
        point.xValue,
        point.index,
        typeof point.yValue === "number" ? point.yValue : null,
      ),
    ),
  );
  const layouts = useMemo(
    () =>
      buildScatterSeriesLayout({
        points,
        seriesId,
        keys,
        color,
        activeIndex,
        pointOpacity,
        data,
        sizeKey,
        sizeScale,
        sizeDomain,
        pointRadiusRange,
        pointRadius,
        pointSize,
        seriesPointRadius,
        radius,
        size,
        categoryContext,
        sortByRadius,
      }),
    [
      points,
      seriesId,
      keys,
      color,
      activeIndex,
      pointOpacity,
      data,
      sizeKey,
      sizeScale,
      sizeDomain,
      pointRadiusRange,
      pointRadius,
      pointSize,
      seriesPointRadius,
      radius,
      size,
      categoryContext,
      sortByRadius,
    ],
  );

  return (
    <g class={className} data-kamod-chart-scatter-series="" data-kamod-chart-series-id={id}>
      {layouts
        .filter((point) => point.visible)
        .map((point) => {
          const slotContext = {
            datum: point.datum,
            index: point.index,
            seriesId,
            seriesLabel,
            value: readY(point.datum, point.index) ?? null,
            x: point.cx,
            y: point.cy,
            color: point.fill,
            opacity: point.opacity,
            active: point.active,
            hidden: false,
            key: point.key,
            pointRadius: point.renderedRadius,
          };

          if (renderPoint) {
            return (
              <g
                key={point.key}
                data-kamod-chart-scatter-point=""
                data-kamod-chart-base-radius={point.baseRadius}
                data-kamod-chart-category-id={point.categoryId ?? undefined}
              >
                {renderPointSlot(slotContext, renderPoint)}
              </g>
            );
          }

          return (
            <circle
              key={point.key}
              cx={point.cx}
              cy={point.cy}
              r={point.renderedRadius}
              fill={point.fill}
              fill-opacity={point.opacity}
              stroke="var(--chart-tooltip-background)"
              stroke-width={
                point.active ? ACTIVE_SCATTER_STROKE_WIDTH : DEFAULT_SCATTER_STROKE_WIDTH
              }
              stroke-opacity={point.opacity}
              data-kamod-chart-key={point.key}
              data-kamod-chart-base-radius={point.baseRadius}
              data-kamod-chart-category-id={point.categoryId ?? undefined}
              data-kamod-chart-active={point.active ? "true" : undefined}
            />
          );
        })}
    </g>
  );
};
