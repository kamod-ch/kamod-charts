import type { ComponentChildren } from "preact";
import { useChartContext, type DataAccessor } from "../core";
import type { DomainPadding, ScaleKind } from "../scales";
import { useAxisScale } from "../axes/axis-scale";
import {
  projectReferencePoint,
  referencePointDiamondPoints,
  resolveReferencePointLabel,
  type ReferencePointLabelPosition,
  type ReferencePointShape,
} from "./reference-point-geometry";

export type { ReferencePointLabelPosition, ReferencePointShape };

export interface ReferencePointProps<TDatum> {
  x: string | number | Date;
  y: string | number | Date;
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
  color?: string;
  size?: number;
  shape?: ReferencePointShape;
  labelPosition?: ReferencePointLabelPosition;
  class?: string;
}

const renderShape = (
  shape: ReferencePointShape,
  x: number,
  y: number,
  size: number,
  color: string,
  title?: string,
): ComponentChildren => {
  const titled = (node: ComponentChildren) =>
    title ? (
      <>
        <title>{title}</title>
        {node}
      </>
    ) : (
      node
    );

  switch (shape) {
    case "square":
      return titled(
        <rect x={x - size} y={y - size} width={size * 2} height={size * 2} fill={color} />,
      );
    case "diamond":
      return titled(<polygon points={referencePointDiamondPoints(x, y, size)} fill={color} />);
    default:
      return titled(<circle cx={x} cy={y} r={size} fill={color} />);
  }
};

export const ReferencePoint = <TDatum,>({
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
  id,
  label,
  color = "var(--chart-reference-point)",
  size = 4,
  shape = "circle",
  labelPosition = "top",
  class: className,
}: ReferencePointProps<TDatum>) => {
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
  const projected = projectReferencePoint(
    xAxisScale,
    yAxisScale,
    x,
    y,
    plotArea.width,
    plotArea.height,
  );

  if (!projected || !Number.isFinite(size) || size <= 0) {
    return null;
  }

  const labelLayout = label ? resolveReferencePointLabel(projected, size, labelPosition) : null;

  return (
    <g
      id={id}
      class={className}
      data-kamod-chart-reference-point=""
      aria-hidden="true"
      pointerEvents="none"
    >
      {renderShape(shape, projected.x, projected.y, size, color, label)}
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
