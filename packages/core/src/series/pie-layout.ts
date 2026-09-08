export type CircularVariant = "full" | "half";

/** d3 `pie()` default angle range for a full circle. */
export const FULL_PIE_START_ANGLE = 0;
export const FULL_PIE_END_ANGLE = Math.PI * 2;

/** Upper semicircle from 9 o'clock through 12 o'clock to 3 o'clock. */
export const HALF_PIE_START_ANGLE = -Math.PI / 2;
export const HALF_PIE_END_ANGLE = Math.PI / 2;

export const HALF_PIE_CENTER_Y_RATIO = 0.68;
export const DEFAULT_INNER_RADIUS_RATIO = 0.68;
export const MAX_INNER_RADIUS_RATIO = 0.95;
export const DEFAULT_PIE_ACTIVE_OFFSET = 6;

const DEFAULT_PIE_RADIAL_LINE_LENGTH = 12;
const DEFAULT_PIE_HORIZONTAL_LINE_LENGTH = 16;
const DEFAULT_PIE_LABEL_OFFSET = 4;
const DEFAULT_PIE_LABEL_TEXT_HALF_WIDTH = 24;

/** Minimum plot height reserved below the half-pie baseline for center content. */
const HALF_PIE_BOTTOM_ZONE_MIN = 16;
/** Vertical offset applied to half-pie center content above the baseline (local coordinates). */
const HALF_PIE_CENTER_CONTENT_OFFSET = -8;

export interface PieLayoutPlotArea {
  width: number;
  height: number;
}

export interface PieLayoutLabelOptions {
  position?: "none" | "inside" | "outside";
  line?: {
    length?: number;
    horizontalLength?: number;
  };
  offset?: number;
}

export interface ResolvePieLayoutOptions {
  plotArea: PieLayoutPlotArea;
  variant?: CircularVariant;
  /** Pixel inner radius; wins over `innerRadiusRatio` for existing pie callers. */
  innerRadius?: number;
  /** Ratio of resolved outer radius; clamped to `[0, 0.95]`. */
  innerRadiusRatio?: number;
  outerRadius?: number;
  labelOptions?: PieLayoutLabelOptions;
  activeOffset?: number;
}

export interface ResolvedPieLayout {
  variant: CircularVariant;
  centerX: number;
  centerY: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  centerContentOffsetY: number;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const sanitizeNonNegative = (value: number | undefined, fallback = 0): number => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, value);
};

const sanitizePlotDimension = (value: number | undefined): number => sanitizeNonNegative(value, 0);

const computeOutsideLabelGutter = (labelOptions: PieLayoutLabelOptions | undefined): number => {
  if (labelOptions?.position !== "outside") {
    return 0;
  }

  const line = labelOptions.line ?? {};
  const radial = line.length ?? DEFAULT_PIE_RADIAL_LINE_LENGTH;
  const horizontal = line.horizontalLength ?? DEFAULT_PIE_HORIZONTAL_LINE_LENGTH;
  const offset = labelOptions.offset ?? DEFAULT_PIE_LABEL_OFFSET;
  return radial + horizontal + offset + DEFAULT_PIE_LABEL_TEXT_HALF_WIDTH + 4;
};

const resolveFullAutoOuterRadius = (width: number, height: number, labelGutter: number): number => {
  const maxRadius = Math.max(0, Math.min(width, height) / 2);
  return Math.max(0, maxRadius - labelGutter);
};

const resolveHalfCenterY = (height: number): number => {
  if (height <= 0) {
    return 0;
  }

  const bottomReserve = Math.min(
    HALF_PIE_BOTTOM_ZONE_MIN,
    Math.max(0, height * (1 - HALF_PIE_CENTER_Y_RATIO)),
  );
  const maxCenterY = Math.max(0, height - bottomReserve);
  const idealCenterY = height * HALF_PIE_CENTER_Y_RATIO;
  return clamp(idealCenterY, 0, maxCenterY);
};

const resolveHalfAutoOuterRadius = (
  width: number,
  centerY: number,
  labelGutter: number,
  activeOffset: number,
): number => {
  const horizontalMax = Math.max(0, width / 2 - labelGutter);
  const verticalMax = Math.max(0, centerY - activeOffset);
  return Math.min(horizontalMax, verticalMax);
};

const clampOuterRadius = (candidate: number, maxOuter: number): number =>
  clamp(sanitizeNonNegative(candidate), 0, Math.max(0, maxOuter));

const resolveInnerRadius = (
  outerRadius: number,
  pixelInnerRadius: number | undefined,
  innerRadiusRatio: number | undefined,
  variant: CircularVariant,
): number => {
  if (outerRadius <= 0) {
    return 0;
  }

  if (typeof pixelInnerRadius === "number" && Number.isFinite(pixelInnerRadius)) {
    return clamp(Math.max(0, pixelInnerRadius), 0, Math.max(0, outerRadius - 1e-6));
  }

  if (innerRadiusRatio === undefined) {
    if (variant === "half") {
      return clamp(
        outerRadius * DEFAULT_INNER_RADIUS_RATIO,
        0,
        outerRadius * MAX_INNER_RADIUS_RATIO,
      );
    }

    return 0;
  }

  if (typeof innerRadiusRatio !== "number" || !Number.isFinite(innerRadiusRatio)) {
    return 0;
  }

  const ratio = clamp(innerRadiusRatio, 0, MAX_INNER_RADIUS_RATIO);
  return clamp(outerRadius * ratio, 0, Math.max(0, outerRadius - 1e-6));
};

const resolveMaxOuterRadius = (
  variant: CircularVariant,
  width: number,
  height: number,
  centerY: number,
  labelGutter: number,
  activeOffset: number,
): number => {
  if (variant === "half") {
    return resolveHalfAutoOuterRadius(width, centerY, labelGutter, activeOffset);
  }

  return resolveFullAutoOuterRadius(width, height, labelGutter);
};

/**
 * Pure layout resolver for full and half circular charts.
 *
 * `full` preserves the legacy center (`plotWidth / 2`, `plotHeight / 2`) and auto
 * outer-radius behaviour. `half` lays out the upper semicircle with a lower center
 * point and a constrained auto radius.
 */
export const resolvePieLayout = ({
  plotArea,
  variant = "full",
  innerRadius: pixelInnerRadius,
  innerRadiusRatio,
  outerRadius: explicitOuterRadius,
  labelOptions,
  activeOffset = DEFAULT_PIE_ACTIVE_OFFSET,
}: ResolvePieLayoutOptions): ResolvedPieLayout => {
  const width = sanitizePlotDimension(plotArea.width);
  const height = sanitizePlotDimension(plotArea.height);
  const safeActiveOffset = sanitizeNonNegative(activeOffset, DEFAULT_PIE_ACTIVE_OFFSET);
  const labelGutter = computeOutsideLabelGutter(labelOptions);

  const centerX = width / 2;
  const centerY = variant === "half" ? resolveHalfCenterY(height) : height / 2;
  const startAngle = variant === "half" ? HALF_PIE_START_ANGLE : FULL_PIE_START_ANGLE;
  const endAngle = variant === "half" ? HALF_PIE_END_ANGLE : FULL_PIE_END_ANGLE;
  const centerContentOffsetY = variant === "half" ? HALF_PIE_CENTER_CONTENT_OFFSET : 0;

  const maxOuter = resolveMaxOuterRadius(
    variant,
    width,
    height,
    centerY,
    labelGutter,
    safeActiveOffset,
  );
  const maxExplicitOuter = variant === "full" ? Math.max(0, Math.min(width, height) / 2) : maxOuter;

  const outerRadius =
    explicitOuterRadius === undefined
      ? maxOuter
      : clampOuterRadius(explicitOuterRadius, maxExplicitOuter);

  const innerRadius = resolveInnerRadius(outerRadius, pixelInnerRadius, innerRadiusRatio, variant);

  return {
    variant,
    centerX,
    centerY,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    centerContentOffsetY,
  };
};

export interface PieLayoutRadiusProps {
  innerRadius?: number;
  outerRadius?: number;
  activeOffset?: number;
}

/** Shared full-pie layout resolution for renderers, tooltips, and labels. */
export const resolveFullPieLayout = (
  plotArea: PieLayoutPlotArea,
  labelOptions: PieLayoutLabelOptions | undefined,
  radiusProps: PieLayoutRadiusProps = {},
): ResolvedPieLayout =>
  resolvePieLayout({
    plotArea,
    variant: "full",
    innerRadius: radiusProps.innerRadius,
    outerRadius: radiusProps.outerRadius,
    labelOptions,
    activeOffset: radiusProps.activeOffset,
  });
