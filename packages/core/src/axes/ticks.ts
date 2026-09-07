import type { ScaleBand, ScaleLinear, ScalePoint, ScaleTime } from "d3-scale";

export type AxisScale =
  | ScaleLinear<number, number, never>
  | ScaleTime<number, number, never>
  | ScaleBand<string>
  | ScalePoint<string>;

export type AxisTickValue = string | number | Date;

export interface AxisTick<TValue extends AxisTickValue = AxisTickValue> {
  value: TValue;
  position: number;
  label: string;
}

const isBandScale = (scale: AxisScale): scale is ScaleBand<string> => "bandwidth" in scale;
const isCategoricalScale = (scale: AxisScale): scale is ScaleBand<string> | ScalePoint<string> =>
  "domain" in scale && typeof scale.domain()[0] === "string";

export const getScalePosition = (scale: AxisScale, value: AxisTickValue): number | undefined => {
  if (value instanceof Date) {
    return (scale as ScaleTime<number, number, never>)(value);
  }

  if (typeof value === "number") {
    return (scale as ScaleLinear<number, number, never>)(value);
  }

  const position = (scale as ScaleBand<string> | ScalePoint<string>)(value);
  if (position == null) {
    return undefined;
  }

  return isBandScale(scale) ? position + scale.bandwidth() / 2 : position;
};

export const getTicks = (scale: AxisScale, tickCount = 5): AxisTickValue[] => {
  if (isCategoricalScale(scale)) {
    return scale.domain();
  }

  if ("ticks" in scale) {
    return scale.ticks(tickCount);
  }

  return [];
};
