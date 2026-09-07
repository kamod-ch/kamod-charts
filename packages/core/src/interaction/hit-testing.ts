import type { CartesianPoint } from "../series";

export type CartesianHitResult = {
  index: number;
  seriesIndex: number;
  distanceSquared: number;
};

type ProjectedXCandidate = {
  index: number;
  x: number;
};

type ProjectedPointCandidate = {
  index: number;
  seriesIndex: number;
  x: number;
  y: number;
};

const isCloserTie = (
  distance: number,
  nearestDistance: number,
  candidate: { index: number; seriesIndex: number },
  nearest: { index: number; seriesIndex: number },
): boolean => {
  if (distance < nearestDistance) {
    return true;
  }

  if (distance !== nearestDistance) {
    return false;
  }

  if (candidate.seriesIndex !== nearest.seriesIndex) {
    return candidate.seriesIndex < nearest.seriesIndex;
  }

  return candidate.index < nearest.index;
};

export const findNearestProjectedX = (
  candidates: readonly ProjectedXCandidate[],
  plotX: number,
): { index: number; distanceSquared: number } | null => {
  let nearest: { index: number; distanceSquared: number } | null = null;

  for (const candidate of candidates) {
    const distanceSquared = (candidate.x - plotX) ** 2;
    if (
      nearest == null ||
      isCloserTie(
        distanceSquared,
        nearest.distanceSquared,
        { index: candidate.index, seriesIndex: 0 },
        { index: nearest.index, seriesIndex: 0 },
      )
    ) {
      nearest = { index: candidate.index, distanceSquared };
    }
  }

  return nearest;
};

export const findNearestProjectedPoint = (
  candidates: readonly ProjectedPointCandidate[],
  plotX: number,
  plotY: number,
): CartesianHitResult | null => {
  let nearest: CartesianHitResult | null = null;

  for (const candidate of candidates) {
    const distanceSquared = (candidate.x - plotX) ** 2 + (candidate.y - plotY) ** 2;
    if (
      nearest == null ||
      isCloserTie(distanceSquared, nearest.distanceSquared, candidate, nearest)
    ) {
      nearest = {
        index: candidate.index,
        seriesIndex: candidate.seriesIndex,
        distanceSquared,
      };
    }
  }

  return nearest;
};

export const findNearestPoint = <TDatum>(
  points: readonly CartesianPoint<TDatum>[],
  x: number,
  y: number,
): CartesianPoint<TDatum> | undefined => {
  let nearest: CartesianPoint<TDatum> | undefined;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const point of points) {
    if (!point.defined || point.x == null || point.y == null) {
      continue;
    }

    const distance = (point.x - x) ** 2 + (point.y - y) ** 2;
    if (distance < nearestDistance) {
      nearest = point;
      nearestDistance = distance;
    }
  }

  return nearest;
};
