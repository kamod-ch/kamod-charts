import type { CartesianSeriesConfig } from "./types";

export const getSeriesId = <TDatum>(
  entry: CartesianSeriesConfig<TDatum>,
  index: number,
): string => {
  if (entry.id) {
    return entry.id;
  }

  if (typeof entry.key === "string" || typeof entry.key === "number") {
    return String(entry.key);
  }

  return `series-${index}`;
};
