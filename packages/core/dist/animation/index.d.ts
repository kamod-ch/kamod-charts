import { R as ResolvedChartAnimate, C as ChartAnimate, a as ChartAnimateOptions } from '../types-vhy5Wa3f.js';
export { b as ChartMotionEasing, c as ChartMotionPreset, d as ChartReducedMotionPolicy } from '../types-vhy5Wa3f.js';

declare const interpolateValue: (from: number | string, to: number | string, t: number) => number | string;

declare const domainKey: (value: string | number | Date | null | undefined, index: number) => string;
declare const uniquifyKeys: (keys: readonly string[]) => string[];
declare const pointKey: (seriesId: string, xValue: string | number | Date | null | undefined, index: number, yValue?: number | null) => string;
declare const barKey: (seriesId: string, category: string) => string;
declare const sliceKey: (label: string, index: number) => string;

declare const prefersReducedMotion: () => boolean;
declare const useReducedMotion: () => boolean;

declare const defaultChartAnimate: ResolvedChartAnimate;
declare const resolveChartAnimate: (animate: ChartAnimate | undefined, defaults: ChartAnimateOptions | undefined, motionPresent: boolean) => ResolvedChartAnimate;

interface TransitionOptions {
    duration?: number;
    disabled?: boolean;
    reducedMotion?: boolean;
}
declare const shouldAnimate: ({ duration, disabled, reducedMotion, }?: TransitionOptions) => boolean;

export { ChartAnimate, ChartAnimateOptions, ResolvedChartAnimate, barKey, defaultChartAnimate, domainKey, interpolateValue, pointKey, prefersReducedMotion, resolveChartAnimate, shouldAnimate, sliceKey, uniquifyKeys, useReducedMotion };
export type { TransitionOptions };
