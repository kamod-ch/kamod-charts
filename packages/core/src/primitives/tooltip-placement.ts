export type TooltipPlacement = "auto" | "top" | "right" | "bottom" | "left";
export type ResolvedTooltipPlacement = Exclude<TooltipPlacement, "auto">;

export interface TooltipPlacementInput {
  anchorX: number;
  anchorY: number;
  tooltipWidth: number;
  tooltipHeight: number;
  boundaryWidth: number;
  boundaryHeight: number;
  placement?: TooltipPlacement;
  offset?: number;
  padding?: number;
}

export interface TooltipPlacementResult {
  placement: ResolvedTooltipPlacement;
  left: number;
  top: number;
}

export interface ViewBoxRect {
  width: number;
  height: number;
}

export interface PixelRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const PLACEMENT_ORDER: readonly ResolvedTooltipPlacement[] = ["top", "right", "bottom", "left"];
export const defaultTooltipOffset = 8;
export const defaultTooltipPadding = 8;

const unclampedPosition = (
  placement: ResolvedTooltipPlacement,
  anchorX: number,
  anchorY: number,
  tooltipWidth: number,
  tooltipHeight: number,
  offset: number,
): { left: number; top: number } => {
  if (placement === "top") {
    return { left: anchorX - tooltipWidth / 2, top: anchorY - offset - tooltipHeight };
  }

  if (placement === "bottom") {
    return { left: anchorX - tooltipWidth / 2, top: anchorY + offset };
  }

  if (placement === "left") {
    return { left: anchorX - offset - tooltipWidth, top: anchorY - tooltipHeight / 2 };
  }

  return { left: anchorX + offset, top: anchorY - tooltipHeight / 2 };
};

const overflowAmount = (
  left: number,
  top: number,
  tooltipWidth: number,
  tooltipHeight: number,
  boundaryWidth: number,
  boundaryHeight: number,
  padding: number,
): number => {
  const maxX = boundaryWidth - padding;
  const maxY = boundaryHeight - padding;
  return (
    Math.max(0, padding - left) +
    Math.max(0, padding - top) +
    Math.max(0, left + tooltipWidth - maxX) +
    Math.max(0, top + tooltipHeight - maxY)
  );
};

export const clampTooltipPosition = (
  left: number,
  top: number,
  tooltipWidth: number,
  tooltipHeight: number,
  boundaryWidth: number,
  boundaryHeight: number,
  padding: number = defaultTooltipPadding,
): { left: number; top: number } => {
  const minLeft = padding;
  const minTop = padding;
  const maxLeft = boundaryWidth - tooltipWidth - padding;
  const maxTop = boundaryHeight - tooltipHeight - padding;

  return {
    left: Math.min(Math.max(left, minLeft), Math.max(minLeft, maxLeft)),
    top: Math.min(Math.max(top, minTop), Math.max(minTop, maxTop)),
  };
};

export const calculateTooltipPlacement = ({
  anchorX,
  anchorY,
  tooltipWidth,
  tooltipHeight,
  boundaryWidth,
  boundaryHeight,
  placement = "auto",
  offset = defaultTooltipOffset,
  padding = defaultTooltipPadding,
}: TooltipPlacementInput): TooltipPlacementResult => {
  const resolve = (nextPlacement: ResolvedTooltipPlacement): TooltipPlacementResult => {
    const unclamped = unclampedPosition(
      nextPlacement,
      anchorX,
      anchorY,
      tooltipWidth,
      tooltipHeight,
      offset,
    );
    const clamped = clampTooltipPosition(
      unclamped.left,
      unclamped.top,
      tooltipWidth,
      tooltipHeight,
      boundaryWidth,
      boundaryHeight,
      padding,
    );
    return { placement: nextPlacement, ...clamped };
  };

  if (placement !== "auto") {
    return resolve(placement);
  }

  let best: ResolvedTooltipPlacement = "top";
  let bestOverflow = Number.POSITIVE_INFINITY;

  for (const candidate of PLACEMENT_ORDER) {
    const unclamped = unclampedPosition(
      candidate,
      anchorX,
      anchorY,
      tooltipWidth,
      tooltipHeight,
      offset,
    );
    const overflow = overflowAmount(
      unclamped.left,
      unclamped.top,
      tooltipWidth,
      tooltipHeight,
      boundaryWidth,
      boundaryHeight,
      padding,
    );

    if (overflow === 0) {
      return resolve(candidate);
    }

    if (overflow < bestOverflow) {
      best = candidate;
      bestOverflow = overflow;
    }
  }

  return resolve(best);
};

export const viewBoxToContainerPixels = (
  x: number,
  y: number,
  viewBox: ViewBoxRect,
  svgRect: PixelRect,
  containerRect: Pick<PixelRect, "left" | "top">,
): { x: number; y: number } => {
  const scaleX = viewBox.width > 0 ? svgRect.width / viewBox.width : 1;
  const scaleY = viewBox.height > 0 ? svgRect.height / viewBox.height : 1;

  return {
    x: svgRect.left - containerRect.left + x * scaleX,
    y: svgRect.top - containerRect.top + y * scaleY,
  };
};

export const fallbackTooltipTransform = (
  placement: TooltipPlacement,
  offset: number = defaultTooltipOffset,
): string => {
  if (placement === "bottom") {
    return `translate(-50%, ${offset}px)`;
  }

  if (placement === "left") {
    return `translate(calc(-100% - ${offset}px), -50%)`;
  }

  if (placement === "right") {
    return `translate(${offset}px, -50%)`;
  }

  return `translate(-50%, calc(-100% - ${offset}px))`;
};
