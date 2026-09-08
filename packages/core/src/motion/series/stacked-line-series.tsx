import { useMemo } from "preact/hooks";
import { pointKey, uniquifyKeys, type ChartAnimate } from "../../animation";
import { normalizeAccessor, useChartContext } from "../../core";
import { useCartesianScales } from "../../series/cartesian";
import { buildLinePath, type LineCurve } from "../../series/paths";
import { getStackedValues } from "../../series/stack";
import { stackedLayerToCartesianPoints } from "../../series/stacked-line-points";
import { StackedLineSeries, type StackedLineSeriesProps } from "../../series/stacked-line-series";
import { shouldShowAreaPoints } from "../../series/area-style";
import { lerp, lerpOptional } from "../interpolate";
import { usePathReveal } from "../path-reveal";
import { useKeyedTransition } from "../presence";
import { easingFn } from "../easing";
import { useMotionSuppressed, useResolvedAnimate } from "../resolve";

export interface MotionStackedLineSeriesProps<TDatum> extends StackedLineSeriesProps<TDatum> {
  animate?: ChartAnimate;
}

interface MotionStackLinePoint<TDatum> {
  key: string;
  datum: TDatum;
  index: number;
  x: number | null;
  y: number | null;
  defined: boolean;
  r: number;
  opacity: number;
}

export const MotionStackedLineSeries = <TDatum,>(props: MotionStackedLineSeriesProps<TDatum>) => {
  const resolved = useResolvedAnimate(props.animate);
  const suppressed = useMotionSuppressed(resolved);
  if (suppressed) {
    return <StackedLineSeries {...props} />;
  }

  return <AnimatedStackedLineSeries {...props} />;
};

const AnimatedStackedLineSeries = <TDatum,>({
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
  animate,
}: MotionStackedLineSeriesProps<TDatum>) => {
  const resolved = useResolvedAnimate(animate);
  const suppressed = useMotionSuppressed(resolved);
  const { data, xKey: contextXKey } = useChartContext<TDatum>();
  const resolvedXKey = xKey ?? contextXKey;
  const layers = getStackedValues(data, series);

  return (
    <g data-kamod-chart-stacked-line-series="" data-kamod-chart-motion="">
      {layers.map((layer, layerIndex) => {
        const entry = series[layerIndex];
        if (!entry) {
          return null;
        }

        return (
          <AnimatedStackedLineLayer
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

const AnimatedStackedLineLayer = <TDatum,>({
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
  duration,
  easing,
  enabled,
  reducedMotion,
}: {
  entry: StackedLineSeriesProps<TDatum>["series"][number];
  layerIndex: number;
  layer: ReturnType<typeof getStackedValues<TDatum>>[number];
  resolvedXKey: StackedLineSeriesProps<TDatum>["xKey"];
  xScale?: StackedLineSeriesProps<TDatum>["xScale"];
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
  duration: number;
  easing: import("../../animation").ChartMotionEasing;
  enabled: boolean;
  reducedMotion: boolean;
}) => {
  const { plotArea } = useChartContext<TDatum>();
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
  const motionPoints: MotionStackLinePoint<TDatum>[] = points.map((point, index) => ({
    key: keys[index] ?? pointKey(seriesId, readX(point.datum, point.index), point.index),
    datum: point.datum,
    index: point.index,
    x: point.x,
    y: point.y,
    defined: point.defined,
    r: activeSeriesId === seriesId && activeIndex === point.index ? activePointRadius : pointRadius,
    opacity: point.defined ? 1 : 0,
  }));
  const targetKey = `${plotArea.width}x${plotArea.height}::${motionPoints
    .map((point) => `${point.key}:${point.x}:${point.y}:${point.r}`)
    .join("|")}`;
  const displayed = useKeyedTransition(motionPoints, {
    enabled,
    reducedMotion,
    duration,
    ease: easingFn(easing),
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
  const pathPoints = displayed.map((point) => ({
    datum: point.datum,
    index: point.index,
    xValue: readX(point.datum, point.index),
    yValue: readValue(point.datum, point.index),
    x: point.x,
    y: point.y,
    defined: point.defined,
  }));
  const path = buildLinePath(pathPoints, curve, connectNulls);
  const pathRef = usePathReveal<SVGPathElement>({
    enabled,
    reducedMotion,
    duration,
    easing,
    path,
  });
  const renderPoints = shouldShowAreaPoints(showPoints, dataLength);

  return (
    <g data-kamod-chart-line-series="" data-kamod-chart-series-id={seriesId}>
      <path
        ref={pathRef}
        d={path}
        fill="none"
        stroke={color}
        stroke-width={strokeWidth}
        stroke-dasharray={strokeDasharray}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      {renderPoints
        ? displayed.map((point) => {
            const raw = readValue(point.datum, point.index);
            if (typeof raw !== "number" || !Number.isFinite(raw)) {
              return null;
            }

            if ((!point.defined && point.phase !== "exit") || point.x == null || point.y == null) {
              return null;
            }

            const isActive = activeSeriesId === seriesId && activeIndex === point.index;

            return (
              <circle
                key={point.key}
                cx={point.x}
                cy={point.y}
                r={point.r}
                fill={color}
                fill-opacity={point.opacity}
                stroke="var(--chart-tooltip-background)"
                stroke-width={isActive ? 2 : 1}
                stroke-opacity={point.opacity}
                data-kamod-chart-key={point.key}
                data-kamod-chart-phase={point.phase}
                data-kamod-chart-active={isActive ? "true" : undefined}
              />
            );
          })
        : null}
    </g>
  );
};
