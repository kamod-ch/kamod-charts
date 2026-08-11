import { D as DataAccessor } from './types-CzGslxWS.js';
import { S as ScaleKind, N as NumericDomain } from './domain-COQUkiLk.js';

interface CartesianScaleOptions<TDatum> {
    xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
    yKey: DataAccessor<TDatum, number | null | undefined>;
    xScale?: ScaleKind;
    xDomain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
    yDomain?: readonly [number, number];
    nice?: boolean | number;
}
interface CartesianPoint<TDatum> {
    datum: TDatum;
    index: number;
    xValue: string | number | Date | null | undefined;
    yValue: number | null | undefined;
    x: number | null;
    y: number | null;
    defined: boolean;
}
declare const inferCombinedNumericDomain: <TDatum>(data: readonly TDatum[], accessors: readonly DataAccessor<TDatum, number | null | undefined>[]) => NumericDomain;

export { type CartesianPoint as C, type CartesianScaleOptions as a, inferCombinedNumericDomain as i };
