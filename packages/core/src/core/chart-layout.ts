import type { ChartMargin, ChartRect, ChartSize } from "./types";

export const defaultChartMargin: ChartMargin = {
  top: 16,
  right: 16,
  bottom: 32,
  left: 48,
};

export const normalizeMargin = (margin?: Partial<ChartMargin>): ChartMargin => ({
  top: margin?.top ?? defaultChartMargin.top,
  right: margin?.right ?? defaultChartMargin.right,
  bottom: margin?.bottom ?? defaultChartMargin.bottom,
  left: margin?.left ?? defaultChartMargin.left,
});

export const clampDimension = (value: number): number => {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return value;
};

const resolveHeight = ({
  width,
  height,
  aspectRatio,
}: {
  width: number;
  height?: number;
  aspectRatio?: number;
}): number => {
  if (aspectRatio != null && Number.isFinite(aspectRatio) && aspectRatio > 0 && width > 0) {
    return clampDimension(width / aspectRatio);
  }
  return clampDimension(height ?? 320);
};

export const resolveChartSize = ({
  width,
  height,
  initialWidth,
  responsive,
  aspectRatio,
  measuredWidth,
}: {
  width?: number;
  height?: number;
  initialWidth?: number;
  responsive?: boolean;
  aspectRatio?: number;
  /** Responsive width from `ResizeObserver` (client only, after hydration). */
  measuredWidth?: number;
}): ChartSize => {
  const resolvedWidth = clampDimension(
    responsive ? (measuredWidth ?? width ?? initialWidth ?? 640) : (width ?? initialWidth ?? 640),
  );

  return {
    width: resolvedWidth,
    height: resolveHeight({ width: resolvedWidth, height, aspectRatio }),
  };
};

export const calculatePlotArea = (size: ChartSize, margin: ChartMargin): ChartRect => {
  const width = clampDimension(size.width - margin.left - margin.right);
  const height = clampDimension(size.height - margin.top - margin.bottom);

  return {
    x: margin.left,
    y: margin.top,
    width,
    height,
  };
};
