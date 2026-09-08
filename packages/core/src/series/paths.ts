import {
  area,
  curveBasis,
  curveLinear,
  curveMonotoneX,
  curveStep,
  curveStepAfter,
  curveStepBefore,
  line,
  type CurveFactory,
} from "d3-shape";
import type { CartesianPoint } from "./cartesian";

export type LineCurve =
  | "linear"
  | "monotoneX"
  | "basis"
  | "step"
  | "stepBefore"
  | "stepAfter"
  | CurveFactory;

export const resolveCurve = (curve: LineCurve = "linear"): CurveFactory => {
  if (typeof curve === "function") {
    return curve;
  }

  switch (curve) {
    case "monotoneX":
      return curveMonotoneX;
    case "basis":
      return curveBasis;
    case "step":
      return curveStep;
    case "stepBefore":
      return curveStepBefore;
    case "stepAfter":
      return curveStepAfter;
    default:
      return curveLinear;
  }
};

export const buildLinePath = <TDatum>(
  points: readonly CartesianPoint<TDatum>[],
  curve: LineCurve,
  connectNulls: boolean,
): string => {
  const generator = line<(typeof points)[number]>()
    .defined((point) => connectNulls || point.defined)
    .x((point) => point.x ?? 0)
    .y((point) => point.y ?? 0)
    .curve(resolveCurve(curve));

  return generator(points as (typeof points)[number][]) ?? "";
};

export const buildAreaPath = <TDatum>(
  points: readonly CartesianPoint<TDatum>[],
  curve: LineCurve,
  baselineY: number,
): string => {
  const generator = area<(typeof points)[number]>()
    .defined((point) => point.defined)
    .x((point) => point.x ?? 0)
    .y0(baselineY)
    .y1((point) => point.y ?? baselineY)
    .curve(resolveCurve(curve));

  return generator(points as (typeof points)[number][]) ?? "";
};
