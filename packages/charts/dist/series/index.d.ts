export { C as CartesianPoint, a as CartesianScaleOptions, i as inferCombinedNumericDomain } from '../cartesian-D9x2nTtt.js';
import * as preact from 'preact';
import { ComponentChildren } from 'preact';
import { D as DataAccessor } from '../types-CzGslxWS.js';
import { S as ScaleKind, N as NumericDomain } from '../domain-COQUkiLk.js';
import { L as LineCurve } from '../line-series-BY85caZx.js';
export { a as LineSeries, b as LineSeriesProps } from '../line-series-BY85caZx.js';
import 'd3-shape';

interface AreaSeriesProps<TDatum> {
    dataKey: DataAccessor<TDatum, number | null | undefined>;
    xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
    xScale?: ScaleKind;
    xDomain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
    yDomain?: readonly [number, number];
    baseline?: number;
    id?: string;
    color?: string;
    opacity?: number;
    curve?: LineCurve;
    outline?: boolean;
    class?: string;
}
declare const AreaSeries: <TDatum>({ dataKey, xKey, xScale, xDomain, yDomain, baseline, id, color, opacity, curve, outline, class: className, }: AreaSeriesProps<TDatum>) => preact.JSX.Element;

interface BarSeriesProps<TDatum> {
    dataKey: DataAccessor<TDatum, number | null | undefined>;
    xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
    yDomain?: readonly [number, number];
    id?: string;
    color?: string;
    radius?: number;
    minBarSize?: number;
    horizontal?: boolean;
    class?: string;
    onBarClick?: (datum: TDatum, index: number, value: number) => void;
}
declare const BarSeries: <TDatum>({ dataKey, xKey, yDomain, id, color, radius, minBarSize, horizontal, class: className, onBarClick, }: BarSeriesProps<TDatum>) => preact.JSX.Element;

interface PieDatum<TDatum> {
    datum: TDatum;
    index: number;
    label: string;
    value: number;
    color: string;
}
interface PieSeriesProps<TDatum> {
    valueKey: DataAccessor<TDatum, number | null | undefined>;
    labelKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
    innerRadius?: number;
    outerRadius?: number;
    padAngle?: number;
    cornerRadius?: number;
    sort?: boolean | ((a: PieDatum<TDatum>, b: PieDatum<TDatum>) => number);
    activeIndex?: number | null;
    activeOffset?: number;
    colors?: readonly string[];
    labelPosition?: "none" | "inside" | "outside";
    centerContent?: ComponentChildren;
    class?: string;
    onSegmentClick?: (datum: TDatum, index: number, value: number) => void;
}
declare const PieSeries: <TDatum>({ valueKey, labelKey, innerRadius, outerRadius, padAngle, cornerRadius, sort, activeIndex, activeOffset, colors, labelPosition, centerContent, class: className, onSegmentClick, }: PieSeriesProps<TDatum>) => preact.JSX.Element;

interface ScatterSeriesProps<TDatum> {
    yKey: DataAccessor<TDatum, number | null | undefined>;
    xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
    xScale?: ScaleKind;
    xDomain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
    yDomain?: readonly [number, number];
    id?: string;
    color?: string | ((datum: TDatum, index: number) => string);
    size?: number | ((datum: TDatum, index: number) => number);
    activeIndex?: number | null;
    class?: string;
}
declare const ScatterSeries: <TDatum>({ yKey, xKey, xScale, xDomain, yDomain, id, color, size, activeIndex, class: className, }: ScatterSeriesProps<TDatum>) => preact.JSX.Element;

interface StackSeries<TDatum> {
    id: string;
    value: DataAccessor<TDatum, number | null | undefined>;
}
interface StackedValue<TDatum> {
    datum: TDatum;
    index: number;
    seriesId: string;
    value: number;
    y0: number;
    y1: number;
}
declare const getStackedValues: <TDatum>(data: readonly TDatum[], series: readonly StackSeries<TDatum>[]) => StackedValue<TDatum>[][];
declare const inferStackedDomain: <TDatum>(data: readonly TDatum[], series: readonly StackSeries<TDatum>[]) => NumericDomain;
declare const inferGroupedDomain: <TDatum>(data: readonly TDatum[], series: readonly StackSeries<TDatum>[]) => NumericDomain;

interface StackedAreaSeriesProps<TDatum> {
    series: readonly (StackSeries<TDatum> & {
        color?: string;
    })[];
    xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
    xScale?: ScaleKind;
    yDomain: readonly [number, number];
    opacity?: number;
}
declare const StackedAreaSeries: <TDatum>({ series, xKey, xScale, yDomain, opacity, }: StackedAreaSeriesProps<TDatum>) => preact.JSX.Element;

export { AreaSeries, type AreaSeriesProps, BarSeries, type BarSeriesProps, LineCurve, type PieDatum, PieSeries, type PieSeriesProps, ScatterSeries, type ScatterSeriesProps, type StackSeries, StackedAreaSeries, type StackedAreaSeriesProps, type StackedValue, getStackedValues, inferGroupedDomain, inferStackedDomain };
