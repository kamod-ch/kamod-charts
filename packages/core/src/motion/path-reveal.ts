import { useAnimateSvg } from "@kamod-ch/motion/svg";
import { useLayoutEffect, useRef } from "preact/hooks";
import type { ChartMotionEasing } from "../animation";
import { cssEasing } from "./easing";

export const usePathReveal = <T extends SVGGeometryElement>({
  enabled,
  reducedMotion,
  duration,
  easing,
  path,
}: {
  enabled: boolean;
  reducedMotion: boolean;
  duration: number;
  easing: ChartMotionEasing;
  path: string;
}) => {
  const { ref, animate } = useAnimateSvg<T>({
    reducedMotion: "never",
    onConflict: "stop",
  });
  const revealed = useRef(false);

  useLayoutEffect(() => {
    if (!enabled || reducedMotion || revealed.current || path.length === 0) {
      return;
    }

    revealed.current = true;
    animate({ pathLength: [0, 1] }, { duration, ease: cssEasing(easing) as never });
  }, [animate, duration, easing, enabled, path, reducedMotion]);

  useLayoutEffect(
    () => () => {
      revealed.current = false;
    },
    [],
  );

  return ref;
};
