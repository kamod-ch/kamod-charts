import type { ChartCartesianScaleKind, DataAccessor } from "../core";
import type { NumericDomain } from "../scales";
import { buildCartesianXIndex, type CartesianXIndex } from "./cartesian-x-index";
import { resolvePlotAreaFromSize } from "./cartesian-interaction";

export type CartesianLayoutModel = {
  plotWidth: number;
  plotHeight: number;
  yDomain: NumericDomain;
  xIndex: CartesianXIndex | null;
};

export const buildCartesianLayoutModel = <TDatum>({
  data,
  xKey,
  xScale,
  yDomain,
  width,
  height,
  primarySeriesKey,
}: {
  data: readonly TDatum[];
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ChartCartesianScaleKind;
  yDomain: NumericDomain;
  width: number;
  height: number;
  primarySeriesKey?: DataAccessor<TDatum, number | null | undefined>;
}): CartesianLayoutModel => {
  const plot = resolvePlotAreaFromSize(width, height);
  const xIndex =
    primarySeriesKey != null
      ? buildCartesianXIndex({
          data,
          xKey,
          xScale,
          yDomain,
          plotWidth: plot.width,
          seriesKey: primarySeriesKey,
        })
      : null;

  return {
    plotWidth: plot.width,
    plotHeight: plot.height,
    yDomain,
    xIndex,
  };
};
