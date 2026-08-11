import { D as DataAccessor } from './types-CzGslxWS.js';

type ScaleKind = "linear" | "time" | "band" | "point";
type ContinuousDomainValue = number | Date;
type ContinuousDomain = readonly [ContinuousDomainValue, ContinuousDomainValue];
type NumericDomain = readonly [number, number];
type TimeDomain = readonly [Date, Date];
type CategoricalDomain = readonly string[];
interface DomainPadding {
    start?: number;
    end?: number;
}
interface ContinuousDomainOptions<TDatum, TValue extends ContinuousDomainValue> {
    data: readonly TDatum[];
    accessor: DataAccessor<TDatum, TValue | null | undefined>;
    domain?: readonly [TValue, TValue];
    padding?: number | DomainPadding;
}
declare const toNumber: (value: number | Date) => number;
declare const ensureNumericDomain: (domain: NumericDomain) => NumericDomain;
declare const inferNumericDomain: <TDatum>({ data, accessor, domain, padding, }: ContinuousDomainOptions<TDatum, number>) => NumericDomain;
declare const inferTimeDomain: <TDatum>({ data, accessor, domain, padding, }: ContinuousDomainOptions<TDatum, Date>) => TimeDomain;
declare const inferCategoricalDomain: <TDatum>(data: readonly TDatum[], accessor: DataAccessor<TDatum, string | number | Date | null | undefined>, explicitDomain?: readonly string[]) => CategoricalDomain;
declare const includeZero: (domain: NumericDomain) => NumericDomain;

export { type CategoricalDomain as C, type DomainPadding as D, type NumericDomain as N, type ScaleKind as S, type TimeDomain as T, type ContinuousDomain as a, type ContinuousDomainOptions as b, type ContinuousDomainValue as c, inferCategoricalDomain as d, ensureNumericDomain as e, inferNumericDomain as f, inferTimeDomain as g, includeZero as i, toNumber as t };
