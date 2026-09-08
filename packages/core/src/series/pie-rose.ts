export interface PieRoseOptions {
  minRadius?: number;
  scale?: "sqrt" | "linear";
}

export type PieRose = boolean | PieRoseOptions;

export const DEFAULT_ROSE_MIN_RADIUS_RATIO = 0.08;

export const resolvePieRoseOptions = (rose?: PieRose): PieRoseOptions | null => {
  if (!rose) {
    return null;
  }

  if (rose === true) {
    return { scale: "sqrt" };
  }

  return { scale: "sqrt", ...rose };
};

export const resolveRoseMinRadius = (
  innerRadius: number,
  outerRadius: number,
  minRadius: number | undefined,
): number => {
  const span = Math.max(0, outerRadius - innerRadius);
  const auto = innerRadius + span * DEFAULT_ROSE_MIN_RADIUS_RATIO;
  const resolved = minRadius ?? auto;

  return Math.min(Math.max(resolved, innerRadius), outerRadius);
};

export const normalizeRoseScale = (
  value: number,
  maxValue: number,
  scale: "sqrt" | "linear",
): number => {
  if (maxValue <= 0 || value <= 0) {
    return 0;
  }

  if (scale === "linear") {
    return value / maxValue;
  }

  return Math.sqrt(value) / Math.sqrt(maxValue);
};

export const computeRoseOuterRadius = (
  value: number,
  maxValue: number,
  innerRadius: number,
  outerRadius: number,
  minRadius: number,
  scale: "sqrt" | "linear",
): number => {
  const normalized = normalizeRoseScale(value, maxValue, scale);
  return minRadius + normalized * (outerRadius - minRadius);
};
