export type ChartReducedMotionPolicy = "user" | "always" | "never";
export type ChartMotionEasing = "easeOut" | "easeInOut" | "linear";
export type ChartMotionPreset = "default";

export interface ChartAnimateOptions {
  enabled?: boolean;
  /** Duration in seconds. Matches `@kamod-ch/motion`. @default 0.35 */
  duration?: number;
  easing?: ChartMotionEasing;
  preset?: ChartMotionPreset;
  reducedMotion?: ChartReducedMotionPolicy;
}

export type ChartAnimate = boolean | ChartAnimateOptions;

export interface ResolvedChartAnimate {
  enabled: boolean;
  duration: number;
  easing: ChartMotionEasing;
  preset: ChartMotionPreset;
  reducedMotion: ChartReducedMotionPolicy;
}
