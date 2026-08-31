import { useMemo } from "preact/hooks";
import { pointKey, uniquifyKeys, type ChartAnimate } from "../../animation";
import { useChartContext } from "../../core";
import {
  getCartesianPoints,
  useCartesianScales,
  type CartesianPoint,
} from "../../series/cartesian";
import { LineSeries, type LineSeriesProps } from "../../series/line-series";
import { buildLinePath } from "../../series/paths";
import { lerp, lerpOptional } from "../interpolate";
import { usePathReveal } from "../path-reveal";
import { useKeyedTransition } from "../presence";
import { easingFn } from "../easing";
import { useMotionSuppressed, useResolvedAnimate } from "../resolve";

export interface MotionLineSeriesProps<TDatum> extends LineSeriesProps<TDatum> {
  animate?: ChartAnimate;
}

interface MotionPoint<TDatum> extends CartesianPoint<TDatum> {
  key: string;
  r: number;
  opacity: number;
}

export const MotionLineSeries = <TDatum,>(props: MotionLineSeriesProps<TDatum>) => {
  const resolved = useResolvedAnimate(props.animate);
  const suppressed = useMotionSuppressed(resolved);
  if (suppressed) {
    return <LineSeries {...props} />;
  }

  return <AnimatedLineSeries {...props} />;
};

const AnimatedLineSeries = <TDatum,>({
  dataKey,
  xKey,
  xScale,
  xDomain,
  yDomain,
  id,
  color = "var(--chart-1)",
  strokeWidth = 2,
  curve = "linear",
  connectNulls = false,
  showPoints = "auto",
  activeIndex = null,
  class: className,
  animate,
}: MotionLineSeriesProps<TDatum>) => {
  const resolved = useResolvedAnimate(animate);
  const suppressed = useMotionSuppressed(resolved);
  const { data, plotArea, xKey: contextXKey } = useChartContext<TDatum>();
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
  const motionPoints = points.map((point, index) => ({
    ...point,
    key: keys[index] ?? pointKey(seriesId, point.xValue, point.index),
    r: activeIndex === point.index ? 4 : 2.5,
    opacity: point.defined ? 1 : 0,
  }));
  const targetKey = `${plotArea.width}x${plotArea.height}::${motionPoints
    .map((point) => `${point.key}:${point.x}:${point.y}:${point.r}`)
    .join("|")}`;
  const displayed = useKeyedTransition<MotionPoint<TDatum>>(motionPoints, {
    enabled: resolved.enabled,
    reducedMotion: suppressed,
    duration: resolved.duration,
    ease: easingFn(resolved.easing),
    targetKey,
    skipEnter: true,
    enterOrigin: (item) => ({ ...item, r: 0, opacity: 0 }),
    exitTarget: (item) => ({ ...item, r: 0, opacity: 0 }),
    interpolate: (from, to, t) => ({
      ...to,
      x: lerpOptional(from.x, to.x, t),
      y: lerpOptional(from.y, to.y, t),
      r: lerp(from.r, to.r, t),
      opacity: lerp(from.opacity, to.opacity, t),
    }),
  });
  const path = buildLinePath(displayed, curve, connectNulls);
  const pathRef = usePathReveal<SVGPathElement>({
    enabled: resolved.enabled,
    reducedMotion: suppressed,
    duration: resolved.duration,
    easing: resolved.easing,
    path,
  });
  const shouldShowPoints = showPoints === true || (showPoints === "auto" && points.length <= 500);

  return (
    <g
      class={className}
      data-kamod-chart-line-series=""
      data-kamod-chart-series-id={id}
      data-kamod-chart-motion=""
    >
      <path
        ref={pathRef}
        d={path}
        fill="none"
        stroke={color}
        stroke-width={strokeWidth}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      {shouldShowPoints
        ? displayed.map((point) =>
            point.defined || point.phase === "exit" ? (
              <circle
                key={point.key}
                cx={point.x ?? 0}
                cy={point.y ?? 0}
                r={point.r}
                fill={color}
                fill-opacity={point.opacity}
                stroke="var(--chart-tooltip-background)"
                stroke-width={activeIndex === point.index ? 2 : 1}
                stroke-opacity={point.opacity}
                data-kamod-chart-key={point.key}
                data-kamod-chart-phase={point.phase}
                data-kamod-chart-active={activeIndex === point.index ? "true" : undefined}
              />
            ) : null,
          )
        : null}
    </g>
  );
};
