export type TickCollisionStrategy = "none" | "hide" | "rotate" | "truncate";

export interface TickCollisionOptions {
  tickCollision?: TickCollisionStrategy;
  /** Character cap for `truncate` (SSR-safe heuristic). */
  maxTickLabelLength?: number;
  /** Pixel width cap for `truncate` / `hide` estimates (≈6.5px per character). */
  maxTickLabelWidth?: number;
}

const ESTIMATED_CHAR_WIDTH = 6.5;
const ESTIMATED_LINE_HEIGHT = 12;
const DEFAULT_MAX_TICK_LABEL_LENGTH = 12;
const TICK_GAP = 4;
const AUTO_X_ROTATION = -45;

export const estimateTickLabelWidth = (text: string, maxTickLabelWidth?: number): number => {
  const estimated = text.length * ESTIMATED_CHAR_WIDTH;
  if (maxTickLabelWidth == null) {
    return estimated;
  }
  return Math.min(estimated, maxTickLabelWidth);
};

/** Width used for collision checks; never below the rendered label width. */
export const estimateTickCollisionWidth = (
  displayText: string,
  fullText: string,
  maxTickLabelWidth?: number,
): number => {
  const rendered = estimateTickLabelWidth(displayText);
  if (displayText === fullText || maxTickLabelWidth == null) {
    return rendered;
  }
  return Math.max(rendered, Math.min(estimateTickLabelWidth(fullText), maxTickLabelWidth));
};

const estimateRotatedExtent = (width: number, height: number, rotationDegrees: number): number => {
  if (rotationDegrees === 0) {
    return height;
  }
  const radians = (rotationDegrees * Math.PI) / 180;
  return Math.abs(width * Math.sin(radians)) + Math.abs(height * Math.cos(radians));
};

export const estimateTickLabelExtent = (
  displayText: string,
  fullText: string,
  options: {
    orientation: "x" | "y";
    rotation?: number;
    maxTickLabelWidth?: number;
  },
): number => {
  const width = estimateTickCollisionWidth(displayText, fullText, options.maxTickLabelWidth);
  const rotation = options.rotation ?? 0;
  if (options.orientation === "x") {
    if (rotation === 0) {
      return width;
    }
    return estimateRotatedExtent(width, ESTIMATED_LINE_HEIGHT, rotation);
  }
  if (rotation === 0) {
    return ESTIMATED_LINE_HEIGHT;
  }
  return estimateRotatedExtent(width, ESTIMATED_LINE_HEIGHT, rotation);
};

export const truncateTickLabel = (
  text: string,
  maxTickLabelLength?: number,
  maxTickLabelWidth?: number,
): { display: string; full: string } => {
  let limit = maxTickLabelLength ?? DEFAULT_MAX_TICK_LABEL_LENGTH;
  if (maxTickLabelWidth != null) {
    limit = Math.min(limit, Math.max(1, Math.floor(maxTickLabelWidth / ESTIMATED_CHAR_WIDTH)));
  }
  if (text.length <= limit) {
    return { display: text, full: text };
  }
  if (limit <= 1) {
    return { display: "…", full: text };
  }
  return { display: `${text.slice(0, limit - 1)}…`, full: text };
};

export interface PreparedAxisTick {
  index: number;
  position: number;
  labelText: string;
  displayText: string;
  fullText: string;
  visible: boolean;
  rotation: number;
}

const applyHideStrategy = (
  base: PreparedAxisTick[],
  options: TickCollisionOptions & { orientation: "x" | "y"; tickRotation?: number },
): PreparedAxisTick[] => {
  if (base.length <= 1) {
    return base;
  }

  const order = [...base.keys()].sort(
    (left, right) => base[left]!.position - base[right]!.position,
  );
  const firstIndex = order[0]!;
  const lastIndex = order[order.length - 1]!;
  const visible = base.map(() => false);

  const extentAt = (index: number) =>
    estimateTickLabelExtent(base[index]!.displayText, base[index]!.fullText, {
      orientation: options.orientation,
      rotation: base[index]!.rotation,
      maxTickLabelWidth: options.maxTickLabelWidth,
    });

  visible[firstIndex] = true;
  let cursor = base[firstIndex]!.position + extentAt(firstIndex) / 2 + TICK_GAP;

  for (let orderIndex = 1; orderIndex < order.length - 1; orderIndex += 1) {
    const index = order[orderIndex]!;
    const half = extentAt(index) / 2;
    const center = base[index]!.position;
    if (center - half >= cursor) {
      visible[index] = true;
      cursor = center + half + TICK_GAP;
    }
  }

  const lastHalf = extentAt(lastIndex) / 2;
  const lastCenter = base[lastIndex]!.position;
  const lastFits = lastCenter - lastHalf >= cursor;
  if (lastFits) {
    visible[lastIndex] = true;
  } else if (visible[firstIndex] && order.length > 2) {
    const firstHalf = extentAt(firstIndex) / 2;
    const firstCenter = base[firstIndex]!.position;
    const firstOverlapsLast = Math.abs(lastCenter - firstCenter) < lastHalf + firstHalf + TICK_GAP;
    if (firstOverlapsLast) {
      visible[firstIndex] = false;
      visible[lastIndex] = true;
    }
  } else {
    visible[lastIndex] = lastFits;
  }

  return base.map((entry, index) => ({ ...entry, visible: visible[index]! }));
};

export const prepareAxisTicks = (
  ticks: readonly { position: number; labelText: string }[],
  options: TickCollisionOptions & {
    tickRotation?: number;
    orientation: "x" | "y";
  },
): PreparedAxisTick[] => {
  const strategy = options.tickCollision ?? "none";
  const explicitRotation = options.tickRotation ?? 0;

  const base: PreparedAxisTick[] = ticks.map((tick, index) => ({
    index,
    position: tick.position,
    labelText: tick.labelText,
    displayText: tick.labelText,
    fullText: tick.labelText,
    visible: true,
    rotation: explicitRotation,
  }));

  if (strategy === "none") {
    return base;
  }

  if (strategy === "truncate") {
    return base.map((entry) => {
      const truncated = truncateTickLabel(
        entry.labelText,
        options.maxTickLabelLength,
        options.maxTickLabelWidth,
      );
      return {
        ...entry,
        displayText: truncated.display,
        fullText: truncated.full,
      };
    });
  }

  if (strategy === "rotate") {
    const rotation =
      explicitRotation !== 0 ? explicitRotation : options.orientation === "x" ? AUTO_X_ROTATION : 0;
    return base.map((entry) => ({ ...entry, rotation }));
  }

  if (strategy === "hide") {
    return applyHideStrategy(base, options);
  }

  return base;
};
