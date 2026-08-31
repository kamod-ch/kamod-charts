import { createContext } from "preact";
import { useContext } from "preact/hooks";
import type { ComponentType } from "preact";
import type { ChartAnimateOptions } from "./types";

export interface ChartMotionSlots {
  LineSeries?: ComponentType<Record<string, unknown>>;
  AreaSeries?: ComponentType<Record<string, unknown>>;
  StackedAreaSeries?: ComponentType<Record<string, unknown>>;
  BarSeries?: ComponentType<Record<string, unknown>>;
  BarMarks?: ComponentType<Record<string, unknown>>;
  PieSeries?: ComponentType<Record<string, unknown>>;
  ScatterSeries?: ComponentType<Record<string, unknown>>;
  AnimatedNumber?: ComponentType<{ value: number | null }>;
}

export interface ChartMotionContextValue {
  present: boolean;
  defaults: ChartAnimateOptions;
  slots: ChartMotionSlots;
}

export const defaultChartMotionContext: ChartMotionContextValue = {
  present: false,
  defaults: {},
  slots: {},
};

export const ChartMotionContext = createContext<ChartMotionContextValue>(defaultChartMotionContext);

export const useChartMotionContext = (): ChartMotionContextValue => useContext(ChartMotionContext);
