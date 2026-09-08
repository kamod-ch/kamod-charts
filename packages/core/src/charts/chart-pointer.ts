import type { JSX } from "preact";
import { getPointerPosition } from "../interaction";
import { resolvePlotAreaFromSize } from "./cartesian-interaction";

export const resolvePointerPlot = (
  event: JSX.TargetedPointerEvent<Element>,
  fallbackWidth: number,
  height: number,
) => {
  const surface =
    event.currentTarget instanceof SVGSVGElement &&
    event.currentTarget.hasAttribute("data-kamod-chart-surface")
      ? event.currentTarget
      : event.currentTarget.closest("[data-kamod-chart-surface]");
  const svg = surface instanceof SVGSVGElement ? surface : null;
  const size = {
    width: svg?.viewBox.baseVal.width || fallbackWidth,
    height: svg?.viewBox.baseVal.height || height,
  };
  const plot = resolvePlotAreaFromSize(size.width, size.height);
  return { plot, position: getPointerPosition(event, plot) };
};
