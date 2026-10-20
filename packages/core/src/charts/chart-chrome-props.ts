import type { ChartClippingOptions, ChartDefsSlotOptions, ChartSurfaceSvgOptions } from "../core";
import type { TickCollisionOptions } from "../axes/tick-collision";

/** Shared presentation props for every high-level chart surface. */
export interface ChartStyleProps {
  class?: string;
  style?: string | Record<string, string | number>;
}

export interface ChartLayoutProps {
  width?: number;
  height?: number;
  initialWidth?: number;
  responsive?: boolean;
  aspectRatio?: number;
}

export interface ChartChromeProps
  extends ChartSurfaceSvgOptions, ChartDefsSlotOptions, ChartStyleProps, ChartLayoutProps {
  title?: string;
  description?: string;
  id?: string;
}

/** Cartesian-only surface options (not used on pie/donut). */
export interface CartesianSurfaceChartProps
  extends ChartChromeProps, ChartClippingOptions, TickCollisionOptions {
  tickRotation?: number;
}
