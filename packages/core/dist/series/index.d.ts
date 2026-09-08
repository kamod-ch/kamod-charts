import { C as CartesianPoint } from '../cartesian-DicNh8__.js';
export { a as CartesianScaleOptions, i as inferCombinedNumericDomain } from '../cartesian-DicNh8__.js';
export { a as AreaFill, b as AreaGradientDirection, c as AreaGradientFill, p as LineCurve } from '../types-ma1QyXzC.js';
import { g as StackSeries, m as StackedValue } from '../stacked-line-series-N_dnTJSH.js';
export { A as AreaSeries, a as AreaSeriesProps, B as BarSeries, b as BarSeriesProps, L as LineSeries, c as LineSeriesProps, P as PieDatum, d as PieSeries, e as PieSeriesProps, S as ScatterSeries, f as ScatterSeriesProps, h as StackedAreaSeries, i as StackedAreaSeriesProps, j as StackedLineSeries, k as StackedLineSeriesEntry, l as StackedLineSeriesProps, n as getStackedValues, o as inferGroupedDomain, p as inferStackedDomain } from '../stacked-line-series-N_dnTJSH.js';
import { D as DataAccessor } from '../types-Doyfwbln.js';
import { A as AxisScale } from '../ticks-CmQrA2Ry.js';
import '../domain-BtgmU7rB.js';
import 'preact';
import '../types-vhy5Wa3f.js';
import '../tooltip-placement-DZrqa8Zt.js';
import 'd3-shape';
import 'd3-scale';

declare const stackedLayerToCartesianPoints: <TDatum>(layer: readonly StackedValue<TDatum>[], valueKey: DataAccessor<TDatum, number | null | undefined>, xScale: AxisScale, yScale: AxisScale, xKey: DataAccessor<TDatum, string | number | Date | null | undefined> | undefined, connectNulls: boolean) => CartesianPoint<TDatum>[];
declare const getStackedSeriesValueAt: <TDatum>(data: readonly TDatum[], series: readonly StackSeries<TDatum>[], seriesId: string, index: number) => StackedValue<TDatum> | null;

export { CartesianPoint, StackSeries, StackedValue, getStackedSeriesValueAt, stackedLayerToCartesianPoints };
