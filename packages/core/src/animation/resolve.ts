import type { ChartAnimate, ChartAnimateOptions, ResolvedChartAnimate } from "./types";

export const defaultChartAnimate: ResolvedChartAnimate = {
  enabled: true,
  duration: 0.35,
  easing: "easeOut",
  preset: "default",
  reducedMotion: "user",
};

export const resolveChartAnimate = (
  animate: ChartAnimate | undefined,
  defaults: ChartAnimateOptions = {},
  motionPresent: boolean,
): ResolvedChartAnimate => {
  if (!motionPresent || animate === false) {
    return { ...defaultChartAnimate, enabled: false };
  }

  const options = typeof animate === "object" ? animate : {};
  if (animate === undefined && defaults.enabled === false) {
    return { ...defaultChartAnimate, ...defaults, enabled: false };
  }

  const enabled = options.enabled ?? defaults.enabled ?? true;
  if (!enabled) {
    return { ...defaultChartAnimate, ...defaults, ...options, enabled: false };
  }

  return {
    enabled: true,
    duration: options.duration ?? defaults.duration ?? defaultChartAnimate.duration,
    easing: options.easing ?? defaults.easing ?? defaultChartAnimate.easing,
    preset: options.preset ?? defaults.preset ?? defaultChartAnimate.preset,
    reducedMotion:
      options.reducedMotion ?? defaults.reducedMotion ?? defaultChartAnimate.reducedMotion,
  };
};
