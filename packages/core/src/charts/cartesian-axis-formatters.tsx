import { useMemo } from "preact/hooks";
import type { TickFormatter, TickValue } from "../axes";
import {
  createChartDateFormatter,
  createChartNumberFormatter,
  useChartFormat,
} from "../formatting/chart-format-context";
import type { ChartFormatOptions } from "./types";

export const useCartesianAxisFormatters = (format?: ChartFormatOptions) => {
  const resolved = useChartFormat(format);
  const numberFormatter = useMemo(
    () => createChartNumberFormatter(resolved),
    [resolved.locale, resolved.number, resolved.timeZone],
  );
  const dateFormatter = useMemo(
    () => createChartDateFormatter(resolved),
    [resolved.locale, resolved.timeZone],
  );

  const yTickFormatter = useMemo<TickFormatter>(
    () => (value) => {
      if (typeof value === "number" && Number.isFinite(value)) {
        return numberFormatter.format(value);
      }
      return String(value);
    },
    [numberFormatter],
  );

  const xTickFormatter = useMemo<TickFormatter<TickValue>>(
    () => (value) => {
      if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? "" : dateFormatter.format(value);
      }
      if (typeof value === "number" && Number.isFinite(value)) {
        return dateFormatter.format(new Date(value));
      }
      return String(value);
    },
    [dateFormatter],
  );

  return { xTickFormatter, yTickFormatter, numberFormatter, dateFormatter };
};

export const useCartesianIntlAxisTicks = (format?: ChartFormatOptions) => {
  const { xTickFormatter, yTickFormatter } = useCartesianAxisFormatters(format);
  const enabled = format?.locale != null || format?.timeZone != null || format?.number != null;
  return {
    xTickFormatter: enabled ? xTickFormatter : undefined,
    yTickFormatter: enabled ? yTickFormatter : undefined,
  };
};
