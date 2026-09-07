import { scalePoint, type ScalePoint } from "d3-scale";

export interface PointScaleOptions {
  domain: readonly string[];
  range: readonly [number, number];
  padding?: number;
  align?: number;
  round?: boolean;
}

export type PointChartScale = ScalePoint<string>;

export const createPointScale = ({
  domain,
  range,
  padding = 0.5,
  align = 0.5,
  round = false,
}: PointScaleOptions): PointChartScale =>
  scalePoint<string>()
    .domain([...domain])
    .range([...range])
    .padding(padding)
    .align(align)
    .round(round);
