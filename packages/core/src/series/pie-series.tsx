import type { ComponentChildren, TargetedPointerEvent } from "preact";
import { useMemo } from "preact/hooks";
import type { ChartAnimate } from "../animation";
import { useChartContext, type DataAccessor } from "../core";
import {
  defaultPieColors,
  pieSlicePath,
  pieSliceSurfacePoint,
  toPieSliceContext,
  type PieSlice,
  type PieSliceContext,
  type PieSortComparator,
} from "./pie-geometry";
import { resolvePieRoseOptions, type PieRose } from "./pie-rose";
import { PieLabelLayer } from "./pie-label-layer";
import { layoutPieLabels, type PieLabels } from "./pie-label";
import {
  buildPieSlicesForLayout,
  pieCenterContentTransform,
  pieSeriesTransform,
  resolvePieSeriesLayout,
} from "./pie-series-layout";
import type { CircularVariant } from "./pie-layout";

export type { PieDatum, PieSliceContext, PieSortComparator } from "./pie-geometry";
export type { PieRose, PieRoseOptions } from "./pie-rose";
export type {
  PieLabelCollision,
  PieLabelLineOptions,
  PieLabelOptions,
  PieLabels,
} from "./pie-label";
export {
  computeOutsideLabelGutter,
  computeOutsideLabelGeometry,
  layoutPieLabels,
  resolvePieLabelOptions,
  resolvePieOuterRadius,
} from "./pie-label";
export { normalizePieData, normalizePieValue } from "./pie-geometry";

export interface PieSlicePointerEvent<TDatum> {
  context: PieSliceContext<TDatum>;
  surfaceX: number;
  surfaceY: number;
  nativeEvent: PointerEvent;
}

export interface PieSeriesProps<TDatum> {
  valueKey: DataAccessor<TDatum, number | null | undefined>;
  labelKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  innerRadius?: number;
  innerRadiusRatio?: number;
  variant?: CircularVariant;
  outerRadius?: number;
  padAngle?: number;
  cornerRadius?: number;
  sort?: boolean | PieSortComparator<TDatum>;
  hiddenKeys?: readonly string[];
  activeIndex?: number | null;
  activeOffset?: number;
  rose?: PieRose;
  colors?: readonly string[];
  labels?: PieLabels<TDatum>;
  /** @deprecated Use `labels` instead. */
  labelPosition?: "none" | "inside" | "outside";
  centerContent?: ComponentChildren;
  /** Shown when data exists but no slice has a finite value > 0. Omit for no fallback text. */
  emptyContent?: ComponentChildren;
  class?: string;
  onSegmentClick?: (datum: TDatum, index: number, value: number) => void;
  onSlicePointerEnter?: (event: PieSlicePointerEvent<TDatum>) => void;
  onSlicePointerMove?: (event: PieSlicePointerEvent<TDatum>) => void;
  onSlicePointerLeave?: () => void;
  animate?: ChartAnimate;
}

export const createPieSlicePointerHandler =
  <TDatum,>(
    slice: PieSlice<TDatum>,
    activeIndex: number | null,
    plotArea: { x: number; y: number; width: number; height: number },
    layout: ReturnType<typeof resolvePieSeriesLayout>["layout"],
    handler?: (event: PieSlicePointerEvent<TDatum>) => void,
  ) =>
  (nativeEvent: TargetedPointerEvent<SVGPathElement>) => {
    if (!handler) {
      return;
    }

    const anchor = pieSliceSurfacePoint(slice, plotArea, layout);

    handler({
      context: toPieSliceContext(slice, activeIndex === slice.index),
      surfaceX: anchor.x,
      surfaceY: anchor.y,
      nativeEvent: nativeEvent as unknown as PointerEvent,
    });
  };

export const PieSeries = <TDatum,>({
  valueKey,
  labelKey,
  innerRadius = 0,
  innerRadiusRatio,
  variant = "full",
  outerRadius,
  padAngle = 0,
  cornerRadius = 0,
  sort = false,
  hiddenKeys = [],
  activeIndex = null,
  activeOffset = 6,
  rose,
  colors = defaultPieColors,
  labels,
  labelPosition,
  centerContent,
  emptyContent,
  class: className,
  onSegmentClick,
  onSlicePointerEnter,
  onSlicePointerMove,
  onSlicePointerLeave,
}: PieSeriesProps<TDatum>) => {
  const { data, plotArea } = useChartContext<TDatum>();
  const { layout, labelOptions } = useMemo(
    () =>
      resolvePieSeriesLayout({
        plotArea,
        labels,
        labelPosition,
        innerRadius,
        innerRadiusRatio,
        variant,
        outerRadius,
        activeOffset,
      }),
    [
      activeOffset,
      innerRadius,
      innerRadiusRatio,
      labelPosition,
      labels,
      outerRadius,
      plotArea,
      variant,
    ],
  );
  const pointerEnabled = Boolean(onSlicePointerEnter || onSlicePointerMove || onSlicePointerLeave);
  const { slices, total } = useMemo(
    () =>
      buildPieSlicesForLayout({
        data,
        valueKey,
        labelKey,
        layout,
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
      labelKey,
      layout,
      padAngle,
      rose,
      sort,
      valueKey,
    ],
  );
  const roseEnabled = resolvePieRoseOptions(rose) != null;
  const isDonut = innerRadiusRatio !== undefined;
  const labelLayouts = useMemo(
    () =>
      layoutPieLabels({
        slices,
        labelOptions,
        plotArea,
        layout,
        activeIndex,
      }),
    [activeIndex, labelOptions, layout, plotArea, slices],
  );
  const centerTransform = pieCenterContentTransform(layout);

  if (total <= 0) {
    return (
      <g
        class={className}
        data-kamod-chart-pie-series=""
        data-kamod-chart-pie-empty=""
        {...(isDonut ? { "data-kamod-chart-donut": "" } : {})}
        {...(variant === "half" ? { "data-kamod-chart-circular-variant": "half" } : {})}
        transform={pieSeriesTransform(layout)}
      >
        {emptyContent}
        {centerContent ? <g transform={centerTransform}>{centerContent}</g> : null}
      </g>
    );
  }

  return (
    <g
      class={className}
      data-kamod-chart-pie-series=""
      {...(roseEnabled ? { "data-kamod-chart-pie-rose": "" } : {})}
      {...(isDonut ? { "data-kamod-chart-donut": "" } : {})}
      {...(variant === "half" ? { "data-kamod-chart-circular-variant": "half" } : {})}
      transform={pieSeriesTransform(layout)}
    >
      {slices.map((slice) => {
        const isActive = activeIndex === slice.index;

        return (
          <g key={slice.key} data-kamod-chart-pie-segment="" data-kamod-chart-key={slice.key}>
            <path
              d={pieSlicePath(slice)}
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
                slice,
                activeIndex,
                plotArea,
                layout,
                onSlicePointerEnter,
              )}
              onPointerMove={createPieSlicePointerHandler(
                slice,
                activeIndex,
                plotArea,
                layout,
                onSlicePointerMove,
              )}
              onPointerLeave={onSlicePointerLeave}
            />
          </g>
        );
      })}
      <PieLabelLayer layouts={labelLayouts} />
      {centerContent ? <g transform={centerTransform}>{centerContent}</g> : null}
    </g>
  );
};
