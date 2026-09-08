import type { PieTooltipOptions } from "./types";

export const isPieTooltipEnabled = <TDatum>(
  tooltip?: boolean | PieTooltipOptions<TDatum>,
): tooltip is true | PieTooltipOptions<TDatum> =>
  tooltip === true || (typeof tooltip === "object" && tooltip !== null);

export const resolvePieTooltipOptions = <TDatum>(
  tooltip: boolean | PieTooltipOptions<TDatum> | undefined,
): PieTooltipOptions<TDatum> | null => {
  if (!isPieTooltipEnabled(tooltip)) {
    return null;
  }

  if (tooltip === true) {
    return {};
  }

  return tooltip;
};
