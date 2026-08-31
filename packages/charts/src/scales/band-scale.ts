import { scaleBand, type ScaleBand } from "d3-scale";

export interface BandScaleOptions {
  domain: readonly string[];
  range: readonly [number, number];
  paddingInner?: number;
  paddingOuter?: number;
  align?: number;
  round?: boolean;
}

export type BandChartScale = ScaleBand<string>;

export const createBandScale = ({
  domain,
  range,
  paddingInner = 0.2,
  paddingOuter = 0.05,
  align = 0.5,
  round = false,
}: BandScaleOptions): BandChartScale =>
  scaleBand<string>()
    .domain([...domain])
    .range([...range])
    .paddingInner(paddingInner)
    .paddingOuter(paddingOuter)
    .align(align)
    .round(round);
