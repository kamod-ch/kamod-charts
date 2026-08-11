import { D as DataAccessor } from '../types-CzGslxWS.js';
import { S as ScaleKind, D as DomainPadding } from '../domain-COQUkiLk.js';
import { ScaleLinear, ScaleTime, ScaleBand, ScalePoint } from 'd3-scale';
import * as preact from 'preact';

type AxisScale = ScaleLinear<number, number, never> | ScaleTime<number, number, never> | ScaleBand<string> | ScalePoint<string>;
type AxisTickValue = string | number | Date;
interface AxisTick<TValue extends AxisTickValue = AxisTickValue> {
    value: TValue;
    position: number;
    label: string;
}
declare const getScalePosition: (scale: AxisScale, value: AxisTickValue) => number | undefined;
declare const getTicks: (scale: AxisScale, tickCount?: number) => AxisTickValue[];

interface AxisScaleOptions<TDatum> {
    dataKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
    scale?: ScaleKind;
    domain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
    padding?: number | DomainPadding;
    nice?: boolean | number;
    tickCount?: number;
    orientation: "x" | "y";
}
declare const useAxisScale: <TDatum>({ dataKey, scale, domain, padding, nice, orientation, }: AxisScaleOptions<TDatum>) => AxisScale;

type TickValue = string | number | Date;
type TickFormatter<TValue extends TickValue = TickValue> = (value: TValue, index: number) => string;
interface TickFormatOptions<TValue extends TickValue = TickValue> {
    formatter?: TickFormatter<TValue>;
    formatSpecifier?: string;
}
declare const formatTick: <TValue extends TickValue>(value: TValue, index: number, options?: TickFormatOptions<TValue>) => string;

interface XAxisProps<TDatum> {
    dataKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
    scale?: ScaleKind;
    domain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
    padding?: number | DomainPadding;
    nice?: boolean | number;
    tickCount?: number;
    tickFormatter?: TickFormatter;
    formatSpecifier?: string;
    label?: string;
    tickRotation?: number;
    class?: string;
}
declare const XAxis: <TDatum>({ dataKey, scale, domain, padding, nice, tickCount, tickFormatter, formatSpecifier, label, tickRotation, class: className, }: XAxisProps<TDatum>) => preact.JSX.Element;

interface YAxisProps<TDatum> {
    dataKey?: DataAccessor<TDatum, number | Date | null | undefined>;
    scale?: "linear" | "time";
    domain?: readonly [number, number] | readonly [Date, Date];
    padding?: number | DomainPadding;
    nice?: boolean | number;
    tickCount?: number;
    tickFormatter?: TickFormatter;
    formatSpecifier?: string;
    label?: string;
    class?: string;
}
declare const YAxis: <TDatum>({ dataKey, scale, domain, padding, nice, tickCount, tickFormatter, formatSpecifier, label, class: className, }: YAxisProps<TDatum>) => preact.JSX.Element;

export { type AxisScale, type AxisScaleOptions, type AxisTick, type AxisTickValue, type TickFormatOptions, type TickFormatter, type TickValue, XAxis, type XAxisProps, YAxis, type YAxisProps, formatTick, getScalePosition, getTicks, useAxisScale };
