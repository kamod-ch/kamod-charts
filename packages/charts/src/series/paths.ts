import { area, curveBasis, curveLinear, curveMonotoneX, line, type CurveFactory } from "d3-shape";
import type { CartesianPoint } from "./cartesian";

export type LineCurve = "linear" | "monotoneX" | "basis" | CurveFactory;

export const resolveLineCurve = (curve: LineCurve = "linear"): CurveFactory => {
  if (typeof curve === "function") {
    return curve;
  }

  if (curve === "monotoneX") {
    return curveMonotoneX;
  }

  if (curve === "basis") {
    return curveBasis;
  }

  return curveLinear;
};

export const resolveAreaCurve = (curve: LineCurve = "linear"): CurveFactory => {
  if (typeof curve === "function") {
    return curve;
  }

  return curve === "monotoneX" ? curveMonotoneX : curveLinear;
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
    .curve(resolveLineCurve(curve));

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
    .curve(resolveAreaCurve(curve));

  return generator(points as (typeof points)[number][]) ?? "";
};
