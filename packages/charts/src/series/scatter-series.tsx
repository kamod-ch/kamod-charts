import { useMemo } from "preact/hooks";
import { useChartContext, type DataAccessor } from "../core";
import type { ScaleKind } from "../scales";
import { getCartesianPoints, useCartesianScales } from "./cartesian";

export interface ScatterSeriesProps<TDatum> {
  yKey: DataAccessor<TDatum, number | null | undefined>;
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ScaleKind;
  xDomain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
  yDomain?: readonly [number, number];
  id?: string;
  color?: string | ((datum: TDatum, index: number) => string);
  size?: number | ((datum: TDatum, index: number) => number);
  activeIndex?: number | null;
  class?: string;
}

export const ScatterSeries = <TDatum,>({
  yKey,
  xKey,
  xScale,
  xDomain,
  yDomain,
  id,
  color = "var(--chart-1)",
  size = 4,
  activeIndex = null,
  class: className,
}: ScatterSeriesProps<TDatum>) => {
  const { data, xKey: contextXKey } = useChartContext<TDatum>();
  const resolvedXKey = xKey ?? contextXKey;
  const scales = useCartesianScales({
    xKey: resolvedXKey,
    yKey,
    xScale,
    xDomain,
    yDomain,
    nice: true,
  });
  const points = useMemo(
    () => getCartesianPoints(data, scales.xScale, scales.yScale, resolvedXKey, yKey),
    [data, resolvedXKey, scales.xScale, scales.yScale, yKey],
  );

  return (
    <g class={className} data-kamod-chart-scatter-series="" data-kamod-chart-series-id={id}>
      {points.map((point) => {
        if (!point.defined) {
          return null;
        }

        const fill = typeof color === "function" ? color(point.datum, point.index) : color;
        const radius = typeof size === "function" ? size(point.datum, point.index) : size;

        return (
          <circle
            key={point.index}
            cx={point.x ?? 0}
            cy={point.y ?? 0}
            r={activeIndex === point.index ? radius + 2 : radius}
            fill={fill}
            stroke="var(--chart-tooltip-background)"
            stroke-width={activeIndex === point.index ? 2 : 1}
            data-kamod-chart-active={activeIndex === point.index ? "true" : undefined}
          />
        );
      })}
    </g>
  );
};
