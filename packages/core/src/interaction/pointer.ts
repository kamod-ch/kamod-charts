import type { ChartRect } from "../core";

export interface ChartPointerPosition {
  x: number;
  y: number;
  plotX: number;
  plotY: number;
}

/** Pointer or wheel events with client coordinates relative to the chart surface. */
export type ChartPointerClientEvent = {
  clientX: number;
  clientY: number;
  currentTarget: EventTarget | null;
};

const resolveChartSurface = (node: EventTarget | null): SVGSVGElement | null => {
  if (node instanceof SVGSVGElement && node.hasAttribute("data-kamod-chart-surface")) {
    return node;
  }

  if (node instanceof Element) {
    const surface = node.closest("[data-kamod-chart-surface]");
    return surface instanceof SVGSVGElement ? surface : null;
  }

  return null;
};

export const getPointerPosition = (
  event: ChartPointerClientEvent,
  plotArea: ChartRect,
): ChartPointerPosition => {
  const surface = resolveChartSurface(event.currentTarget);
  const rectHost = surface ?? (event.currentTarget instanceof Element ? event.currentTarget : null);
  if (!rectHost) {
    return { x: 0, y: 0, plotX: 0, plotY: 0 };
  }
  const rect = rectHost.getBoundingClientRect();
  const viewBoxWidth =
    surface?.viewBox.baseVal.width ??
    (rectHost instanceof SVGSVGElement ? rectHost.viewBox.baseVal.width : rect.width);
  const viewBoxHeight =
    surface?.viewBox.baseVal.height ??
    (rectHost instanceof SVGSVGElement ? rectHost.viewBox.baseVal.height : rect.height);
  const scaleX = rect.width > 0 ? viewBoxWidth / rect.width : 1;
  const scaleY = rect.height > 0 ? viewBoxHeight / rect.height : 1;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;

  return {
    x,
    y,
    plotX: x - plotArea.x,
    plotY: y - plotArea.y,
  };
};

/**
 * Maps plot X to a datum index assuming equal spacing across the plot width.
 * Intended only for explicitly index-spaced domains. Continuous numeric/time
 * and scatter selection should use projected-position helpers instead.
 */
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
