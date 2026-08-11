import { extent, max, min } from "d3-array";
import type { DataAccessor } from "../core";
import { normalizeAccessor } from "../core";

export type ScaleKind = "linear" | "time" | "band" | "point";

export type ContinuousDomainValue = number | Date;
export type ContinuousDomain = readonly [ContinuousDomainValue, ContinuousDomainValue];
export type NumericDomain = readonly [number, number];
export type TimeDomain = readonly [Date, Date];
export type CategoricalDomain = readonly string[];

export interface DomainPadding {
  start?: number;
  end?: number;
}

export interface ContinuousDomainOptions<TDatum, TValue extends ContinuousDomainValue> {
  data: readonly TDatum[];
  accessor: DataAccessor<TDatum, TValue | null | undefined>;
  domain?: readonly [TValue, TValue];
  padding?: number | DomainPadding;
}

const isValidNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isValidDate = (value: unknown): value is Date =>
  value instanceof Date && Number.isFinite(value.getTime());

export const toNumber = (value: number | Date): number =>
  value instanceof Date ? value.getTime() : value;

const normalizePadding = (padding?: number | DomainPadding): Required<DomainPadding> => {
  if (typeof padding === "number") {
    return { start: padding, end: padding };
  }

  return { start: padding?.start ?? 0, end: padding?.end ?? 0 };
};

const applyNumericPadding = (
  domain: NumericDomain,
  padding?: number | DomainPadding,
): NumericDomain => {
  const normalized = normalizePadding(padding);
  const span = domain[1] - domain[0];
  const fallbackSpan = Math.abs(domain[0]) || 1;
  const safeSpan = span === 0 ? fallbackSpan : span;

  return [domain[0] - safeSpan * normalized.start, domain[1] + safeSpan * normalized.end];
};

export const ensureNumericDomain = (domain: NumericDomain): NumericDomain => {
  if (domain[0] === domain[1]) {
    const delta = Math.abs(domain[0]) || 1;
    return [domain[0] - delta, domain[1] + delta];
  }

  return domain;
};

export const inferNumericDomain = <TDatum>({
  data,
  accessor,
  domain,
  padding,
}: ContinuousDomainOptions<TDatum, number>): NumericDomain => {
  if (domain) {
    return ensureNumericDomain(applyNumericPadding(domain, padding));
  }

  const read = normalizeAccessor(accessor);
  const values = data.map((datum, index) => read(datum, index)).filter(isValidNumber);
  const inferred = extent(values);
  const nextDomain: NumericDomain = [inferred[0] ?? 0, inferred[1] ?? 1];

  return ensureNumericDomain(applyNumericPadding(nextDomain, padding));
};

export const inferTimeDomain = <TDatum>({
  data,
  accessor,
  domain,
  padding,
}: ContinuousDomainOptions<TDatum, Date>): TimeDomain => {
  if (domain) {
    const padded = applyNumericPadding([domain[0].getTime(), domain[1].getTime()], padding);
    const ensured = ensureNumericDomain(padded);
    return [new Date(ensured[0]), new Date(ensured[1])];
  }

  const read = normalizeAccessor(accessor);
  const values = data
    .map((datum, index) => read(datum, index))
    .filter(isValidDate)
    .map((date) => date.getTime());
  const inferred = extent(values);
  const padded = applyNumericPadding([inferred[0] ?? 0, inferred[1] ?? 1], padding);
  const ensured = ensureNumericDomain(padded);

  return [new Date(ensured[0]), new Date(ensured[1])];
};

export const inferCategoricalDomain = <TDatum>(
  data: readonly TDatum[],
  accessor: DataAccessor<TDatum, string | number | Date | null | undefined>,
  explicitDomain?: readonly string[],
): CategoricalDomain => {
  if (explicitDomain) {
    return [...explicitDomain];
  }

  const read = normalizeAccessor(accessor);
  const seen = new Set<string>();

  for (const [index, datum] of data.entries()) {
    const value = read(datum, index);
    if (value == null) {
      continue;
    }

    seen.add(value instanceof Date ? value.toISOString() : String(value));
  }

  return [...seen];
};

export const includeZero = (domain: NumericDomain): NumericDomain => [
  min([domain[0], 0]) ?? 0,
  max([domain[1], 0]) ?? 0,
];
