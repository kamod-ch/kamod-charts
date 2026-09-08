import { useMemo } from "preact/hooks";
import { pointKey, uniquifyKeys, type ChartAnimate } from "../../animation";
import {
  ACTIVE_SCATTER_STROKE_WIDTH,
  buildScatterSeriesLayout,
  DEFAULT_SCATTER_STROKE_WIDTH,
  renderedScatterRadius,
} from "../../charts/scatter-series-layout";
import { useChartContext } from "../../core";
import { getCartesianPoints, useCartesianScales } from "../../series/cartesian";
import { ScatterSeries, type ScatterSeriesProps } from "../../series/scatter-series";
import { easingFn } from "../easing";
import { lerp } from "../interpolate";
import { useKeyedTransition } from "../presence";
import { useMotionSuppressed, useResolvedAnimate } from "../resolve";

export interface MotionScatterSeriesProps<TDatum> extends ScatterSeriesProps<TDatum> {
  animate?: ChartAnimate;
}

interface MotionScatterPoint<TDatum> {
  key: string;
  datum: TDatum;
  index: number;
  cx: number;
  cy: number;
  baseRadius: number;
  opacity: number;
  fill: string;
  active: boolean;
  categoryId: string | null;
}

export const MotionScatterSeries = <TDatum,>(props: MotionScatterSeriesProps<TDatum>) => {
  const resolved = useResolvedAnimate(props.animate);
  const suppressed = useMotionSuppressed(resolved);
  if (suppressed) {
    return <ScatterSeries {...props} />;
  }

  return <AnimatedScatterSeries {...props} />;
};

const AnimatedScatterSeries = <TDatum,>({
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
  class: className,
  animate,
}: MotionScatterSeriesProps<TDatum>) => {
  const resolved = useResolvedAnimate(animate);
  const suppressed = useMotionSuppressed(resolved);
  const { data, plotArea, xKey: contextXKey } = useChartContext<TDatum>();
  const resolvedXKey = xKey ?? contextXKey;
  const seriesId = id ?? "series";
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
  const motionPoints: MotionScatterPoint<TDatum>[] = layouts
    .filter((point) => point.visible)
    .map((point) => ({
      key: point.key,
      datum: point.datum,
      index: point.index,
      cx: point.cx,
      cy: point.cy,
      baseRadius: point.baseRadius,
      opacity: point.opacity,
      fill: point.fill,
      active: point.active,
      categoryId: point.categoryId,
    }));
  const targetKey = `${plotArea.width}x${plotArea.height}::${motionPoints
    .map((point) => `${point.key}:${point.cx}:${point.cy}:${point.baseRadius}`)
    .join("|")}`;
  const displayed = useKeyedTransition(motionPoints, {
    enabled: resolved.enabled,
    reducedMotion: suppressed,
    duration: resolved.duration,
    ease: easingFn(resolved.easing),
    targetKey,
    enterOrigin: (point) => ({ ...point, baseRadius: 0, opacity: 0 }),
    exitTarget: (point) => ({ ...point, baseRadius: 0, opacity: 0 }),
    interpolate: (from, to, t) => ({
      ...to,
      cx: lerp(from.cx, to.cx, t),
      cy: lerp(from.cy, to.cy, t),
      baseRadius: lerp(from.baseRadius, to.baseRadius, t),
      opacity: lerp(from.opacity, to.opacity, t),
    }),
  });

  return (
    <g
      class={className}
      data-kamod-chart-scatter-series=""
      data-kamod-chart-series-id={id}
      data-kamod-chart-motion=""
    >
      {displayed.map((point) => (
        <circle
          key={point.key}
          cx={point.cx}
          cy={point.cy}
          r={renderedScatterRadius(point.baseRadius, point.active)}
          fill={point.fill}
          fill-opacity={point.opacity}
          stroke="var(--chart-tooltip-background)"
          stroke-width={point.active ? ACTIVE_SCATTER_STROKE_WIDTH : DEFAULT_SCATTER_STROKE_WIDTH}
          stroke-opacity={point.opacity}
          data-kamod-chart-key={point.key}
          data-kamod-chart-base-radius={point.baseRadius}
          data-kamod-chart-category-id={point.categoryId ?? undefined}
          data-kamod-chart-phase={point.phase}
          data-kamod-chart-active={point.active ? "true" : undefined}
        />
      ))}
    </g>
  );
};
