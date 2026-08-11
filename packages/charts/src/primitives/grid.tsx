import { useChartContext, type DataAccessor } from "../core";
import type { DomainPadding, ScaleKind } from "../scales";
import { useAxisScale } from "../axes/axis-scale";
import { getScalePosition, getTicks } from "../axes/ticks";

export interface GridProps<TDatum> {
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  yKey?: DataAccessor<TDatum, number | Date | null | undefined>;
  xScale?: ScaleKind;
  yScale?: "linear" | "time";
  xDomain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
  yDomain?: readonly [number, number] | readonly [Date, Date];
  xPadding?: number | DomainPadding;
  yPadding?: number | DomainPadding;
  xTickCount?: number;
  yTickCount?: number;
  vertical?: boolean;
  horizontal?: boolean;
  class?: string;
}

export const Grid = <TDatum,>({
  xKey,
  yKey,
  xScale = "linear",
  yScale = "linear",
  xDomain,
  yDomain,
  xPadding,
  yPadding,
  xTickCount = 5,
  yTickCount = 5,
  vertical = true,
  horizontal = true,
  class: className,
}: GridProps<TDatum>) => {
  const { plotArea } = useChartContext<TDatum>();
  const xAxisScale = useAxisScale<TDatum>({
    dataKey: xKey,
    scale: xScale,
    domain: xDomain,
    padding: xPadding,
    tickCount: xTickCount,
    orientation: "x",
  });
  const yAxisScale = useAxisScale<TDatum>({
    dataKey: yKey,
    scale: yScale,
    domain: yDomain,
    padding: yPadding,
    tickCount: yTickCount,
    orientation: "y",
  });

  return (
    <g class={className} data-kamod-chart-grid="" aria-hidden="true">
      {vertical
        ? getTicks(xAxisScale, xTickCount).map((tick, index) => {
            const position = getScalePosition(xAxisScale, tick);
            return position == null ? null : (
              <line
                key={`x-${String(tick)}-${index}`}
                x1={position}
                x2={position}
                y1={0}
                y2={plotArea.height}
                stroke="var(--chart-grid)"
              />
            );
          })
        : null}
      {horizontal
        ? getTicks(yAxisScale, yTickCount).map((tick, index) => {
            const position = getScalePosition(yAxisScale, tick);
            return position == null ? null : (
              <line
                key={`y-${String(tick)}-${index}`}
                x1={0}
                x2={plotArea.width}
                y1={position}
                y2={position}
                stroke="var(--chart-grid)"
              />
            );
          })
        : null}
    </g>
  );
};
