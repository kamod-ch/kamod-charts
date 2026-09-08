import { useMemo } from "preact/hooks";
import { barKey, type ChartAnimate } from "../../animation";
import { resolveBarFill } from "../../charts/bar-fill";
import { resolveMaxBarCategorySize } from "../../charts/bar-geometry";
import { roundedRectPath } from "../../charts/bar-path";
import { normalizeAccessor, useChartContext } from "../../core";
import {
  createBandScale,
  createLinearScale,
  inferCategoricalDomain,
  inferNumericDomain,
} from "../../scales";
import { BarSeries, type BarSeriesProps } from "../../series/bar-series";
import { lerp } from "../interpolate";
import { useKeyedTransition } from "../presence";
import { easingFn } from "../easing";
import { useMotionSuppressed, useResolvedAnimate } from "../resolve";

export interface MotionBarSeriesProps<TDatum> extends BarSeriesProps<TDatum> {
  animate?: ChartAnimate;
}

interface MotionBar {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  baselineX: number;
  baselineY: number;
  radius: number;
  fill: string;
  datum: unknown;
  index: number;
  value: number;
}

const valueToCategory = (
  value: string | number | Date | null | undefined,
  index: number,
): string => {
  if (value == null) {
    return String(index);
  }

  return value instanceof Date ? value.toISOString() : String(value);
};

export const MotionBarSeries = <TDatum,>(props: MotionBarSeriesProps<TDatum>) => {
  const resolved = useResolvedAnimate(props.animate);
  const suppressed = useMotionSuppressed(resolved);
  if (suppressed) {
    return <BarSeries {...props} />;
  }

  return <AnimatedBarSeries {...props} />;
};

const AnimatedBarSeries = <TDatum,>({
  dataKey,
  xKey,
  yDomain,
  id,
  color = "var(--chart-1)",
  fill,
  radius = 0,
  minBarSize = 0,
  maxBarSize,
  horizontal = false,
  class: className,
  onBarClick,
  animate,
}: MotionBarSeriesProps<TDatum>) => {
  const resolved = useResolvedAnimate(animate);
  const suppressed = useMotionSuppressed(resolved);
  const { data, plotArea, xKey: contextXKey } = useChartContext<TDatum>();
  const resolvedXKey = xKey ?? contextXKey;
  const readX = normalizeAccessor(resolvedXKey ?? ((_datum: TDatum, index: number) => index));
  const readY = normalizeAccessor(dataKey);
  const domain = useMemo(
    () => inferCategoricalDomain(data, resolvedXKey ?? ((_datum, index) => index)),
    [data, resolvedXKey],
  );
  const valueDomain = yDomain ?? inferNumericDomain({ data, accessor: dataKey });
  const categoryScale = createBandScale({
    domain,
    range: horizontal ? [0, plotArea.height] : [0, plotArea.width],
    paddingInner: 0.2,
    paddingOuter: 0.1,
  });
  const valueScale = createLinearScale({
    domain: valueDomain,
    range: horizontal ? [0, plotArea.width] : [plotArea.height, 0],
  });
  const zero = valueScale(0);
  const seriesId = id ?? "series";
  const bars: MotionBar[] = [];

  data.forEach((datum, index) => {
    const raw = readY(datum, index);
    if (typeof raw !== "number" || !Number.isFinite(raw)) {
      return;
    }

    const category = valueToCategory(readX(datum, index), index);
    const categoryPosition = categoryScale(category);
    if (categoryPosition == null) {
      return;
    }

    const scaled = valueScale(raw);
    const bandwidth = categoryScale.bandwidth();
    const barCategorySize = resolveMaxBarCategorySize(bandwidth, maxBarSize);
    const categoryOffset = (bandwidth - barCategorySize) / 2;
    const x = horizontal ? Math.min(zero, scaled) : categoryPosition + categoryOffset;
    const y = horizontal ? categoryPosition + categoryOffset : Math.min(zero, scaled);
    const width = horizontal ? Math.max(Math.abs(scaled - zero), minBarSize) : barCategorySize;
    const height = horizontal ? barCategorySize : Math.max(Math.abs(scaled - zero), minBarSize);
    const barFill = resolveBarFill(
      { key: dataKey, id, color, fill },
      {
        datum,
        index,
        value: raw,
        valueStart: 0,
        valueEnd: raw,
        seriesId,
        seriesIndex: 0,
        orientation: horizontal ? "horizontal" : "vertical",
        stacked: false,
        active: false,
      },
    );
    bars.push({
      key: barKey(seriesId, category),
      x,
      y,
      width,
      height,
      baselineX: horizontal ? zero : x,
      baselineY: horizontal ? y : zero,
      radius,
      fill: barFill,
      datum,
      index,
      value: raw,
    });
  });

  const targetKey = `${plotArea.width}x${plotArea.height}::${bars
    .map((bar) => `${bar.key}:${bar.x}:${bar.y}:${bar.width}:${bar.height}`)
    .join("|")}`;
  const displayed = useKeyedTransition(bars, {
    enabled: resolved.enabled,
    reducedMotion: suppressed,
    duration: resolved.duration,
    ease: easingFn(resolved.easing),
    targetKey,
    enterOrigin: (bar) =>
      horizontal ? { ...bar, x: bar.baselineX, width: 0 } : { ...bar, y: bar.baselineY, height: 0 },
    exitTarget: (bar) =>
      horizontal ? { ...bar, x: bar.baselineX, width: 0 } : { ...bar, y: bar.baselineY, height: 0 },
    interpolate: (from, to, t) => ({
      ...to,
      x: lerp(from.x, to.x, t),
      y: lerp(from.y, to.y, t),
      width: lerp(from.width, to.width, t),
      height: lerp(from.height, to.height, t),
    }),
  });

  return (
    <g
      class={className}
      data-kamod-chart-bar-series=""
      data-kamod-chart-series-id={id}
      data-kamod-chart-motion=""
    >
      {displayed.map((bar) => (
        <path
          key={bar.key}
          d={roundedRectPath(bar.x, bar.y, bar.width, bar.height, bar.radius)}
          fill={bar.fill}
          data-kamod-chart-bar=""
          data-kamod-chart-key={bar.key}
          data-kamod-chart-phase={bar.phase}
          onClick={
            onBarClick ? () => onBarClick(bar.datum as TDatum, bar.index, bar.value) : undefined
          }
        />
      ))}
    </g>
  );
};
