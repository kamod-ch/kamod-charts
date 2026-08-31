import { useReducedMotion } from "@kamod-ch/motion/hooks/use-reduced-motion";
import { resolveChartAnimate } from "../animation";
import { useChartMotionContext } from "../animation/slots";
import type { ChartAnimate, ResolvedChartAnimate } from "../animation";

export const useResolvedAnimate = (animate?: ChartAnimate): ResolvedChartAnimate => {
  const motion = useChartMotionContext();
  return resolveChartAnimate(animate, motion.defaults, motion.present);
};

export const useMotionSuppressed = (resolved: ResolvedChartAnimate): boolean => {
  const userReduced = useReducedMotion({ policy: resolved.reducedMotion });
  return !resolved.enabled || userReduced || !resolved.duration;
};
