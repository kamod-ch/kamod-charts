import { area, curveLinear } from "d3-shape";
import { createLinearScale } from "../scales";
import { normalizeAccessor, useChartContext, type DataAccessor } from "../core";
import type { ScaleKind } from "../scales";
import { getStackedValues, type StackSeries } from "./stack";
import { useCartesianScales } from "./cartesian";

export interface StackedAreaSeriesProps<TDatum> {
  series: readonly (StackSeries<TDatum> & { color?: string })[];
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ScaleKind;
  yDomain: readonly [number, number];
  opacity?: number;
}

export const StackedAreaSeries = <TDatum,>({
  series,
  xKey,
  xScale,
  yDomain,
  opacity = 0.2,
}: StackedAreaSeriesProps<TDatum>) => {
  const { data, plotArea, xKey: contextXKey } = useChartContext<TDatum>();
  const resolvedXKey = xKey ?? contextXKey;
  const xScales = useCartesianScales({
    xKey: resolvedXKey,
    yKey: series[0]?.value ?? (() => 0),
    xScale,
    yDomain,
  });
  const readX = normalizeAccessor(resolvedXKey ?? ((_datum: TDatum, index: number) => index));
  const yScale = createLinearScale({ domain: yDomain, range: [plotArea.height, 0], nice: true });
  const layers = getStackedValues(data, series);

  return (
    <g data-kamod-chart-stacked-area-series="">
      {layers.map((layer, layerIndex) => {
        const path = area<(typeof layer)[number]>()
          .x((point) => xScales.xScale(readX(point.datum, point.index) as never) ?? 0)
          .y0((point) => yScale(point.y0))
          .y1((point) => yScale(point.y1))
          .curve(curveLinear)(layer);

        return (
          <path
            key={series[layerIndex]?.id ?? layerIndex}
            d={path ?? ""}
            fill={series[layerIndex]?.color ?? `var(--chart-${(layerIndex % 4) + 1})`}
            fill-opacity={opacity}
            stroke={series[layerIndex]?.color ?? `var(--chart-${(layerIndex % 4) + 1})`}
          />
        );
      })}
    </g>
  );
};
