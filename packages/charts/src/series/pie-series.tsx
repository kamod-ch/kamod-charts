import type { ComponentChildren } from "preact";
import { useMemo } from "preact/hooks";
import { useChartContext, type DataAccessor } from "../core";
import {
  buildPieSlices,
  defaultPieColors,
  pieLabelPoint,
  pieSlicePath,
  type PieDatum,
} from "./pie-geometry";

export type { PieDatum };

export interface PieSeriesProps<TDatum> {
  valueKey: DataAccessor<TDatum, number | null | undefined>;
  labelKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  innerRadius?: number;
  outerRadius?: number;
  padAngle?: number;
  cornerRadius?: number;
  sort?: boolean | ((a: PieDatum<TDatum>, b: PieDatum<TDatum>) => number);
  activeIndex?: number | null;
  activeOffset?: number;
  colors?: readonly string[];
  labelPosition?: "none" | "inside" | "outside";
  centerContent?: ComponentChildren;
  class?: string;
  onSegmentClick?: (datum: TDatum, index: number, value: number) => void;
}

export const PieSeries = <TDatum,>({
  valueKey,
  labelKey,
  innerRadius = 0,
  outerRadius,
  padAngle = 0,
  cornerRadius = 0,
  sort = false,
  activeIndex = null,
  activeOffset = 6,
  colors = defaultPieColors,
  labelPosition = "inside",
  centerContent,
  class: className,
  onSegmentClick,
}: PieSeriesProps<TDatum>) => {
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

  if (total <= 0) {
    return (
      <g
        class={className}
        data-kamod-chart-pie-series=""
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
      transform={`translate(${centerX} ${centerY})`}
    >
      {slices.map((slice) => {
        const isActive = activeIndex === slice.index;
        const [labelX, labelY] =
          labelPosition === "none" ? [0, 0] : pieLabelPoint(slice, labelPosition);

        return (
          <g key={slice.key} data-kamod-chart-pie-segment="" data-kamod-chart-key={slice.key}>
            <path
              d={pieSlicePath(slice)}
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
