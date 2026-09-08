import { barKey } from "../animation/keys";
import { useChartContext } from "../core";
import { resolveBarGeometryFill } from "./bar-fill";
import { resolveBarGeometry } from "./bar-geometry";
import { roundedRectPath } from "./bar-path";
import { resolveBarValueLabelPresentation } from "./bar-value-label";
import type { BarChartProps } from "./types";

export interface BarMarksProps<TDatum> {
  data: readonly TDatum[];
  xKey?: BarChartProps<TDatum>["xKey"];
  series: readonly BarChartProps<TDatum>["series"][number][];
  yDomain: readonly [number, number];
  stacked: boolean;
  grouped: boolean;
  horizontal: boolean;
  radius: number;
  minBarSize: number;
  maxBarSize?: number;
  valueLabels: BarChartProps<TDatum>["valueLabels"];
  activeIndex: number | null;
  activeSeriesIndex: number;
  onBarClick?: BarChartProps<TDatum>["onBarClick"];
  animate?: import("../animation").ChartAnimate;
}

export const BarMarks = <TDatum,>({
  data,
  xKey,
  series,
  yDomain,
  stacked,
  grouped,
  horizontal,
  radius,
  minBarSize,
  maxBarSize,
  valueLabels,
  activeIndex,
  activeSeriesIndex,
  onBarClick,
}: BarMarksProps<TDatum>) => {
  const { plotArea } = useChartContext<TDatum>();
  const bars = resolveBarGeometry({
    data,
    series,
    xKey,
    yDomain,
    stacked,
    grouped,
    horizontal,
    minBarSize,
    maxBarSize,
    plotWidth: plotArea.width,
    plotHeight: plotArea.height,
  });

  return (
    <g data-kamod-chart-bars="">
      {bars.map((bar) => {
        if (!bar.defined) {
          return null;
        }

        const key = barKey(bar.seriesId, bar.category);
        const isActive = activeIndex === bar.index && activeSeriesIndex === bar.seriesIndex;
        const fill = resolveBarGeometryFill(bar, {
          orientation: horizontal ? "horizontal" : "vertical",
          stacked,
          active: isActive,
        });
        const label = resolveBarValueLabelPresentation(bar, bars, bar, {
          chartValueLabels: valueLabels,
          horizontal,
          stacked,
          active: isActive,
        });

        return (
          <g key={key} data-kamod-chart-key={key}>
            <path
              d={roundedRectPath(bar.x, bar.y, bar.width, bar.height, radius)}
              fill={fill}
              data-kamod-chart-bar=""
              data-kamod-chart-key={key}
              data-kamod-chart-series-id={bar.seriesId}
              data-kamod-chart-index={String(bar.index)}
              data-kamod-chart-active={isActive ? "true" : undefined}
              onClick={
                onBarClick && bar.value != null
                  ? () => onBarClick(bar.datum, bar.seriesId, bar.index, bar.value as number)
                  : undefined
              }
            />
            {label ? (
              <text
                x={label.layout.x}
                y={label.layout.y}
                text-anchor={label.layout.textAnchor}
                dominant-baseline={label.layout.dominantBaseline}
                fill={label.color}
                class={label.class}
                data-kamod-chart-value-label=""
              >
                {label.content}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
};
