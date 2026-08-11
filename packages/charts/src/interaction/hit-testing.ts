import type { CartesianPoint } from "../series";

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
