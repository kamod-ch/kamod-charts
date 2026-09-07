import type { DataAccessor } from "../core";
import { useChartContext } from "../core";
import { createBandScale, createLinearScale, createPointScale, createTimeScale } from "../scales";
import {
  inferCategoricalDomain,
  inferNumericDomain,
  inferTimeDomain,
  type DomainPadding,
  type NumericDomain,
  type ScaleKind,
  type TimeDomain,
} from "../scales";
import type { AxisScale } from "./ticks";

export interface AxisScaleOptions<TDatum> {
  dataKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  scale?: ScaleKind;
  domain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
  padding?: number | DomainPadding;
  nice?: boolean | number;
  tickCount?: number;
  orientation: "x" | "y";
}

const defaultNumericDomain: NumericDomain = [0, 1];
const defaultTimeDomain: TimeDomain = [new Date(0), new Date(1)];

export const useAxisScale = <TDatum>({
  dataKey,
  scale,
  domain,
  padding,
  nice,
  orientation,
}: AxisScaleOptions<TDatum>): AxisScale => {
  const { data, plotArea, xKey, xScale } = useChartContext<TDatum>();
  const resolvedDataKey = dataKey ?? (orientation === "x" ? xKey : undefined);
  const resolvedScale = scale ?? (orientation === "x" ? xScale : undefined) ?? "linear";
  const range: readonly [number, number] =
    orientation === "x"
      ? [0, plotArea.width]
      : resolvedScale === "band" || resolvedScale === "point"
        ? [0, plotArea.height]
        : [plotArea.height, 0];

  if (resolvedScale === "band") {
    const categoricalDomain = inferCategoricalDomain(
      data,
      resolvedDataKey ?? (() => undefined),
      Array.isArray(domain) && typeof domain[0] === "string"
        ? (domain as readonly string[])
        : undefined,
    );

    return createBandScale({ domain: categoricalDomain, range });
  }

  if (resolvedScale === "point") {
    const categoricalDomain = inferCategoricalDomain(
      data,
      resolvedDataKey ?? (() => undefined),
      Array.isArray(domain) && typeof domain[0] === "string"
        ? (domain as readonly string[])
        : undefined,
    );

    return createPointScale({ domain: categoricalDomain, range });
  }

  if (resolvedScale === "time") {
    const timeDomain =
      domain && domain[0] instanceof Date && domain[1] instanceof Date
        ? (domain as TimeDomain)
        : resolvedDataKey
          ? inferTimeDomain({
              data,
              accessor: resolvedDataKey as DataAccessor<TDatum, Date | null | undefined>,
              padding,
            })
          : defaultTimeDomain;

    return createTimeScale({ domain: timeDomain, range, nice });
  }

  const numericDomain =
    domain && typeof domain[0] === "number" && typeof domain[1] === "number"
      ? (domain as NumericDomain)
      : resolvedDataKey
        ? inferNumericDomain({
            data,
            accessor: resolvedDataKey as DataAccessor<TDatum, number | null | undefined>,
            padding,
          })
        : defaultNumericDomain;

  return createLinearScale({ domain: numericDomain, range, nice });
};
