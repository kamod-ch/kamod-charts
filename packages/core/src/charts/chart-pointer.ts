import type { ChartPointerClientEvent } from "../interaction";
import { getPointerPosition } from "../interaction";
import { resolvePlotAreaFromSize } from "./cartesian-interaction";

export const resolvePointerPlot = (
  event: ChartPointerClientEvent,
  fallbackWidth: number,
  height: number,
) => {
  const target = event.currentTarget;
  const surface =
    target instanceof SVGSVGElement && target.hasAttribute("data-kamod-chart-surface")
      ? target
      : target instanceof Element
        ? target.closest("[data-kamod-chart-surface]")
        : null;
  const svg = surface instanceof SVGSVGElement ? surface : null;
  const size = {
    width: svg?.viewBox.baseVal.width || fallbackWidth,
    height: svg?.viewBox.baseVal.height || height,
  };
  const plot = resolvePlotAreaFromSize(size.width, size.height);
  return { plot, position: getPointerPosition(event, plot) };
};
