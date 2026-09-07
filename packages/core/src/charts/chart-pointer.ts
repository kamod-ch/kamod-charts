import type { JSX } from "preact";
import { getPointerPosition } from "../interaction";
import { resolvePlotAreaFromSize } from "./cartesian-interaction";

export const resolvePointerPlot = (
  event: JSX.TargetedPointerEvent<SVGSVGElement>,
  fallbackWidth: number,
  height: number,
) => {
  const size = {
    width: event.currentTarget.viewBox.baseVal.width || fallbackWidth,
    height: event.currentTarget.viewBox.baseVal.height || height,
  };
  const plot = resolvePlotAreaFromSize(size.width, size.height);
  return { plot, position: getPointerPosition(event, plot) };
};
