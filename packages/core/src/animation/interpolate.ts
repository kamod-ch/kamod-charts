import { interpolateNumber, interpolateString } from "d3-interpolate";

export const interpolateValue = (
  from: number | string,
  to: number | string,
  t: number,
): number | string => {
  const clamped = Math.min(Math.max(t, 0), 1);

  if (typeof from === "number" && typeof to === "number") {
    return interpolateNumber(from, to)(clamped);
  }

  return interpolateString(String(from), String(to))(clamped);
};
