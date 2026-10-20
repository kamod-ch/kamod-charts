import { useMemo } from "preact/hooks";
import { useChartContext, type DataAccessor } from "../core";
import type { DomainPadding, ScaleKind } from "../scales";
import { useAxisScale } from "./axis-scale";
import {
  formatTick,
  inferNumericTickFormatSpecifier,
  type TickFormatter,
  type TickValue,
} from "./tick-format";
import type { TickCollisionOptions } from "./tick-collision";
import { prepareAxisTicks } from "./tick-collision";
import { AxisTickText } from "./tick-label";
import { getScalePosition, getTicks } from "./ticks";

export interface YAxisProps<TDatum> extends TickCollisionOptions {
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
  tickCollision,
  maxTickLabelLength,
  maxTickLabelWidth,
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
  const resolvedFormatSpecifier = useMemo(() => {
    if (formatSpecifier || tickFormatter) {
      return formatSpecifier;
    }

    if (scale === "band" || scale === "point") {
      return formatSpecifier;
    }

    const scaleDomain = "domain" in axisScale ? axisScale.domain() : [];
    if (
      scaleDomain.length >= 2 &&
      typeof scaleDomain[0] === "number" &&
      typeof scaleDomain[1] === "number"
    ) {
      return inferNumericTickFormatSpecifier([scaleDomain[0], scaleDomain[1]]);
    }

    return formatSpecifier;
  }, [axisScale, formatSpecifier, scale, tickFormatter]);

  const formattedTicks = ticks.flatMap((tick, index) => {
    const position = getScalePosition(axisScale, tick);
    if (position == null) {
      return [];
    }
    const labelText = formatTick(tick as TickValue, index, {
      formatter: tickFormatter,
      formatSpecifier: resolvedFormatSpecifier,
    });
    return [{ position, labelText, index }];
  });
  const prepared = prepareAxisTicks(
    formattedTicks.map((entry) => ({ position: entry.position, labelText: entry.labelText })),
    {
      tickCollision,
      maxTickLabelLength,
      maxTickLabelWidth,
      orientation: "y",
    },
  );

  return (
    <g class={className} data-kamod-chart-y-axis="">
      <line y1={0} y2={plotArea.height} stroke="var(--chart-axis)" />
      {prepared.map((entry) => {
        if (!entry.visible) {
          return null;
        }

        return (
          <g
            key={`${entry.labelText}-${entry.index}`}
            transform={`translate(0 ${entry.position})`}
            data-kamod-chart-tick=""
          >
            <line x2={-6} stroke="var(--chart-axis)" />
            <AxisTickText
              x={-9}
              dy="0.32em"
              text-anchor="end"
              displayText={entry.displayText}
              fullText={entry.fullText}
            />
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
