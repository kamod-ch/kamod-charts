import { C as CartesianPoint } from '../cartesian-DicNh8__.js';
export { a as CartesianScaleOptions, i as inferCombinedNumericDomain } from '../cartesian-DicNh8__.js';
export { A as AreaFill, a as AreaGradientDirection, b as AreaGradientFill, L as LineCurve } from '../paths-iUYISIqv.js';
import { g as StackSeries, m as StackedValue } from '../stacked-line-series-CE_szv4m.js';
export { A as AreaSeries, a as AreaSeriesProps, B as BarSeries, b as BarSeriesProps, L as LineSeries, c as LineSeriesProps, P as PieDatum, d as PieSeries, e as PieSeriesProps, S as ScatterSeries, f as ScatterSeriesProps, h as StackedAreaSeries, i as StackedAreaSeriesProps, j as StackedLineSeries, k as StackedLineSeriesEntry, l as StackedLineSeriesProps, n as getStackedValues, o as inferGroupedDomain, p as inferStackedDomain } from '../stacked-line-series-CE_szv4m.js';
import { D as DataAccessor } from '../types-Doyfwbln.js';
import { A as AxisScale } from '../ticks-CmQrA2Ry.js';
import '../domain-BtgmU7rB.js';
import 'd3-shape';
import 'preact';
import 'd3-scale';

declare const stackedLayerToCartesianPoints: <TDatum>(layer: readonly StackedValue<TDatum>[], valueKey: DataAccessor<TDatum, number | null | undefined>, xScale: AxisScale, yScale: AxisScale, xKey: DataAccessor<TDatum, string | number | Date | null | undefined> | undefined, connectNulls: boolean) => CartesianPoint<TDatum>[];
declare const getStackedSeriesValueAt: <TDatum>(data: readonly TDatum[], series: readonly StackSeries<TDatum>[], seriesId: string, index: number) => StackedValue<TDatum> | null;

export { CartesianPoint, StackSeries, StackedValue, getStackedSeriesValueAt, stackedLayerToCartesianPoints };
