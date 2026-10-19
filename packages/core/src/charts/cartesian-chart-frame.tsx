import type { ComponentChildren } from "preact";
import { ChartFormatProvider } from "../formatting/chart-format-context";
import type { ChartFormatOptions } from "./types";

export const CartesianChartFrame = ({
  format,
  children,
}: {
  format?: ChartFormatOptions;
  children: ComponentChildren;
}) => {
  const hasFormat = format?.locale != null || format?.timeZone != null || format?.number != null;
  if (!hasFormat) {
    return <>{children}</>;
  }
  return <ChartFormatProvider value={format}>{children}</ChartFormatProvider>;
};
