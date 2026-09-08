import { useChartContext, type DataAccessor } from "../core";
import type { DomainPadding, ScaleKind } from "../scales";
import { useAxisScale } from "../axes/axis-scale";
import {
  projectReferenceSegment,
  resolveReferenceSegmentLabel,
  type ReferenceSegmentLabelPosition,
} from "./reference-segment-geometry";

export type { ReferenceSegmentLabelPosition };

export interface ReferenceSegmentEndpoint {
  x: string | number | Date;
  y: string | number | Date;
}

export interface ReferenceSegmentProps<TDatum> {
  start: ReferenceSegmentEndpoint;
  end: ReferenceSegmentEndpoint;
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  yKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ScaleKind;
  yScale?: ScaleKind;
  xDomain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
  yDomain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
  xPadding?: number | DomainPadding;
  yPadding?: number | DomainPadding;
  id?: string;
  label?: string;
  labelPosition?: ReferenceSegmentLabelPosition;
  color?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  class?: string;
}

export const ReferenceSegment = <TDatum,>({
  start,
  end,
  xKey,
  yKey,
  xScale,
  yScale = "linear",
  xDomain,
  yDomain,
  xPadding,
  yPadding,
  id,
  label,
  labelPosition = "middle",
  color = "var(--chart-reference-line)",
  strokeWidth,
  strokeDasharray = "4 4",
  class: className,
}: ReferenceSegmentProps<TDatum>) => {
  const { plotArea } = useChartContext<TDatum>();
  const xAxisScale = useAxisScale<TDatum>({
    dataKey: xKey,
    scale: xScale,
    domain: xDomain,
    padding: xPadding,
    orientation: "x",
  });
  const yAxisScale = useAxisScale<TDatum>({
    dataKey: yKey,
    scale: yScale,
    domain: yDomain,
    padding: yPadding,
    orientation: "y",
  });
  const projected = projectReferenceSegment(
    xAxisScale,
    yAxisScale,
    start.x,
    start.y,
    end.x,
    end.y,
    plotArea.width,
    plotArea.height,
  );

  if (!projected) {
    return null;
  }

  const labelLayout = label ? resolveReferenceSegmentLabel(projected, labelPosition) : null;

  return (
    <g
      id={id}
      class={className}
      data-kamod-chart-reference-segment=""
      aria-hidden="true"
      pointerEvents="none"
    >
      <line
        x1={projected.x1}
        y1={projected.y1}
        x2={projected.x2}
        y2={projected.y2}
        stroke={color}
        stroke-width={strokeWidth}
        stroke-dasharray={strokeDasharray}
      />
      {label && labelLayout ? (
        <text
          x={labelLayout.x}
          y={labelLayout.y}
          text-anchor={labelLayout.textAnchor}
          dominant-baseline={labelLayout.dominantBaseline}
          fill="currentColor"
          fill-opacity={0.72}
          font-size="11"
          pointerEvents="none"
        >
          {label}
        </text>
      ) : null}
    </g>
  );
};
