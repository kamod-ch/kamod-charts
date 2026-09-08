import type { AxisScale, AxisTickValue } from "../axes/ticks";
import { getScalePosition } from "../axes/ticks";

export type ReferenceSegmentLabelPosition = "start" | "middle" | "end";

export interface ProjectedReferenceSegmentPoint {
  x: number;
  y: number;
}

export interface ProjectedReferenceSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface ReferenceSegmentLabelLayout {
  x: number;
  y: number;
  textAnchor: "start" | "middle" | "end";
  dominantBaseline: "auto" | "middle" | "hanging";
}

const LABEL_OFFSET = 8;
const EPSILON = 1e-6;

const isFinitePoint = (x: number, y: number): boolean => Number.isFinite(x) && Number.isFinite(y);

export const projectReferenceSegmentPoint = (
  xScale: AxisScale,
  yScale: AxisScale,
  x: AxisTickValue,
  y: AxisTickValue,
): ProjectedReferenceSegmentPoint | null => {
  const plotX = getScalePosition(xScale, x);
  const plotY = getScalePosition(yScale, y);
  if (plotX == null || plotY == null || !isFinitePoint(plotX, plotY)) {
    return null;
  }

  return { x: plotX, y: plotY };
};

const computeOutCode = (x: number, y: number, width: number, height: number): number => {
  let code = 0;
  if (x < 0) {
    code |= 1;
  } else if (x > width) {
    code |= 2;
  }
  if (y < 0) {
    code |= 4;
  } else if (y > height) {
    code |= 8;
  }
  return code;
};

export const clipReferenceSegmentToPlot = (
  start: ProjectedReferenceSegmentPoint,
  end: ProjectedReferenceSegmentPoint,
  plotWidth: number,
  plotHeight: number,
): ProjectedReferenceSegment | null => {
  let x1 = start.x;
  let y1 = start.y;
  let x2 = end.x;
  let y2 = end.y;
  let code1 = computeOutCode(x1, y1, plotWidth, plotHeight);
  let code2 = computeOutCode(x2, y2, plotWidth, plotHeight);
  let accept = false;

  while (true) {
    if ((code1 | code2) === 0) {
      accept = true;
      break;
    }
    if ((code1 & code2) !== 0) {
      break;
    }

    const codeOut = code1 !== 0 ? code1 : code2;
    let x = 0;
    let y = 0;

    if (codeOut & 8) {
      x = x1 + ((x2 - x1) * (plotHeight - y1)) / (y2 - y1);
      y = plotHeight;
    } else if (codeOut & 4) {
      x = x1 + ((x2 - x1) * (0 - y1)) / (y2 - y1);
      y = 0;
    } else if (codeOut & 2) {
      y = y1 + ((y2 - y1) * (plotWidth - x1)) / (x2 - x1);
      x = plotWidth;
    } else {
      y = y1 + ((y2 - y1) * (0 - x1)) / (x2 - x1);
      x = 0;
    }

    if (codeOut === code1) {
      x1 = x;
      y1 = y;
      code1 = computeOutCode(x1, y1, plotWidth, plotHeight);
    } else {
      x2 = x;
      y2 = y;
      code2 = computeOutCode(x2, y2, plotWidth, plotHeight);
    }
  }

  if (
    !accept ||
    !isFinitePoint(x1, y1) ||
    !isFinitePoint(x2, y2) ||
    (Math.abs(x2 - x1) <= EPSILON && Math.abs(y2 - y1) <= EPSILON)
  ) {
    return null;
  }

  return { x1, y1, x2, y2 };
};

export const projectReferenceSegment = (
  xScale: AxisScale,
  yScale: AxisScale,
  startX: AxisTickValue,
  startY: AxisTickValue,
  endX: AxisTickValue,
  endY: AxisTickValue,
  plotWidth: number,
  plotHeight: number,
): ProjectedReferenceSegment | null => {
  const start = projectReferenceSegmentPoint(xScale, yScale, startX, startY);
  const end = projectReferenceSegmentPoint(xScale, yScale, endX, endY);
  if (!start || !end) {
    return null;
  }

  if (Math.abs(end.x - start.x) <= EPSILON && Math.abs(end.y - start.y) <= EPSILON) {
    return null;
  }

  return clipReferenceSegmentToPlot(start, end, plotWidth, plotHeight);
};

export const resolveReferenceSegmentLabel = (
  segment: ProjectedReferenceSegment,
  labelPosition: ReferenceSegmentLabelPosition,
): ReferenceSegmentLabelLayout => {
  const dx = segment.x2 - segment.x1;
  const dy = segment.y2 - segment.y1;
  const length = Math.hypot(dx, dy);
  const tangentX = length > EPSILON ? dx / length : 1;
  const tangentY = length > EPSILON ? dy / length : 0;

  const ratio = labelPosition === "start" ? 0 : labelPosition === "end" ? 1 : 0.5;
  const normalX = -tangentY;
  const normalY = -tangentX;
  const anchorX = segment.x1 + dx * ratio + normalX * LABEL_OFFSET;
  const anchorY = segment.y1 + dy * ratio + normalY * LABEL_OFFSET;

  return {
    x: anchorX,
    y: anchorY,
    textAnchor: labelPosition === "start" ? "start" : labelPosition === "end" ? "end" : "middle",
    dominantBaseline: "middle",
  };
};
