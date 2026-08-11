import { ScaleBand, ScaleLinear, ScalePoint, ScaleTime } from 'd3-scale';
import { N as NumericDomain, T as TimeDomain } from '../domain-COQUkiLk.js';
export { C as CategoricalDomain, a as ContinuousDomain, b as ContinuousDomainOptions, c as ContinuousDomainValue, D as DomainPadding, S as ScaleKind, e as ensureNumericDomain, i as includeZero, d as inferCategoricalDomain, f as inferNumericDomain, g as inferTimeDomain, t as toNumber } from '../domain-COQUkiLk.js';
import '../types-CzGslxWS.js';
import 'preact';

interface BandScaleOptions {
    domain: readonly string[];
    range: readonly [number, number];
    paddingInner?: number;
    paddingOuter?: number;
    align?: number;
    round?: boolean;
}
type BandChartScale = ScaleBand<string>;
declare const createBandScale: ({ domain, range, paddingInner, paddingOuter, align, round, }: BandScaleOptions) => BandChartScale;

interface LinearScaleOptions {
    domain: NumericDomain;
    range: readonly [number, number];
    nice?: boolean | number;
    clamp?: boolean;
}
type LinearChartScale = ScaleLinear<number, number, never>;
declare const createLinearScale: ({ domain, range, nice, clamp, }: LinearScaleOptions) => LinearChartScale;

interface PointScaleOptions {
    domain: readonly string[];
    range: readonly [number, number];
    padding?: number;
    align?: number;
    round?: boolean;
}
type PointChartScale = ScalePoint<string>;
declare const createPointScale: ({ domain, range, padding, align, round, }: PointScaleOptions) => PointChartScale;

interface TimeScaleOptions {
    domain: TimeDomain;
    range: readonly [number, number];
    nice?: boolean | number;
    clamp?: boolean;
}
type TimeChartScale = ScaleTime<number, number, never>;
declare const createTimeScale: ({ domain, range, nice, clamp, }: TimeScaleOptions) => TimeChartScale;

export { type BandChartScale, type BandScaleOptions, type LinearChartScale, type LinearScaleOptions, NumericDomain, type PointChartScale, type PointScaleOptions, type TimeChartScale, TimeDomain, type TimeScaleOptions, createBandScale, createLinearScale, createPointScale, createTimeScale };
