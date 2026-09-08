import type { BarGeometry } from "./bar-geometry";
import type { BarDatumContext, BarFill, BarSeriesConfig } from "./types";

export const createBarDatumContext = <TDatum>(
  bar: BarGeometry<TDatum>,
  options: {
    orientation: "vertical" | "horizontal";
    stacked: boolean;
    active: boolean;
  },
): BarDatumContext<TDatum> => ({
  datum: bar.datum,
  index: bar.index,
  value: bar.value as number,
  valueStart: bar.valueStart,
  valueEnd: bar.valueEnd,
  seriesId: bar.seriesId,
  seriesIndex: bar.seriesIndex,
  orientation: options.orientation,
  stacked: options.stacked,
  active: options.active,
});

export const resolveSeriesColor = <TDatum>(
  series: BarSeriesConfig<TDatum>,
  seriesIndex: number,
): string => series.color ?? `var(--chart-${(seriesIndex % 4) + 1})`;

export const resolveBarFill = <TDatum>(
  series: BarSeriesConfig<TDatum>,
  context: BarDatumContext<TDatum>,
): string => {
  const fallback = resolveSeriesColor(series, context.seriesIndex);
  const fill: BarFill<TDatum> | undefined = series.fill;
  if (fill == null) {
    return fallback;
  }

  if (typeof fill === "string") {
    return fill;
  }

  const resolved = fill(context);
  return resolved ?? fallback;
};

export const resolveBarGeometryFill = <TDatum>(
  bar: BarGeometry<TDatum>,
  options: {
    orientation: "vertical" | "horizontal";
    stacked: boolean;
    active: boolean;
  },
): string => resolveBarFill(bar.series, createBarDatumContext(bar, options));
