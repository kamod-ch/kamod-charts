import { scaleLinear, type ScaleLinear } from "d3-scale";
import type { NumericDomain } from "./domain";

export interface LinearScaleOptions {
  domain: NumericDomain;
  range: readonly [number, number];
  nice?: boolean | number;
  clamp?: boolean;
}

export type LinearChartScale = ScaleLinear<number, number, never>;

export const createLinearScale = ({
  domain,
  range,
  nice,
  clamp = false,
}: LinearScaleOptions): LinearChartScale => {
  const scale = scaleLinear()
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
