import type { DataAccessor } from "../core";
import { normalizeAccessor, useChartContext } from "../core";
import {
  createLinearScale,
  createPointScale,
  createTimeScale,
  inferCategoricalDomain,
  inferNumericDomain,
  inferTimeDomain,
  type NumericDomain,
  type ScaleKind,
  type TimeDomain,
} from "../scales";
import type { AxisScale } from "../axes";

export interface CartesianScaleOptions<TDatum> {
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  yKey: DataAccessor<TDatum, number | null | undefined>;
  xScale?: ScaleKind;
  xDomain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
  yDomain?: readonly [number, number];
  nice?: boolean | number;
}

export interface CartesianPoint<TDatum> {
  datum: TDatum;
  index: number;
  xValue: string | number | Date | null | undefined;
  yValue: number | null | undefined;
  x: number | null;
  y: number | null;
  defined: boolean;
}

const indexAccessor = <TDatum>(_datum: TDatum, index: number): number => index;

export const inferCombinedNumericDomain = <TDatum>(
  data: readonly TDatum[],
  accessors: readonly DataAccessor<TDatum, number | null | undefined>[],
): NumericDomain => {
  const values: number[] = [];

  for (const accessor of accessors) {
    const read = normalizeAccessor(accessor);
    for (const [index, datum] of data.entries()) {
      const value = read(datum, index);
      if (typeof value === "number" && Number.isFinite(value)) {
        values.push(value);
      }
    }
  }

  return inferNumericDomain({ data: values.map((value) => ({ value })), accessor: "value" });
};

export const useCartesianScales = <TDatum>({
  xKey,
  yKey,
  xScale,
  xDomain,
  yDomain,
  nice,
}: CartesianScaleOptions<TDatum>): { xScale: AxisScale; yScale: AxisScale } => {
  const { data, plotArea, xKey: contextXKey, xScale: contextXScale } = useChartContext<TDatum>();
  const resolvedXKey = xKey ?? contextXKey ?? indexAccessor;
  const resolvedXScale = xScale ?? contextXScale ?? "linear";
  const xRange: readonly [number, number] = [0, plotArea.width];
  const yRange: readonly [number, number] = [plotArea.height, 0];

  const nextXScale = (() => {
    if (resolvedXScale === "time") {
      const domain =
        xDomain && xDomain[0] instanceof Date && xDomain[1] instanceof Date
          ? (xDomain as TimeDomain)
          : inferTimeDomain({
              data,
              accessor: resolvedXKey as DataAccessor<TDatum, Date | null | undefined>,
            });
      return createTimeScale({ domain, range: xRange, nice });
    }

    if (resolvedXScale === "point" || resolvedXScale === "band") {
      const domain = inferCategoricalDomain(
        data,
        resolvedXKey,
        Array.isArray(xDomain) && typeof xDomain[0] === "string" ? xDomain : undefined,
      );
      return createPointScale({ domain, range: xRange });
    }

    const domain =
      xDomain && typeof xDomain[0] === "number" && typeof xDomain[1] === "number"
        ? (xDomain as NumericDomain)
        : inferNumericDomain({
            data,
            accessor: resolvedXKey as DataAccessor<TDatum, number | null | undefined>,
          });
    return createLinearScale({ domain, range: xRange, nice });
  })();

  const nextYDomain = yDomain ?? inferNumericDomain({ data, accessor: yKey });
  const nextYScale = createLinearScale({ domain: nextYDomain, range: yRange, nice });

  return { xScale: nextXScale, yScale: nextYScale };
};

export const getCartesianPoints = <TDatum>(
  data: readonly TDatum[],
  xScale: AxisScale,
  yScale: AxisScale,
  xKey: DataAccessor<TDatum, string | number | Date | null | undefined> | undefined,
  yKey: DataAccessor<TDatum, number | null | undefined>,
): CartesianPoint<TDatum>[] => {
  const readX = normalizeAccessor(xKey ?? indexAccessor);
  const readY = normalizeAccessor(yKey);

  return data.map((datum, index) => {
    const xValue = readX(datum, index);
    const yValue = readY(datum, index);
    const x = xValue == null ? null : (xScale(xValue as never) ?? null);
    const y =
      typeof yValue === "number" && Number.isFinite(yValue)
        ? (yScale(yValue as never) ?? null)
        : null;

    return {
      datum,
      index,
      xValue,
      yValue,
      x,
      y,
      defined: typeof x === "number" && typeof y === "number",
    };
  });
};
