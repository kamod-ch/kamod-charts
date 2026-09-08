import type { DataAccessor } from "../core";
import { buildPieSlices, type PieSlice, type PieSortComparator } from "./pie-geometry";
import type { PieLabelOptions, PieLabels } from "./pie-label";
import { resolvePieLabelOptions } from "./pie-label";
import {
  resolvePieLayout,
  type CircularVariant,
  type PieLayoutRadiusProps,
  type ResolvedPieLayout,
} from "./pie-layout";
import type { PieRose } from "./pie-rose";

export interface PieSeriesLayoutInput<TDatum> extends PieLayoutRadiusProps {
  plotArea: { width: number; height: number };
  labels?: PieLabels<TDatum>;
  /** @deprecated Use `labels` instead. */
  labelPosition?: "none" | "inside" | "outside";
  variant?: CircularVariant;
  innerRadiusRatio?: number;
}

export interface ResolvedPieSeriesLayout<TDatum> {
  layout: ResolvedPieLayout;
  labelOptions: PieLabelOptions<TDatum>;
}

export const resolvePieSeriesLayout = <TDatum>({
  plotArea,
  labels,
  labelPosition,
  innerRadius,
  innerRadiusRatio,
  outerRadius,
  activeOffset,
  variant = "full",
}: PieSeriesLayoutInput<TDatum>): ResolvedPieSeriesLayout<TDatum> => {
  const labelOptions = resolvePieLabelOptions(labels ?? labelPosition ?? "inside");
  const pixelInnerRadius = innerRadiusRatio !== undefined ? undefined : (innerRadius ?? 0);

  return {
    labelOptions,
    layout: resolvePieLayout({
      plotArea,
      variant,
      innerRadius: pixelInnerRadius,
      innerRadiusRatio,
      outerRadius,
      labelOptions,
      activeOffset,
    }),
  };
};

export interface BuildPieSlicesForLayoutOptions<TDatum> {
  data: readonly TDatum[];
  valueKey: DataAccessor<TDatum, number | null | undefined>;
  labelKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  layout: ResolvedPieLayout;
  padAngle: number;
  cornerRadius: number;
  sort?: boolean | PieSortComparator<TDatum>;
  colors?: readonly string[];
  hiddenKeys?: readonly string[];
  activeIndex?: number | null;
  activeOffset?: number;
  rose?: PieRose;
}

export const buildPieSlicesForLayout = <TDatum>({
  layout,
  ...options
}: BuildPieSlicesForLayoutOptions<TDatum>): {
  slices: PieSlice<TDatum>[];
  total: number;
} =>
  buildPieSlices({
    ...options,
    innerRadius: layout.innerRadius,
    outerRadius: layout.outerRadius,
    startAngle: layout.startAngle,
    endAngle: layout.endAngle,
  });

export const pieSeriesTransform = (layout: ResolvedPieLayout): string =>
  `translate(${layout.centerX} ${layout.centerY})`;

export const pieCenterContentTransform = (layout: ResolvedPieLayout): string | undefined =>
  layout.centerContentOffsetY === 0 ? undefined : `translate(0 ${layout.centerContentOffsetY})`;
