import { area, curveLinear } from "d3-shape";
import { pointKey, uniquifyKeys, type ChartAnimate } from "../../animation";
import { normalizeAccessor, useChartContext } from "../../core";
import { useCartesianScales } from "../../series/cartesian";
import { getStackedValues } from "../../series/stack";
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
  animate,
}: MotionStackedAreaSeriesProps<TDatum>) => {
  const resolved = useResolvedAnimate(animate);
  const suppressed = useMotionSuppressed(resolved);
  const { data, plotArea, xKey: contextXKey } = useChartContext<TDatum>();
  const resolvedXKey = xKey ?? contextXKey;
  const scales = useCartesianScales({
    xKey: resolvedXKey,
    yKey: series[0]?.value ?? (() => 0),
    xScale,
    yDomain,
  });
  const readX = normalizeAccessor(resolvedXKey ?? ((_datum: TDatum, index: number) => index));
  const layers = getStackedValues(data, series);

  return (
    <g data-kamod-chart-stacked-area-series="" data-kamod-chart-motion="">
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
        return (
          <AnimatedStackLayer
            key={seriesId}
            seriesId={seriesId}
            color={series[layerIndex]?.color ?? `var(--chart-${(layerIndex % 4) + 1})`}
            opacity={opacity}
            points={motionPoints}
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
  points,
  layoutKey,
  duration,
  easing,
  enabled,
  reducedMotion,
}: {
  seriesId: string;
  color: string;
  opacity: number;
  points: MotionStackPoint<TDatum>[];
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
      .curve(curveLinear)(displayed) ?? "";
  const pathRef = usePathReveal<SVGPathElement>({
    enabled,
    reducedMotion,
    duration,
    easing,
    path,
  });

  return (
    <path
      ref={pathRef}
      data-kamod-chart-series-id={seriesId}
      d={path}
      fill={color}
      fill-opacity={opacity}
      stroke={color}
    />
  );
};
