import { createContext } from "preact";
import { useContext } from "preact/hooks";
import type { ComponentType } from "preact";
import type { ChartAnimate, ChartAnimateOptions } from "./types";
import type { AreaSeriesProps } from "../series/area-series";
import type { StackedAreaSeriesProps } from "../series/stacked-area-series";
import type { LineSeriesProps } from "../series/line-series";
import type { ScatterSeriesProps } from "../series/scatter-series";
import type { PieSeriesProps } from "../series/pie-series";

type MotionSeriesProps<TProps> = TProps & { animate?: ChartAnimate };

export interface ChartMotionSlots {
  LineSeries?: ComponentType<MotionSeriesProps<LineSeriesProps<unknown>>>;
  AreaSeries?: ComponentType<MotionSeriesProps<AreaSeriesProps<unknown>>>;
  StackedAreaSeries?: ComponentType<MotionSeriesProps<StackedAreaSeriesProps<unknown>>>;
  BarSeries?: ComponentType<Record<string, unknown>>;
  BarMarks?: ComponentType<Record<string, unknown>>;
  PieSeries?: ComponentType<MotionSeriesProps<PieSeriesProps<unknown>>>;
  ScatterSeries?: ComponentType<MotionSeriesProps<ScatterSeriesProps<unknown>>>;
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
