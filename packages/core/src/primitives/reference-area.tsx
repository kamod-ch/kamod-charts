import { useChartContext, type DataAccessor } from "../core";
import type { DomainPadding, ScaleKind } from "../scales";
import { useAxisScale } from "../axes/axis-scale";
import {
  resolveHorizontalReferenceArea,
  resolveVerticalReferenceArea,
} from "./reference-area-geometry";

export interface ReferenceAreaProps<TDatum> {
  x1?: string | number | Date;
  x2?: string | number | Date;
  y1?: string | number | Date;
  y2?: string | number | Date;
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
  fill?: string;
  fillOpacity?: number;
  class?: string;
}

const hasCompletePair = (start: unknown, end: unknown): boolean => start != null && end != null;

export const ReferenceArea = <TDatum,>({
  x1,
  x2,
  y1,
  y2,
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
  fill = "var(--chart-reference-area)",
  fillOpacity = 0.35,
  class: className,
}: ReferenceAreaProps<TDatum>) => {
  const { plotArea } = useChartContext<TDatum>();
  const vertical = hasCompletePair(x1, x2);
  const horizontal = hasCompletePair(y1, y2);

  if (vertical === horizontal) {
    return null;
  }

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

  const rect = vertical
    ? resolveVerticalReferenceArea(
        xAxisScale,
        x1 as string | number | Date,
        x2 as string | number | Date,
        plotArea.width,
        plotArea.height,
      )
    : resolveHorizontalReferenceArea(
        yAxisScale,
        y1 as string | number | Date,
        y2 as string | number | Date,
        plotArea.width,
        plotArea.height,
      );

  if (!rect || !Number.isFinite(rect.width) || !Number.isFinite(rect.height)) {
    return null;
  }

  return (
    <g
      id={id}
      class={className}
      data-kamod-chart-reference-area=""
      aria-hidden="true"
      pointerEvents="none"
    >
      <rect
        x={rect.x}
        y={rect.y}
        width={rect.width}
        height={rect.height}
        fill={fill}
        fill-opacity={fillOpacity}
      />
      {label ? (
        <text
          x={rect.x + 6}
          y={rect.y + 14}
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
