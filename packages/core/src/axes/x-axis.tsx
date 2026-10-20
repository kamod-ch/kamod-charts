import { useChartContext, type DataAccessor } from "../core";
import type { DomainPadding, ScaleKind } from "../scales";
import { useAxisScale } from "./axis-scale";
import { formatTick, type TickFormatter, type TickValue } from "./tick-format";
import type { TickCollisionOptions } from "./tick-collision";
import { prepareAxisTicks } from "./tick-collision";
import { AxisTickText } from "./tick-label";
import { getScalePosition, getTicks } from "./ticks";

export interface XAxisProps<TDatum> extends TickCollisionOptions {
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
  tickCollision,
  maxTickLabelLength,
  maxTickLabelWidth,
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
  const formattedTicks = ticks.flatMap((tick, index) => {
    const position = getScalePosition(axisScale, tick);
    if (position == null) {
      return [];
    }
    const labelText = formatTick(tick as TickValue, index, {
      formatter: tickFormatter,
      formatSpecifier,
    });
    return [{ position, labelText, tick, index }];
  });
  const prepared = prepareAxisTicks(
    formattedTicks.map((entry) => ({ position: entry.position, labelText: entry.labelText })),
    {
      tickCollision,
      maxTickLabelLength,
      maxTickLabelWidth,
      tickRotation,
      orientation: "x",
    },
  );

  return (
    <g class={className} data-kamod-chart-x-axis="" transform={`translate(0 ${plotArea.height})`}>
      <line x1={0} x2="100%" y1={domainLineY} y2={domainLineY} stroke="var(--chart-axis)" />
      {prepared.map((entry) => {
        if (!entry.visible) {
          return null;
        }

        const textAnchor = entry.rotation === 0 ? "middle" : entry.rotation > 0 ? "start" : "end";

        return (
          <g
            key={`${entry.labelText}-${entry.index}`}
            transform={`translate(${entry.position} 0)`}
            data-kamod-chart-tick=""
          >
            <line y2={6} stroke="var(--chart-axis)" />
            <AxisTickText
              y={12}
              dy="0.71em"
              text-anchor={textAnchor}
              transform={entry.rotation ? `rotate(${entry.rotation})` : undefined}
              displayText={entry.displayText}
              fullText={entry.fullText}
            />
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
