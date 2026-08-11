import { createContext } from "preact";
import { useContext } from "preact/hooks";
import type { ChartContextValue } from "./types";

const ChartContext = createContext<ChartContextValue<unknown> | null>(null);

export const ChartProvider = ChartContext.Provider;

export const useChartContext = <TDatum>(): ChartContextValue<TDatum> => {
  const context = useContext(ChartContext);

  if (!context) {
    throw new Error("Chart components must be rendered inside <Chart>.");
  }

  return context as ChartContextValue<TDatum>;
};
