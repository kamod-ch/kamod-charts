import type { ChartCartesianScaleKind, DataAccessor } from "../core";
import { normalizeAccessor } from "../core";

const toTimestamp = (value: string | number | Date | null | undefined): number | null => {
  if (value == null) {
    return null;
  }
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isNaN(time) ? null : time;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

/** Nearest row index by X value (time/numeric). Returns null when no row within maxDeltaMs. */
export const findNearestDatumIndexByX = <TDatum>(
  data: readonly TDatum[],
  xKey: DataAccessor<TDatum, string | number | Date | null | undefined>,
  targetX: string | number | Date | null | undefined,
  options?: { maxDeltaMs?: number; xScale?: ChartCartesianScaleKind },
): number | null => {
  if (targetX == null || data.length === 0) {
    return null;
  }

  const targetTime = toTimestamp(targetX);
  const readX = normalizeAccessor(xKey);
  let bestIndex: number | null = null;
  let bestDistance = Infinity;

  for (const [index, datum] of data.entries()) {
    const xValue = readX(datum, index);
    const candidateTime =
      options?.xScale === "time" || targetTime != null
        ? toTimestamp(xValue as string | number | Date | null | undefined)
        : null;

    const distance =
      candidateTime != null && targetTime != null
        ? Math.abs(candidateTime - targetTime)
        : xValue === targetX
          ? 0
          : Infinity;

    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  }

  if (bestIndex == null || !Number.isFinite(bestDistance)) {
    return null;
  }

  if (options?.maxDeltaMs != null && targetTime != null && bestDistance > options.maxDeltaMs) {
    return null;
  }

  return bestIndex;
};
