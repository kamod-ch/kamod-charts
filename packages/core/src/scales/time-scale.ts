import { scaleTime, type ScaleTime } from "d3-scale";
import type { TimeDomain } from "./domain";

export interface TimeScaleOptions {
  domain: TimeDomain;
  range: readonly [number, number];
  nice?: boolean | number;
  clamp?: boolean;
}

export type TimeChartScale = ScaleTime<number, number, never>;

export const createTimeScale = ({
  domain,
  range,
  nice,
  clamp = false,
}: TimeScaleOptions): TimeChartScale => {
  const scale = scaleTime()
    .domain([...domain])
    .range([...range])
    .clamp(clamp);

  if (nice) {
    if (typeof nice === "number") {
      scale.nice(nice);
    } else {
      scale.nice();
    }
  }

  return scale;
};
