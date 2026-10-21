import { D as DataAccessor } from '../types-rFU8suko.js';
import { S as ScaleKind, D as DomainPadding } from '../domain-C6g4S_9B.js';
import { A as AxisScale } from '../ticks-CmQrA2Ry.js';
export { a as AxisTick, b as AxisTickValue, g as getScalePosition, c as getTicks } from '../ticks-CmQrA2Ry.js';
import * as preact from 'preact';
import { T as TickCollisionOptions } from '../tick-collision-BZO-dBiF.js';
export { P as PreparedAxisTick, a as TickCollisionStrategy, e as estimateTickLabelWidth, p as prepareAxisTicks, t as truncateTickLabel } from '../tick-collision-BZO-dBiF.js';
import 'd3-scale';

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
/** SI-style compact labels (e.g. 52k) when magnitudes exceed typical left-margin width. */
declare const inferNumericTickFormatSpecifier: (domain: readonly [number, number]) => string | undefined;
declare const formatTick: <TValue extends TickValue>(value: TValue, index: number, options?: TickFormatOptions<TValue>) => string;

interface XAxisProps<TDatum> extends TickCollisionOptions {
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
declare const XAxis: <TDatum>({ dataKey, scale, domain, padding, nice, tickCount, tickFormatter, formatSpecifier, label, tickRotation, tickCollision, maxTickLabelLength, maxTickLabelWidth, class: className, }: XAxisProps<TDatum>) => preact.JSX.Element;

interface YAxisProps<TDatum> extends TickCollisionOptions {
    dataKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
    scale?: ScaleKind;
    domain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
    padding?: number | DomainPadding;
    nice?: boolean | number;
    tickCount?: number;
    tickFormatter?: TickFormatter;
    formatSpecifier?: string;
    label?: string;
    class?: string;
}
declare const YAxis: <TDatum>({ dataKey, scale, domain, padding, nice, tickCount, tickFormatter, formatSpecifier, label, tickCollision, maxTickLabelLength, maxTickLabelWidth, class: className, }: YAxisProps<TDatum>) => preact.JSX.Element;

export { AxisScale, type AxisScaleOptions, TickCollisionOptions, type TickFormatOptions, type TickFormatter, type TickValue, XAxis, type XAxisProps, YAxis, type YAxisProps, formatTick, inferNumericTickFormatSpecifier, useAxisScale };
