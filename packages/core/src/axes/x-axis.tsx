import { useChartContext, type DataAccessor } from "../core";
import type { DomainPadding, ScaleKind } from "../scales";
import { useAxisScale } from "./axis-scale";
import { formatTick, type TickFormatter, type TickValue } from "./tick-format";
import { getScalePosition, getTicks } from "./ticks";

export interface XAxisProps<TDatum> {
  dataKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  scale?: ScaleKind;
  domain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
  padding?: number | DomainPadding;
  nice?: boolean | number;
  tickCount?: number;
  tickFormatter?: TickFormatter;
  formatSpecifier?: string;
  label?: string;
  tickRotation?: number;
  class?: string;
}

export const XAxis = <TDatum,>({
  dataKey,
  scale,
  domain,
  padding,
  nice,
  tickCount = 5,
  tickFormatter,
  formatSpecifier,
  label,
  tickRotation = 0,
  class: className,
}: XAxisProps<TDatum>) => {
  const { plotArea } = useChartContext<TDatum>();
  const axisScale = useAxisScale<TDatum>({
    dataKey,
    scale,
    domain,
    padding,
    nice,
    tickCount,
    orientation: "x",
  });
  const ticks = getTicks(axisScale, tickCount);
  const domainLineY = 0;

  return (
    <g class={className} data-kamod-chart-x-axis="" transform={`translate(0 ${plotArea.height})`}>
      <line x1={0} x2="100%" y1={domainLineY} y2={domainLineY} stroke="var(--chart-axis)" />
      {ticks.map((tick, index) => {
        const position = getScalePosition(axisScale, tick);
        if (position == null) {
          return null;
        }

        const labelText = formatTick(tick as TickValue, index, {
          formatter: tickFormatter,
          formatSpecifier,
        });
        const textAnchor = tickRotation === 0 ? "middle" : tickRotation > 0 ? "start" : "end";

        return (
          <g key={`${String(tick)}-${index}`} transform={`translate(${position} 0)`}>
            <line y2={6} stroke="var(--chart-axis)" />
            <text
              y={12}
              dy="0.71em"
              text-anchor={textAnchor}
              transform={tickRotation ? `rotate(${tickRotation})` : undefined}
            >
              {labelText}
            </text>
          </g>
        );
      })}
      {label ? (
        <text x="50%" y={36} text-anchor="middle" data-kamod-chart-axis-label="">
          {label}
        </text>
      ) : null}
    </g>
  );
};
