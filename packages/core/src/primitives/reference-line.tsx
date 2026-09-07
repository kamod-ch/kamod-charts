import { useChartContext, type DataAccessor } from "../core";
import type { DomainPadding, ScaleKind } from "../scales";
import { useAxisScale } from "../axes/axis-scale";
import { getScalePosition } from "../axes";

export interface ReferenceLineProps<TDatum> {
  x?: string | number | Date;
  y?: string | number | Date;
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  yKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ScaleKind;
  yScale?: ScaleKind;
  xDomain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
  yDomain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
  xPadding?: number | DomainPadding;
  yPadding?: number | DomainPadding;
  label?: string;
  color?: string;
  class?: string;
}

export const ReferenceLine = <TDatum,>({
  x,
  y,
  xKey,
  yKey,
  xScale,
  yScale = "linear",
  xDomain,
  yDomain,
  xPadding,
  yPadding,
  label,
  color = "var(--chart-reference-line)",
  class: className,
}: ReferenceLineProps<TDatum>) => {
  const { plotArea } = useChartContext<TDatum>();
  const axisScale = useAxisScale<TDatum>({
    dataKey: x == null ? yKey : xKey,
    scale: x == null ? yScale : xScale,
    domain: x == null ? yDomain : xDomain,
    padding: x == null ? yPadding : xPadding,
    orientation: x == null ? "y" : "x",
  });
  const value = x ?? y;
  const position = value == null ? undefined : getScalePosition(axisScale, value);

  if (position == null) {
    return null;
  }

  const isVertical = x != null;

  return (
    <g class={className} data-kamod-chart-reference-line="">
      <line
        x1={isVertical ? position : 0}
        x2={isVertical ? position : plotArea.width}
        y1={isVertical ? 0 : position}
        y2={isVertical ? plotArea.height : position}
        stroke={color}
        stroke-dasharray="4 4"
      />
      {label ? (
        <text
          x={isVertical ? position + 6 : plotArea.width}
          y={isVertical ? 12 : position - 6}
          text-anchor={isVertical ? "start" : "end"}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
};
