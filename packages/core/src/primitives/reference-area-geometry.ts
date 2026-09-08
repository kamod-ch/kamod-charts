import type { AxisScale } from "../axes/ticks";
import { getScalePosition, type AxisTickValue } from "../axes/ticks";

export interface ReferenceAreaRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const isBandScale = (scale: AxisScale): scale is AxisScale & { bandwidth: () => number } =>
  "bandwidth" in scale;

const isFiniteNumber = (value: number): boolean => Number.isFinite(value);

export const projectReferenceSpan = (
  scale: AxisScale,
  start: AxisTickValue,
  end: AxisTickValue,
): { start: number; end: number } | null => {
  if (isBandScale(scale) && typeof start === "string" && typeof end === "string") {
    const bandScale = scale as import("d3-scale").ScaleBand<string>;
    const startOffset = bandScale(start);
    const endOffset = bandScale(end);
    if (startOffset == null || endOffset == null) {
      return null;
    }

    const bandwidth = bandScale.bandwidth();
    const left = Math.min(startOffset, endOffset);
    const right = Math.max(startOffset + bandwidth, endOffset + bandwidth);
    if (!isFiniteNumber(left) || !isFiniteNumber(right)) {
      return null;
    }

    return { start: left, end: right };
  }

  const startPosition = getScalePosition(scale, start);
  const endPosition = getScalePosition(scale, end);
  if (
    startPosition == null ||
    endPosition == null ||
    !isFiniteNumber(startPosition) ||
    !isFiniteNumber(endPosition)
  ) {
    return null;
  }

  return {
    start: Math.min(startPosition, endPosition),
    end: Math.max(startPosition, endPosition),
  };
};

export const clampReferenceSpan = (
  span: { start: number; end: number },
  max: number,
): { start: number; end: number } | null => {
  const start = Math.max(0, Math.min(span.start, max));
  const end = Math.max(0, Math.min(span.end, max));
  if (!isFiniteNumber(start) || !isFiniteNumber(end) || end <= start) {
    return null;
  }

  return { start, end };
};

export const resolveVerticalReferenceArea = (
  xScale: AxisScale,
  x1: AxisTickValue,
  x2: AxisTickValue,
  plotWidth: number,
  plotHeight: number,
): ReferenceAreaRect | null => {
  const span = projectReferenceSpan(xScale, x1, x2);
  if (!span) {
    return null;
  }

  const clamped = clampReferenceSpan(span, plotWidth);
  if (!clamped) {
    return null;
  }

  return {
    x: clamped.start,
    y: 0,
    width: clamped.end - clamped.start,
    height: plotHeight,
  };
};

export const resolveHorizontalReferenceArea = (
  yScale: AxisScale,
  y1: AxisTickValue,
  y2: AxisTickValue,
  plotWidth: number,
  plotHeight: number,
): ReferenceAreaRect | null => {
  const span = projectReferenceSpan(yScale, y1, y2);
  if (!span) {
    return null;
  }

  const clamped = clampReferenceSpan(span, plotHeight);
  if (!clamped) {
    return null;
  }

  const top = Math.min(clamped.start, clamped.end);
  const bottom = Math.max(clamped.start, clamped.end);

  return {
    x: 0,
    y: top,
    width: plotWidth,
    height: bottom - top,
  };
};
