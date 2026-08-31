import type { ChartMotionEasing } from "../animation";

export type EasingFn = (t: number) => number;

export const linear: EasingFn = (t) => t;

export const easeOutCubic: EasingFn = (t) => 1 - (1 - t) ** 3;

export const easeInOutCubic: EasingFn = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

export const easingFn = (easing: ChartMotionEasing): EasingFn => {
  if (easing === "linear") {
    return linear;
  }

  if (easing === "easeInOut") {
    return easeInOutCubic;
  }

  return easeOutCubic;
};

export const cssEasing = (easing: ChartMotionEasing): string => {
  if (easing === "linear") {
    return "linear";
  }

  if (easing === "easeInOut") {
    return "ease-in-out";
  }

  return "ease-out";
};
