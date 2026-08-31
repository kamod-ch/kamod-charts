import { animateNumber } from "@kamod-ch/motion/value";
import { useLayoutEffect, useRef, useState } from "preact/hooks";
import type { EasingFn } from "./easing";

export type TransitionPhase = "enter" | "update" | "exit";

export interface Identified {
  key: string;
}

export interface UseKeyedTransitionOptions<T extends Identified> {
  enabled: boolean;
  reducedMotion: boolean;
  duration: number;
  ease: EasingFn;
  targetKey: string;
  skipEnter?: boolean;
  enterOrigin?: (item: T) => T;
  exitTarget?: (item: T) => T;
  interpolate: (from: T, to: T, t: number) => T;
}

export type Transitioning<T extends Identified> = T & { phase: TransitionPhase };

interface TransitionFrame<T extends Identified> {
  from: Map<string, T>;
  to: Map<string, T>;
  phases: Map<string, TransitionPhase>;
}

const mapByKey = <T extends Identified>(items: readonly T[]): Map<string, T> =>
  new Map(items.map((item) => [item.key, item]));

const updatePhases = <T extends Identified>(items: readonly T[]): Map<string, TransitionPhase> =>
  new Map(items.map((item) => [item.key, "update" as const]));

export const useKeyedTransition = <T extends Identified>(
  items: readonly T[],
  options: UseKeyedTransitionOptions<T>,
): Transitioning<T>[] => {
  const {
    enabled,
    reducedMotion,
    duration,
    ease,
    targetKey,
    skipEnter = false,
    enterOrigin = (item) => item,
    exitTarget = (item) => item,
    interpolate,
  } = options;

  const [progress, setProgress] = useState(1);
  const mounted = useRef(false);
  const displayedRef = useRef<T[]>([...items]);
  const frameRef = useRef<TransitionFrame<T>>({
    from: mapByKey(items),
    to: mapByKey(items),
    phases: updatePhases(items),
  });
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const itemsRef = useRef(items);
  const enterOriginRef = useRef(enterOrigin);
  const exitTargetRef = useRef(exitTarget);
  itemsRef.current = items;
  enterOriginRef.current = enterOrigin;
  exitTargetRef.current = exitTarget;

  useLayoutEffect(() => {
    const currentItems = itemsRef.current;
    const previous = mapByKey(displayedRef.current);
    const next = mapByKey(currentItems);
    const isFirst = !mounted.current;
    mounted.current = true;

    const skip = !enabled || reducedMotion || (isFirst && skipEnter);
    if (skip) {
      frameRef.current = { from: next, to: next, phases: updatePhases(currentItems) };
      displayedRef.current = [...currentItems];
      setProgress(1);
      return;
    }

    const from = new Map<string, T>();
    const to = new Map<string, T>();
    const phases = new Map<string, TransitionPhase>();

    for (const item of currentItems) {
      const prev = previous.get(item.key);
      from.set(item.key, prev ?? enterOriginRef.current(item));
      to.set(item.key, item);
      phases.set(item.key, prev ? "update" : "enter");
    }

    for (const [key, prev] of previous) {
      if (!next.has(key)) {
        from.set(key, prev);
        to.set(key, exitTargetRef.current(prev));
        phases.set(key, "exit");
      }
    }

    frameRef.current = { from, to, phases };
    setProgress(0);
    controlsRef.current?.stop();

    const controls = animateNumber({
      from: 0,
      to: 1,
      duration,
      ease,
      onUpdate: (value) => {
        setProgress(value);
      },
      onComplete: () => {
        const settled = itemsRef.current;
        frameRef.current = {
          from: mapByKey(settled),
          to: mapByKey(settled),
          phases: updatePhases(settled),
        };
        displayedRef.current = [...settled];
        setProgress(1);
      },
    });
    void controls.finished.catch(() => undefined);
    controlsRef.current = controls;

    return () => {
      controls.stop();
    };
  }, [duration, ease, enabled, reducedMotion, skipEnter, targetKey]);

  useLayoutEffect(
    () => () => {
      controlsRef.current?.stop();
    },
    [],
  );

  const { from, to, phases } = frameRef.current;
  const result: Transitioning<T>[] = [];

  for (const [key, start] of from) {
    const end = to.get(key) ?? start;
    const interpolated = interpolate(start, end, progress);
    result.push({ ...interpolated, phase: phases.get(key) ?? "update" });
  }

  displayedRef.current = result;
  return result;
};
