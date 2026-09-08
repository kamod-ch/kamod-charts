import type { DataAccessor } from "../core";
import { normalizeAccessor } from "../core";
import type { ScatterSizeScale } from "./types";

export type { ScatterSizeScale };

export const DEFAULT_SCATTER_SIZE_SCALE: ScatterSizeScale = "sqrt";

export const DEFAULT_SCATTER_POINT_RADIUS = 4;

export const DEFAULT_SCATTER_POINT_RADIUS_RANGE: readonly [number, number] = [4, 18];

export const isValidScatterSizeValue = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

export const normalizeNumericPair = (pair: readonly [number, number]): [number, number] =>
  pair[0] <= pair[1] ? [pair[0], pair[1]] : [pair[1], pair[0]];

export const midpointOfRange = (range: readonly [number, number]): number => {
  const [min, max] = normalizeNumericPair(range);
  return (min + max) / 2;
};

export const inferScatterSizeDomain = <TDatum>(
  data: readonly TDatum[],
  sizeKey: DataAccessor<TDatum, number | null | undefined>,
  explicitDomain?: readonly [number, number],
): [number, number] => {
  if (explicitDomain) {
    return normalizeNumericPair(explicitDomain);
  }

  const read = normalizeAccessor(sizeKey);
  const values: number[] = [];

  for (const [index, datum] of data.entries()) {
    const value = read(datum, index);
    if (isValidScatterSizeValue(value)) {
      values.push(value);
    }
  }

  if (values.length === 0) {
    return [0, 0];
  }

  return normalizeNumericPair([Math.min(...values), Math.max(...values)]);
};

export const mapScatterSizeToRadius = (
  value: number,
  domain: readonly [number, number],
  range: readonly [number, number],
  scale: ScatterSizeScale = DEFAULT_SCATTER_SIZE_SCALE,
): number => {
  const [domainMin, domainMax] = normalizeNumericPair(domain);
  const [rangeMin, rangeMax] = normalizeNumericPair(range);
  const fallback = midpointOfRange(range);

  if (!isValidScatterSizeValue(value)) {
    return fallback;
  }

  if (domainMin === domainMax) {
    return fallback;
  }

  const span = domainMax - domainMin;
  const normalized =
    scale === "sqrt"
      ? (Math.sqrt(value) - Math.sqrt(Math.max(domainMin, 0))) /
        (Math.sqrt(domainMax) - Math.sqrt(Math.max(domainMin, 0)))
      : (value - domainMin) / span;

  const clamped = Math.min(Math.max(normalized, 0), 1);
  const radius = rangeMin + clamped * (rangeMax - rangeMin);

  if (!Number.isFinite(radius)) {
    return fallback;
  }

  return Math.max(0, radius);
};

export const resolveFixedScatterRadius = <TDatum>(
  datum: TDatum,
  index: number,
  radius: number | ((datum: TDatum, index: number) => number) | undefined,
  fallback: number,
): number => {
  if (typeof radius === "function") {
    const next = radius(datum, index);
    return isValidScatterSizeValue(next) ? next : fallback;
  }

  if (typeof radius === "number" && isValidScatterSizeValue(radius)) {
    return radius;
  }

  return fallback;
};

export interface ResolveScatterRadiusOptions<TDatum> {
  datum: TDatum;
  index: number;
  sizeKey?: DataAccessor<TDatum, number | null | undefined>;
  sizeScale?: ScatterSizeScale;
  sizeDomain?: readonly [number, number];
  pointRadiusRange?: readonly [number, number];
  pointRadius?: number | ((datum: TDatum, index: number) => number);
  /** Legacy alias for {@link ResolveScatterRadiusOptions.pointRadius}. */
  pointSize?: number | ((datum: TDatum, index: number) => number);
  seriesPointRadius?: number | ((datum: TDatum, index: number) => number);
  data: readonly TDatum[];
}

export interface ResolvedScatterRadius {
  radius: number;
  sizeValue: number | null;
  sizeValid: boolean;
}

export const resolveScatterRadius = <TDatum>({
  datum,
  index,
  sizeKey,
  sizeScale = DEFAULT_SCATTER_SIZE_SCALE,
  sizeDomain,
  pointRadiusRange = DEFAULT_SCATTER_POINT_RADIUS_RANGE,
  pointRadius,
  pointSize,
  seriesPointRadius,
  data,
}: ResolveScatterRadiusOptions<TDatum>): ResolvedScatterRadius => {
  const range = normalizeNumericPair(pointRadiusRange);

  if (pointRadius !== undefined) {
    return {
      radius: resolveFixedScatterRadius(datum, index, pointRadius, DEFAULT_SCATTER_POINT_RADIUS),
      sizeValue: null,
      sizeValid: true,
    };
  }

  if (pointSize !== undefined) {
    return {
      radius: resolveFixedScatterRadius(datum, index, pointSize, DEFAULT_SCATTER_POINT_RADIUS),
      sizeValue: null,
      sizeValid: true,
    };
  }

  if (sizeKey) {
    const read = normalizeAccessor(sizeKey);
    const sizeValue = read(datum, index);

    if (!isValidScatterSizeValue(sizeValue)) {
      return { radius: DEFAULT_SCATTER_POINT_RADIUS, sizeValue: null, sizeValid: false };
    }

    const domain = sizeDomain ?? inferScatterSizeDomain(data, sizeKey, sizeDomain);

    return {
      radius: mapScatterSizeToRadius(sizeValue, domain, range, sizeScale),
      sizeValue,
      sizeValid: true,
    };
  }

  if (seriesPointRadius !== undefined) {
    return {
      radius: resolveFixedScatterRadius(
        datum,
        index,
        seriesPointRadius,
        DEFAULT_SCATTER_POINT_RADIUS,
      ),
      sizeValue: null,
      sizeValid: true,
    };
  }

  return {
    radius: DEFAULT_SCATTER_POINT_RADIUS,
    sizeValue: null,
    sizeValid: true,
  };
};
