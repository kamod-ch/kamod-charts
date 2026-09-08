import { useMemo } from "preact/hooks";
import type { ChartAnimate } from "../../animation";
import { useChartContext } from "../../core";
import {
  buildPieSlices,
  pieSlicePath,
  resolvePieRoseOptions,
  type PieSlice,
} from "../../series/pie-geometry";
import {
  createPieSlicePointerHandler,
  PieSeries,
  type PieSeriesProps,
} from "../../series/pie-series";
import {
  layoutPieLabels,
  resolvePieLabelOptions,
  resolvePieOuterRadius,
} from "../../series/pie-label";
import { PieLabelLayer } from "../../series/pie-label-layer";
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
  hiddenKeys = [],
  activeIndex = null,
  activeOffset = 6,
  rose,
  colors,
  labels,
  labelPosition,
  centerContent,
  emptyContent,
  class: className,
  onSegmentClick,
  onSlicePointerEnter,
  onSlicePointerMove,
  onSlicePointerLeave,
  animate,
}: MotionPieSeriesProps<TDatum>) => {
  const resolved = useResolvedAnimate(animate);
  const suppressed = useMotionSuppressed(resolved);
  const { data, plotArea } = useChartContext<TDatum>();
  const labelOptions = resolvePieLabelOptions(labels ?? labelPosition ?? "inside");
  const radius = resolvePieOuterRadius(plotArea, outerRadius, labelOptions);
  const roseEnabled = resolvePieRoseOptions(rose) != null;
  const centerX = plotArea.width / 2;
  const centerY = plotArea.height / 2;
  const pointerEnabled = Boolean(onSlicePointerEnter || onSlicePointerMove || onSlicePointerLeave);
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
        hiddenKeys,
        activeIndex,
        activeOffset,
        rose,
      }),
    [
      activeIndex,
      activeOffset,
      colors,
      cornerRadius,
      data,
      hiddenKeys,
      innerRadius,
      labelKey,
      padAngle,
      radius,
      rose,
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
      return {
        ...slice,
        startAngle: mid,
        endAngle: mid,
        outerRadius: roseEnabled ? slice.innerRadius : 0,
      };
    },
    exitTarget: (slice) => {
      const mid = (slice.startAngle + slice.endAngle) / 2;
      return {
        ...slice,
        startAngle: mid,
        endAngle: mid,
        outerRadius: roseEnabled ? slice.innerRadius : 0,
      };
    },
    interpolate: (from, to, t) => ({
      ...to,
      startAngle: lerp(from.startAngle, to.startAngle, t),
      endAngle: lerp(from.endAngle, to.endAngle, t),
      innerRadius: lerp(from.innerRadius, to.innerRadius, t),
      outerRadius: lerp(from.outerRadius, to.outerRadius, t),
    }),
  });
  const animatedSlices = useMemo(
    () => displayed.filter((slice) => slice.phase !== "exit") as PieSlice<TDatum>[],
    [displayed],
  );
  const labelLayouts = useMemo(
    () =>
      layoutPieLabels({
        slices: animatedSlices,
        labelOptions,
        plotArea,
        activeIndex,
      }),
    [activeIndex, animatedSlices, labelOptions, plotArea],
  );

  if (total <= 0) {
    return (
      <g
        class={className}
        data-kamod-chart-pie-series=""
        data-kamod-chart-pie-empty=""
        data-kamod-chart-motion=""
        transform={`translate(${centerX} ${centerY})`}
      >
        {emptyContent}
        {centerContent}
      </g>
    );
  }

  return (
    <g
      class={className}
      data-kamod-chart-pie-series=""
      data-kamod-chart-motion=""
      {...(roseEnabled ? { "data-kamod-chart-pie-rose": "" } : {})}
      transform={`translate(${centerX} ${centerY})`}
    >
      {displayed.map((slice) => {
        const isActive = activeIndex === slice.index;
        const geometry = slice as PieSlice<TDatum>;

        return (
          <g
            key={slice.key}
            data-kamod-chart-pie-segment=""
            data-kamod-chart-key={slice.key}
            data-kamod-chart-phase={slice.phase}
          >
            <path
              d={pieSlicePath(geometry)}
              fill={slice.color}
              stroke="var(--chart-tooltip-background)"
              stroke-width="1"
              data-kamod-chart-active={isActive ? "true" : undefined}
              data-kamod-chart-key={slice.key}
              style={pointerEnabled ? { cursor: "pointer" } : undefined}
              onClick={
                onSegmentClick
                  ? () => onSegmentClick(slice.datum, slice.index, slice.value)
                  : undefined
              }
              onPointerEnter={createPieSlicePointerHandler(
                geometry,
                activeIndex,
                plotArea,
                onSlicePointerEnter,
              )}
              onPointerMove={createPieSlicePointerHandler(
                geometry,
                activeIndex,
                plotArea,
                onSlicePointerMove,
              )}
              onPointerLeave={onSlicePointerLeave}
            />
          </g>
        );
      })}
      <PieLabelLayer layouts={labelLayouts} />
      {centerContent}
    </g>
  );
};
