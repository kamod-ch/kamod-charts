import { useMemo } from "preact/hooks";
import { pointKey, uniquifyKeys, type ChartAnimate } from "../../animation";
import { useChartContext } from "../../core";
import { AreaSeries, type AreaSeriesProps } from "../../series/area-series";
import {
  getCartesianPoints,
  useCartesianScales,
  type CartesianPoint,
} from "../../series/cartesian";
import { buildAreaPath } from "../../series/paths";
import { lerpOptional } from "../interpolate";
import { usePathReveal } from "../path-reveal";
import { useKeyedTransition } from "../presence";
import { easingFn } from "../easing";
import { useMotionSuppressed, useResolvedAnimate } from "../resolve";

export interface MotionAreaSeriesProps<TDatum> extends AreaSeriesProps<TDatum> {
  animate?: ChartAnimate;
}

interface MotionAreaPoint<TDatum> extends CartesianPoint<TDatum> {
  key: string;
}

export const MotionAreaSeries = <TDatum,>(props: MotionAreaSeriesProps<TDatum>) => {
  const resolved = useResolvedAnimate(props.animate);
  const suppressed = useMotionSuppressed(resolved);
  if (suppressed) {
    return <AreaSeries {...props} />;
  }

  return <AnimatedAreaSeries {...props} />;
};

const AnimatedAreaSeries = <TDatum,>({
  dataKey,
  xKey,
  xScale,
  xDomain,
  yDomain,
  baseline = 0,
  id,
  color = "var(--chart-1)",
  opacity = 0.2,
  curve = "linear",
  outline = false,
  class: className,
  animate,
}: MotionAreaSeriesProps<TDatum>) => {
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
  const baselineY = scales.yScale(baseline as never) ?? 0;
  const points = useMemo(
    () => getCartesianPoints(data, scales.xScale, scales.yScale, resolvedXKey, dataKey),
    [data, dataKey, resolvedXKey, scales.xScale, scales.yScale],
  );
  const keys = uniquifyKeys(points.map((point) => pointKey(seriesId, point.xValue, point.index)));
  const motionPoints = points.map((point, index) => ({
    ...point,
    key: keys[index] ?? pointKey(seriesId, point.xValue, point.index),
  }));
  const targetKey = `${plotArea.width}x${plotArea.height}:${baselineY}::${motionPoints
    .map((point) => `${point.key}:${point.x}:${point.y}`)
    .join("|")}`;
  const displayed = useKeyedTransition<MotionAreaPoint<TDatum>>(motionPoints, {
    enabled: resolved.enabled,
    reducedMotion: suppressed,
    duration: resolved.duration,
    ease: easingFn(resolved.easing),
    targetKey,
    skipEnter: true,
    interpolate: (from, to, t) => ({
      ...to,
      x: lerpOptional(from.x, to.x, t),
      y: lerpOptional(from.y, to.y, t),
    }),
  });
  const path = buildAreaPath(displayed, curve, baselineY);
  const pathRef = usePathReveal<SVGPathElement>({
    enabled: resolved.enabled,
    reducedMotion: suppressed,
    duration: resolved.duration,
    easing: resolved.easing,
    path,
  });

  return (
    <g
      class={className}
      data-kamod-chart-area-series=""
      data-kamod-chart-series-id={id}
      data-kamod-chart-motion=""
    >
      <path
        ref={pathRef}
        d={path}
        fill={color}
        fill-opacity={opacity}
        stroke={outline ? color : "none"}
      />
    </g>
  );
};
