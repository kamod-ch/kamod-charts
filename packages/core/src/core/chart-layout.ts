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

export const resolveChartSize = ({
  width,
  height,
  initialWidth,
  responsive,
}: {
  width?: number;
  height: number;
  initialWidth?: number;
  responsive?: boolean;
}): ChartSize => ({
  width: clampDimension(
    responsive ? (initialWidth ?? width ?? 640) : (width ?? initialWidth ?? 640),
  ),
  height: clampDimension(height),
});

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
