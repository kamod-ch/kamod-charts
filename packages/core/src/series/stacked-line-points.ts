import type { DataAccessor } from "../core";
import { normalizeAccessor } from "../core";
import type { AxisScale } from "../axes";
import type { CartesianPoint } from "./cartesian";
import { getStackedValues, type StackSeries, type StackedValue } from "./stack";

const indexAccessor = <TDatum>(_datum: TDatum, index: number): number => index;

export const stackedLayerToCartesianPoints = <TDatum>(
  layer: readonly StackedValue<TDatum>[],
  valueKey: DataAccessor<TDatum, number | null | undefined>,
  xScale: AxisScale,
  yScale: AxisScale,
  xKey: DataAccessor<TDatum, string | number | Date | null | undefined> | undefined,
  connectNulls: boolean,
): CartesianPoint<TDatum>[] => {
  const readX = normalizeAccessor(xKey ?? indexAccessor);
  const readValue = normalizeAccessor(valueKey);

  return layer.map((stackPoint) => {
    const rawValue = readValue(stackPoint.datum, stackPoint.index);
    const hasFiniteValue = typeof rawValue === "number" && Number.isFinite(rawValue);
    const xValue = readX(stackPoint.datum, stackPoint.index);
    const x = xValue == null ? null : (xScale(xValue as never) ?? null);
    const y = yScale(stackPoint.y1 as never) ?? null;

    return {
      datum: stackPoint.datum,
      index: stackPoint.index,
      xValue,
      yValue: hasFiniteValue ? rawValue : (rawValue ?? null),
      x,
      y,
      defined:
        typeof x === "number" &&
        typeof y === "number" &&
        Number.isFinite(x) &&
        Number.isFinite(y) &&
        (connectNulls || hasFiniteValue),
    };
  });
};

export const buildStackLayers = <TDatum>(
  data: readonly TDatum[],
  series: readonly StackSeries<TDatum>[],
): readonly (readonly StackedValue<TDatum>[])[] => getStackedValues(data, series);

export const getStackedSeriesValueFromLayers = <TDatum>(
  layers: readonly (readonly StackedValue<TDatum>[])[],
  series: readonly StackSeries<TDatum>[],
  seriesId: string,
  index: number,
): StackedValue<TDatum> | null => {
  const seriesIndex = series.findIndex((entry) => entry.id === seriesId);
  if (seriesIndex < 0) {
    return null;
  }
  return layers[seriesIndex]?.[index] ?? null;
};

export const getStackedSeriesValueAt = <TDatum>(
  data: readonly TDatum[],
  series: readonly StackSeries<TDatum>[],
  seriesId: string,
  index: number,
): StackedValue<TDatum> | null =>
  getStackedSeriesValueFromLayers(buildStackLayers(data, series), series, seriesId, index);
