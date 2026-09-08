import { useMemo } from "preact/hooks";
import { pointKey, uniquifyKeys, type ChartAnimate } from "../../animation";
import { useChartContext } from "../../core";
import { AreaSeries, type AreaSeriesProps } from "../../series/area-series";
import { isAreaGradientFill } from "../../series/area-fill";
import {
  AreaGradientDef,
  AreaPointMarkers,
  createAreaGradientId,
  resolveAreaPathFill,
  resolveAreaStrokeStyle,
  shouldShowAreaPoints,
} from "../../series/area-style";
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
  fill = "solid",
  curve = "linear",
  outline = false,
  strokeWidth,
  strokeDasharray,
  showPoints = false,
  pointRadius = 2.5,
  activeIndex = null,
  class: className,
  animate,
}: MotionAreaSeriesProps<TDatum>) => {
  const resolved = useResolvedAnimate(animate);
  const suppressed = useMotionSuppressed(resolved);
  const { data, plotArea, xKey: contextXKey, ids } = useChartContext<TDatum>();
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
  const pathFill = resolveAreaPathFill(fill, color, opacity, gradientId);
  const strokeStyle = resolveAreaStrokeStyle(outline, color, strokeWidth, strokeDasharray);
  const markerPoints = displayed.flatMap((point) => {
    if (!point.defined || point.x == null || point.y == null) {
      return [];
    }

    return [{ key: point.key, index: point.index, x: point.x, y: point.y }];
  });
  const renderPoints = shouldShowAreaPoints(showPoints, points.length);

  return (
    <g
      class={className}
      data-kamod-chart-area-series=""
      data-kamod-chart-series-id={id}
      data-kamod-chart-motion=""
    >
      {isAreaGradientFill(fill) ? (
        <defs>
          <AreaGradientDef id={gradientId} color={color} fill={fill} opacity={opacity} />
        </defs>
      ) : null}
      <path
        ref={pathRef}
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
