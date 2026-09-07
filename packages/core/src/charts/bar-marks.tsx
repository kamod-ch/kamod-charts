import { barKey } from "../animation/keys";
import { useChartContext } from "../core";
import { resolveBarGeometry } from "./bar-geometry";
import { roundedRectPath } from "./bar-path";
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
  valueLabels: boolean;
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
        const labelX = horizontal ? bar.x + bar.width + 4 : bar.x + bar.width / 2;
        const labelY = horizontal ? bar.y + bar.height / 2 : bar.y - 4;

        return (
          <g key={key} data-kamod-chart-key={key}>
            <path
              d={roundedRectPath(bar.x, bar.y, bar.width, bar.height, radius)}
              fill={bar.series.color ?? `var(--chart-${(bar.seriesIndex % 4) + 1})`}
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
            {valueLabels ? (
              <text
                x={labelX}
                y={labelY}
                text-anchor={horizontal ? "start" : "middle"}
                dominant-baseline="middle"
              >
                {bar.value}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
};
