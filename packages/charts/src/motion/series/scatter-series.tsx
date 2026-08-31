import { useMemo } from "preact/hooks";
import { pointKey, uniquifyKeys, type ChartAnimate } from "../../animation";
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
  r: number;
  opacity: number;
  fill: string;
  active: boolean;
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
  size = 4,
  activeIndex = null,
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
  const motionPoints: MotionScatterPoint<TDatum>[] = points.flatMap((point, index) => {
    if (!point.defined || point.x == null || point.y == null) {
      return [];
    }

    const fill = typeof color === "function" ? color(point.datum, point.index) : color;
    const radius = typeof size === "function" ? size(point.datum, point.index) : size;
    return [
      {
        key: keys[index] ?? pointKey(seriesId, point.xValue, point.index),
        datum: point.datum,
        index: point.index,
        cx: point.x,
        cy: point.y,
        r: activeIndex === point.index ? radius + 2 : radius,
        opacity: 1,
        fill,
        active: activeIndex === point.index,
      },
    ];
  });
  const targetKey = `${plotArea.width}x${plotArea.height}::${motionPoints
    .map((point) => `${point.key}:${point.cx}:${point.cy}:${point.r}`)
    .join("|")}`;
  const displayed = useKeyedTransition(motionPoints, {
    enabled: resolved.enabled,
    reducedMotion: suppressed,
    duration: resolved.duration,
    ease: easingFn(resolved.easing),
    targetKey,
    enterOrigin: (point) => ({ ...point, r: 0, opacity: 0 }),
    exitTarget: (point) => ({ ...point, r: 0, opacity: 0 }),
    interpolate: (from, to, t) => ({
      ...to,
      cx: lerp(from.cx, to.cx, t),
      cy: lerp(from.cy, to.cy, t),
      r: lerp(from.r, to.r, t),
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
          r={point.r}
          fill={point.fill}
          fill-opacity={point.opacity}
          stroke="var(--chart-tooltip-background)"
          stroke-width={point.active ? 2 : 1}
          stroke-opacity={point.opacity}
          data-kamod-chart-key={point.key}
          data-kamod-chart-phase={point.phase}
          data-kamod-chart-active={point.active ? "true" : undefined}
        />
      ))}
    </g>
  );
};
