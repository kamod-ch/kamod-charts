declare const interpolateValue: (from: number | string, to: number | string, t: number) => number | string;

declare const prefersReducedMotion: () => boolean;
declare const useReducedMotion: () => boolean;

interface TransitionOptions {
    duration?: number;
    disabled?: boolean;
    reducedMotion?: boolean;
}
declare const shouldAnimate: ({ duration, disabled, reducedMotion, }?: TransitionOptions) => boolean;

export { type TransitionOptions, interpolateValue, prefersReducedMotion, shouldAnimate, useReducedMotion };
