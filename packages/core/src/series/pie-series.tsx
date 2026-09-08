import type { ComponentChildren, JSX } from "preact";
import { useMemo } from "preact/hooks";
import { useChartContext, type DataAccessor } from "../core";
import {
  buildPieSlices,
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
import { layoutPieLabels, resolvePieLabelOptions, resolvePieOuterRadius } from "./pie-label";
import type { PieLabels } from "./pie-label";

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
}

export const createPieSlicePointerHandler =
  <TDatum,>(
    slice: PieSlice<TDatum>,
    activeIndex: number | null,
    plotArea: { x: number; y: number; width: number; height: number },
    handler?: (event: PieSlicePointerEvent<TDatum>) => void,
  ) =>
  (nativeEvent: JSX.TargetedPointerEvent<SVGPathElement>) => {
    if (!handler) {
      return;
    }

    const anchor = pieSliceSurfacePoint(slice, plotArea);

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
  const labelOptions = resolvePieLabelOptions(labels ?? labelPosition ?? "inside");
  const radius = resolvePieOuterRadius(plotArea, outerRadius, labelOptions);
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
  const roseEnabled = resolvePieRoseOptions(rose) != null;
  const labelLayouts = useMemo(
    () =>
      layoutPieLabels({
        slices,
        labelOptions,
        plotArea,
        activeIndex,
      }),
    [activeIndex, labelOptions, plotArea, slices],
  );

  if (total <= 0) {
    return (
      <g
        class={className}
        data-kamod-chart-pie-series=""
        data-kamod-chart-pie-empty=""
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
      {...(roseEnabled ? { "data-kamod-chart-pie-rose": "" } : {})}
      transform={`translate(${centerX} ${centerY})`}
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
                onSlicePointerEnter,
              )}
              onPointerMove={createPieSlicePointerHandler(
                slice,
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
