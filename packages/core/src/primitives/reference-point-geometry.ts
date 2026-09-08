import type { AxisScale, AxisTickValue } from "../axes/ticks";
import { getScalePosition } from "../axes/ticks";

export type ReferencePointShape = "circle" | "square" | "diamond";
export type ReferencePointLabelPosition = "top" | "right" | "bottom" | "left";

export interface ProjectedReferencePoint {
  x: number;
  y: number;
}

export interface ReferencePointLabelLayout {
  x: number;
  y: number;
  textAnchor: "start" | "middle" | "end";
  dominantBaseline: "auto" | "middle" | "hanging";
}

const LABEL_OFFSET = 8;

export const projectReferencePoint = (
  xScale: AxisScale,
  yScale: AxisScale,
  x: AxisTickValue,
  y: AxisTickValue,
  plotWidth: number,
  plotHeight: number,
): ProjectedReferencePoint | null => {
  const plotX = getScalePosition(xScale, x);
  const plotY = getScalePosition(yScale, y);
  if (
    plotX == null ||
    plotY == null ||
    !Number.isFinite(plotX) ||
    !Number.isFinite(plotY) ||
    plotX < 0 ||
    plotX > plotWidth ||
    plotY < 0 ||
    plotY > plotHeight
  ) {
    return null;
  }

  return { x: plotX, y: plotY };
};

export const resolveReferencePointLabel = (
  point: ProjectedReferencePoint,
  size: number,
  labelPosition: ReferencePointLabelPosition,
): ReferencePointLabelLayout => {
  const offset = size + LABEL_OFFSET;

  switch (labelPosition) {
    case "right":
      return {
        x: point.x + offset,
        y: point.y,
        textAnchor: "start",
        dominantBaseline: "middle",
      };
    case "bottom":
      return {
        x: point.x,
        y: point.y + offset,
        textAnchor: "middle",
        dominantBaseline: "hanging",
      };
    case "left":
      return {
        x: point.x - offset,
        y: point.y,
        textAnchor: "end",
        dominantBaseline: "middle",
      };
    default:
      return {
        x: point.x,
        y: point.y - offset,
        textAnchor: "middle",
        dominantBaseline: "auto",
      };
  }
};

export const referencePointDiamondPoints = (x: number, y: number, size: number): string =>
  `${x},${y - size} ${x + size},${y} ${x},${y + size} ${x - size},${y}`;
