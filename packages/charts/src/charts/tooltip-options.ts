import type { CartesianTooltipMode, CartesianTooltipOptions } from "./types";

export const isTooltipEnabled = <TDatum>(
  tooltip?: boolean | CartesianTooltipOptions<TDatum>,
): tooltip is true | CartesianTooltipOptions<TDatum> =>
  tooltip === true || (typeof tooltip === "object" && tooltip !== null);

export const resolveTooltipOptions = <TDatum>(
  tooltip: boolean | CartesianTooltipOptions<TDatum> | undefined,
  defaultMode: CartesianTooltipMode,
): CartesianTooltipOptions<TDatum> | null => {
  if (!isTooltipEnabled(tooltip)) {
    return null;
  }

  if (tooltip === true) {
    return { mode: defaultMode };
  }

  return { mode: defaultMode, ...tooltip };
};
