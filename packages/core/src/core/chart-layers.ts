import type { ComponentChildren } from "preact";

/** Optional plot-local layer slots (cartesian high-level charts). */
export interface ChartPlotLayers {
  /** Grid, data marks, and in-plot reference areas (clipped when `clipPlotArea`). */
  clipped?: ComponentChildren;
  /** Active crosshair, reference points, and other marks that may extend past the plot edge. */
  foreground?: ComponentChildren;
  /** Axes, ticks, labels, and reference lines tied to axes. */
  axes?: ComponentChildren;
}

export interface ChartDefsSlotOptions {
  /** Chart-local SVG defs merged under the root `<defs>` (gradients, patterns, markers). */
  defs?: ComponentChildren;
}

export interface ChartClippingOptions {
  /** Clip `plotLayers.clipped` to the computed plot area. Default: false. */
  clipPlotArea?: boolean;
}
