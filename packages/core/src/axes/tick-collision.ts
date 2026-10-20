export type TickCollisionStrategy = "none" | "hide" | "rotate" | "truncate";

export interface TickCollisionOptions {
  tickCollision?: TickCollisionStrategy;
  /** Character cap for `truncate` (SSR-safe heuristic). */
  maxTickLabelLength?: number;
  /** Pixel width cap for `truncate` / `hide` estimates (≈6.5px per character). */
  maxTickLabelWidth?: number;
}

const ESTIMATED_CHAR_WIDTH = 6.5;
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
    if (base.length <= 2) {
      return base;
    }

    const widths = base.map((entry) =>
      estimateTickLabelWidth(entry.displayText, options.maxTickLabelWidth),
    );
    const lastIndex = base.length - 1;
    const visible = base.map(() => false);
    visible[0] = true;
    visible[lastIndex] = true;

    let cursor = base[0]!.position + widths[0]! / 2 + TICK_GAP;
    for (let index = 1; index < lastIndex; index += 1) {
      const half = widths[index]! / 2;
      const center = base[index]!.position;
      if (center - half >= cursor) {
        visible[index] = true;
        cursor = center + half + TICK_GAP;
      }
    }

    return base.map((entry, index) => ({ ...entry, visible: visible[index]! }));
  }

  return base;
};
