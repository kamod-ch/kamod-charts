import type { JSX } from "preact";
import type { ChartRect } from "../core";

export interface ChartPointerPosition {
  x: number;
  y: number;
  plotX: number;
  plotY: number;
}

export const getPointerPosition = (
  event: JSX.TargetedPointerEvent<SVGSVGElement>,
  plotArea: ChartRect,
): ChartPointerPosition => {
  const rect = event.currentTarget.getBoundingClientRect();
  const scaleX = rect.width > 0 ? event.currentTarget.viewBox.baseVal.width / rect.width : 1;
  const scaleY = rect.height > 0 ? event.currentTarget.viewBox.baseVal.height / rect.height : 1;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;

  return {
    x,
    y,
    plotX: x - plotArea.x,
    plotY: y - plotArea.y,
  };
};

export const getNearestIndexByX = (
  plotX: number,
  plotWidth: number,
  pointCount: number,
): number => {
  if (pointCount <= 1 || plotWidth <= 0) {
    return 0;
  }

  return Math.min(Math.max(Math.round((plotX / plotWidth) * (pointCount - 1)), 0), pointCount - 1);
};
