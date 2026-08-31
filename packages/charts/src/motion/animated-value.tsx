import { useAnimateNumber } from "@kamod-ch/motion/value";
import type { ChartAnimate } from "../animation";
import { easingFn } from "./easing";
import { useMotionSuppressed, useResolvedAnimate } from "./resolve";

const numberFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 });

export interface AnimatedValueProps {
  value: number | null;
  animate?: ChartAnimate;
  format?: (value: number) => string;
}

export const AnimatedValue = ({ value, animate, format }: AnimatedValueProps) => {
  const resolved = useResolvedAnimate(animate);
  const suppressed = useMotionSuppressed(resolved);
  const target = value ?? 0;
  const displayed = useAnimateNumber(target, {
    duration: resolved.duration,
    ease: easingFn(resolved.easing),
    reducedMotion: suppressed ? "always" : "never",
  });

  if (value == null || !Number.isFinite(value)) {
    return <span data-kamod-chart-animated-value="">–</span>;
  }

  const label = format ? format(suppressed ? value : displayed) : numberFormatter.format(displayed);

  return (
    <span data-kamod-chart-animated-value="" aria-hidden="true">
      {label}
    </span>
  );
};
