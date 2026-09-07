import { useChartContext, type DataAccessor } from "../core";
import type { DomainPadding, ScaleKind } from "../scales";
import { useAxisScale } from "./axis-scale";
import { formatTick, type TickFormatter, type TickValue } from "./tick-format";
import { getScalePosition, getTicks } from "./ticks";

export interface YAxisProps<TDatum> {
  dataKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  scale?: ScaleKind;
  domain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
  padding?: number | DomainPadding;
  nice?: boolean | number;
  tickCount?: number;
  tickFormatter?: TickFormatter;
  formatSpecifier?: string;
  label?: string;
  class?: string;
}

export const YAxis = <TDatum,>({
  dataKey,
  scale = "linear",
  domain,
  padding,
  nice,
  tickCount = 5,
  tickFormatter,
  formatSpecifier,
  label,
  class: className,
}: YAxisProps<TDatum>) => {
  const { plotArea } = useChartContext<TDatum>();
  const axisScale = useAxisScale<TDatum>({
    dataKey,
    scale,
    domain,
    padding,
    nice,
    tickCount,
    orientation: "y",
  });
  const ticks = getTicks(axisScale, tickCount);

  return (
    <g class={className} data-kamod-chart-y-axis="">
      <line y1={0} y2={plotArea.height} stroke="var(--chart-axis)" />
      {ticks.map((tick, index) => {
        const position = getScalePosition(axisScale, tick);
        if (position == null) {
          return null;
        }

        const labelText = formatTick(tick as TickValue, index, {
          formatter: tickFormatter,
          formatSpecifier,
        });

        return (
          <g key={`${String(tick)}-${index}`} transform={`translate(0 ${position})`}>
            <line x2={-6} stroke="var(--chart-axis)" />
            <text x={-9} dy="0.32em" text-anchor="end">
              {labelText}
            </text>
          </g>
        );
      })}
      {label ? (
        <text
          x={-plotArea.height / 2}
          y={-34}
          text-anchor="middle"
          transform="rotate(-90)"
          data-kamod-chart-axis-label=""
        >
          {label}
        </text>
      ) : null}
    </g>
  );
};
