import { useMemo } from "preact/hooks";
import type { ChartAnimate } from "../../animation";
import { useChartContext } from "../../core";
import {
  buildPieSlices,
  pieLabelPoint,
  pieSlicePath,
  type PieSlice,
} from "../../series/pie-geometry";
import { PieSeries, type PieSeriesProps } from "../../series/pie-series";
import { lerp } from "../interpolate";
import { useKeyedTransition } from "../presence";
import { easingFn } from "../easing";
import { useMotionSuppressed, useResolvedAnimate } from "../resolve";

export interface MotionPieSeriesProps<TDatum> extends PieSeriesProps<TDatum> {
  animate?: ChartAnimate;
}

export const MotionPieSeries = <TDatum,>(props: MotionPieSeriesProps<TDatum>) => {
  const resolved = useResolvedAnimate(props.animate);
  const suppressed = useMotionSuppressed(resolved);
  if (suppressed) {
    return <PieSeries {...props} />;
  }

  return <AnimatedPieSeries {...props} />;
};

const AnimatedPieSeries = <TDatum,>({
  valueKey,
  labelKey,
  innerRadius = 0,
  outerRadius,
  padAngle = 0,
  cornerRadius = 0,
  sort = false,
  activeIndex = null,
  activeOffset = 6,
  colors,
  labelPosition = "inside",
  centerContent,
  class: className,
  onSegmentClick,
  animate,
}: MotionPieSeriesProps<TDatum>) => {
  const resolved = useResolvedAnimate(animate);
  const suppressed = useMotionSuppressed(resolved);
  const { data, plotArea } = useChartContext<TDatum>();
  const radius = outerRadius ?? Math.max(0, Math.min(plotArea.width, plotArea.height) / 2);
  const centerX = plotArea.width / 2;
  const centerY = plotArea.height / 2;
  const { slices, total } = useMemo(
    () =>
      buildPieSlices({
        data,
        valueKey,
        labelKey,
        innerRadius,
        outerRadius: radius,
        padAngle,
        cornerRadius,
        sort,
        colors,
        activeIndex,
        activeOffset,
      }),
    [
      activeIndex,
      activeOffset,
      colors,
      cornerRadius,
      data,
      innerRadius,
      labelKey,
      padAngle,
      radius,
      sort,
      valueKey,
    ],
  );
  const targetKey = `${plotArea.width}x${plotArea.height}::${slices
    .map(
      (slice) =>
        `${slice.key}:${slice.startAngle}:${slice.endAngle}:${slice.innerRadius}:${slice.outerRadius}`,
    )
    .join("|")}`;
  const displayed = useKeyedTransition(slices, {
    enabled: resolved.enabled,
    reducedMotion: suppressed,
    duration: resolved.duration,
    ease: easingFn(resolved.easing),
    targetKey,
    enterOrigin: (slice) => {
      const mid = (slice.startAngle + slice.endAngle) / 2;
      return { ...slice, startAngle: mid, endAngle: mid, outerRadius: 0 };
    },
    exitTarget: (slice) => {
      const mid = (slice.startAngle + slice.endAngle) / 2;
      return { ...slice, startAngle: mid, endAngle: mid, outerRadius: 0 };
    },
    interpolate: (from, to, t) => ({
      ...to,
      startAngle: lerp(from.startAngle, to.startAngle, t),
      endAngle: lerp(from.endAngle, to.endAngle, t),
      innerRadius: lerp(from.innerRadius, to.innerRadius, t),
      outerRadius: lerp(from.outerRadius, to.outerRadius, t),
    }),
  });

  if (total <= 0) {
    return (
      <g
        class={className}
        data-kamod-chart-pie-series=""
        data-kamod-chart-motion=""
        transform={`translate(${centerX} ${centerY})`}
      >
        <text text-anchor="middle" dominant-baseline="middle">
          Keine positiven Werte
        </text>
        {centerContent}
      </g>
    );
  }

  return (
    <g
      class={className}
      data-kamod-chart-pie-series=""
      data-kamod-chart-motion=""
      transform={`translate(${centerX} ${centerY})`}
    >
      {displayed.map((slice) => {
        const isActive = activeIndex === slice.index;
        const [labelX, labelY] =
          labelPosition === "none"
            ? [0, 0]
            : pieLabelPoint(slice as PieSlice<TDatum>, labelPosition);

        return (
          <g
            key={slice.key}
            data-kamod-chart-pie-segment=""
            data-kamod-chart-key={slice.key}
            data-kamod-chart-phase={slice.phase}
          >
            <path
              d={pieSlicePath(slice as PieSlice<TDatum>)}
              fill={slice.color}
              stroke="var(--chart-tooltip-background)"
              stroke-width="1"
              data-kamod-chart-active={isActive ? "true" : undefined}
              data-kamod-chart-key={slice.key}
              onClick={
                onSegmentClick
                  ? () => onSegmentClick(slice.datum, slice.index, slice.value)
                  : undefined
              }
            />
            {labelPosition === "none" ? null : (
              <text x={labelX} y={labelY} text-anchor="middle" dominant-baseline="middle">
                {slice.label}
              </text>
            )}
          </g>
        );
      })}
      {centerContent}
    </g>
  );
};
