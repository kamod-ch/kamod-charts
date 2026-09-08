import { area } from "d3-shape";
import { pointKey, uniquifyKeys, type ChartAnimate } from "../../animation";
import { normalizeAccessor, useChartContext } from "../../core";
import { useCartesianScales } from "../../series/cartesian";
import { getStackedValues } from "../../series/stack";
import { resolveCurve, type LineCurve } from "../../series/paths";
import type { AreaFill } from "../../series/area-fill";
import { isAreaGradientFill } from "../../series/area-fill";
import {
  AreaGradientDef,
  AreaPointMarkers,
  createAreaGradientId,
  resolveAreaPathFill,
  resolveAreaStrokeStyle,
  shouldShowAreaPoints,
} from "../../series/area-style";
import { StackedAreaSeries, type StackedAreaSeriesProps } from "../../series/stacked-area-series";
import { lerp } from "../interpolate";
import { usePathReveal } from "../path-reveal";
import { useKeyedTransition } from "../presence";
import { easingFn } from "../easing";
import { useMotionSuppressed, useResolvedAnimate } from "../resolve";

export interface MotionStackedAreaSeriesProps<TDatum> extends StackedAreaSeriesProps<TDatum> {
  animate?: ChartAnimate;
}

interface MotionStackPoint<TDatum> {
  key: string;
  datum: TDatum;
  index: number;
  x: number;
  y0: number;
  y1: number;
}

export const MotionStackedAreaSeries = <TDatum,>(props: MotionStackedAreaSeriesProps<TDatum>) => {
  const resolved = useResolvedAnimate(props.animate);
  const suppressed = useMotionSuppressed(resolved);
  if (suppressed) {
    return <StackedAreaSeries {...props} />;
  }

  return <AnimatedStackedAreaSeries {...props} />;
};

const AnimatedStackedAreaSeries = <TDatum,>({
  series,
  xKey,
  xScale,
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
  animate,
}: MotionStackedAreaSeriesProps<TDatum>) => {
  const resolved = useResolvedAnimate(animate);
  const suppressed = useMotionSuppressed(resolved);
  const { data, plotArea, xKey: contextXKey, ids } = useChartContext<TDatum>();
  const resolvedXKey = xKey ?? contextXKey;
  const scales = useCartesianScales({
    xKey: resolvedXKey,
    yKey: series[0]?.value ?? (() => 0),
    xScale,
    yDomain,
  });
  const readX = normalizeAccessor(resolvedXKey ?? ((_datum: TDatum, index: number) => index));
  const layers = getStackedValues(data, series);
  const renderPoints = shouldShowAreaPoints(showPoints, data.length);

  return (
    <g data-kamod-chart-stacked-area-series="" data-kamod-chart-motion="">
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
        const keys = uniquifyKeys(
          layer.map((point) => pointKey(seriesId, readX(point.datum, point.index), point.index)),
        );
        const motionPoints: MotionStackPoint<TDatum>[] = layer.map((point, index) => ({
          key: keys[index] ?? pointKey(seriesId, readX(point.datum, point.index), point.index),
          datum: point.datum,
          index: point.index,
          x: scales.xScale(readX(point.datum, point.index) as never) ?? 0,
          y0: scales.yScale(point.y0 as never) ?? 0,
          y1: scales.yScale(point.y1 as never) ?? 0,
        }));
        const readValue = normalizeAccessor(series[layerIndex]?.value ?? (() => 0));
        const markerPoints = layer.flatMap((point, pointIndex) => {
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
          <AnimatedStackLayer
            key={seriesId}
            seriesId={seriesId}
            color={series[layerIndex]?.color ?? `var(--chart-${(layerIndex % 4) + 1})`}
            opacity={opacity}
            fill={fill}
            gradientId={createAreaGradientId(ids.root, seriesId)}
            curve={curve}
            outline={outline}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            points={motionPoints}
            markerPoints={renderPoints ? markerPoints : []}
            pointRadius={pointRadius}
            activeIndex={activeSeriesId === seriesId ? activeIndex : null}
            layoutKey={`${plotArea.width}x${plotArea.height}`}
            duration={resolved.duration}
            easing={resolved.easing}
            enabled={resolved.enabled}
            reducedMotion={suppressed}
          />
        );
      })}
    </g>
  );
};

const AnimatedStackLayer = <TDatum,>({
  seriesId,
  color,
  opacity,
  fill,
  gradientId,
  curve,
  outline,
  strokeWidth,
  strokeDasharray,
  points,
  markerPoints,
  pointRadius,
  activeIndex,
  layoutKey,
  duration,
  easing,
  enabled,
  reducedMotion,
}: {
  seriesId: string;
  color: string;
  opacity: number;
  fill: AreaFill;
  gradientId: string;
  curve: LineCurve;
  outline: boolean;
  strokeWidth?: number;
  strokeDasharray?: string;
  points: MotionStackPoint<TDatum>[];
  markerPoints: readonly { key: string; index: number; x: number; y: number }[];
  pointRadius: number;
  activeIndex: number | null;
  layoutKey: string;
  duration: number;
  easing: import("../../animation").ChartMotionEasing;
  enabled: boolean;
  reducedMotion: boolean;
}) => {
  const targetKey = `${layoutKey}::${points.map((point) => `${point.key}:${point.x}:${point.y0}:${point.y1}`).join("|")}`;
  const displayed = useKeyedTransition(points, {
    enabled,
    reducedMotion,
    duration,
    ease: easingFn(easing),
    targetKey,
    skipEnter: true,
    interpolate: (from, to, t) => ({
      ...to,
      x: lerp(from.x, to.x, t),
      y0: lerp(from.y0, to.y0, t),
      y1: lerp(from.y1, to.y1, t),
    }),
  });
  const path =
    area<MotionStackPoint<TDatum>>()
      .x((point) => point.x)
      .y0((point) => point.y0)
      .y1((point) => point.y1)
      .curve(resolveCurve(curve))(displayed) ?? "";
  const pathRef = usePathReveal<SVGPathElement>({
    enabled,
    reducedMotion,
    duration,
    easing,
    path,
  });

  const pathFill = resolveAreaPathFill(fill, color, opacity, gradientId);
  const strokeStyle = resolveAreaStrokeStyle(outline, color, strokeWidth, strokeDasharray);

  return (
    <g data-kamod-chart-series-id={seriesId}>
      <path
        ref={pathRef}
        d={path}
        fill={pathFill.fill}
        fill-opacity={pathFill.fillOpacity}
        stroke={strokeStyle.stroke}
        stroke-width={strokeStyle.strokeWidth}
        stroke-dasharray={strokeStyle.strokeDasharray}
      />
      {markerPoints.length > 0 ? (
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
