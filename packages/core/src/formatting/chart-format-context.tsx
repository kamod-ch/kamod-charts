import { createContext } from "preact";
import type { ComponentChildren } from "preact";
import { useContext, useMemo } from "preact/hooks";
import type { ChartFormatOptions } from "../charts/types";

export type ChartFormatContextValue = ChartFormatOptions;

const ChartFormatContext = createContext<ChartFormatContextValue | null>(null);

export const ChartFormatProvider = ({
  value,
  children,
}: {
  value: ChartFormatContextValue;
  children: ComponentChildren;
}) => <ChartFormatContext.Provider value={value}>{children}</ChartFormatContext.Provider>;

export const useChartFormat = (override?: ChartFormatOptions): ChartFormatContextValue => {
  const inherited = useContext(ChartFormatContext);
  return useMemo(
    () => ({
      locale: override?.locale ?? inherited?.locale,
      timeZone: override?.timeZone ?? inherited?.timeZone,
      number: override?.number ?? inherited?.number,
    }),
    [inherited, override?.locale, override?.number, override?.timeZone],
  );
};

export const createChartNumberFormatter = (format?: ChartFormatOptions) =>
  new Intl.NumberFormat(format?.locale, format?.number ?? { maximumFractionDigits: 2 });

export const createChartDateFormatter = (format?: ChartFormatOptions) =>
  new Intl.DateTimeFormat(format?.locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: format?.timeZone,
  });
