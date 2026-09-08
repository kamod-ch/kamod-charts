import type { ComponentChildren } from "preact";
import { useMemo } from "preact/hooks";
import type { ChartAnimateOptions } from "../animation";
import { ChartMotionContext, type ChartMotionContextValue } from "../animation/slots";
import { AnimatedValue } from "./animated-value";
import { MotionAreaSeries } from "./series/area-series";
import { MotionBarMarks } from "./series/bar-marks";
import { MotionBarSeries } from "./series/bar-series";
import { MotionLineSeries } from "./series/line-series";
import { MotionPieSeries } from "./series/pie-series";
import { MotionScatterSeries } from "./series/scatter-series";
import { MotionStackedAreaSeries } from "./series/stacked-area-series";
import { MotionStackedLineSeries } from "./series/stacked-line-series";

export interface MotionConfigProps extends ChartAnimateOptions {
  children?: ComponentChildren;
}

export const MotionConfig = ({
  children,
  enabled = true,
  duration,
  easing,
  preset,
  reducedMotion,
}: MotionConfigProps) => {
  const value = useMemo<ChartMotionContextValue>(
    () => ({
      present: true,
      defaults: { enabled, duration, easing, preset, reducedMotion },
      slots: {
        LineSeries: MotionLineSeries as never,
        AreaSeries: MotionAreaSeries as never,
        StackedAreaSeries: MotionStackedAreaSeries as never,
        StackedLineSeries: MotionStackedLineSeries as never,
        BarSeries: MotionBarSeries as never,
        BarMarks: MotionBarMarks as never,
        PieSeries: MotionPieSeries as never,
        ScatterSeries: MotionScatterSeries as never,
        AnimatedNumber: AnimatedValue,
      },
    }),
    [duration, easing, enabled, preset, reducedMotion],
  );

  return <ChartMotionContext.Provider value={value}>{children}</ChartMotionContext.Provider>;
};
