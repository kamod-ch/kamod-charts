import type { DataAccessor } from "./types";

export type NormalizedAccessor<TDatum, TValue> = (datum: TDatum, index: number) => TValue;

export const normalizeAccessor = <TDatum, TValue>(
  accessor: DataAccessor<TDatum, TValue>,
): NormalizedAccessor<TDatum, TValue> => {
  if (typeof accessor === "function") {
    return accessor as NormalizedAccessor<TDatum, TValue>;
  }

  return (datum: TDatum) => datum[accessor as keyof TDatum] as TValue;
};

export const readAccessor = <TDatum, TValue>(
  datum: TDatum,
  index: number,
  accessor: DataAccessor<TDatum, TValue>,
): TValue => normalizeAccessor(accessor)(datum, index);
