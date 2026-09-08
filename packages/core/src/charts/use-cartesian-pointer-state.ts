import type { JSX } from "preact";
import { useCallback, useState } from "preact/hooks";
import type { ChartCartesianScaleKind, DataAccessor } from "../core";
import { findNearestCartesianIndexByX } from "./cartesian-interaction";
import { resolvePointerPlot } from "./chart-pointer";

export type CartesianPointerPlot = {
  plotX: number;
  plotY: number;
};

export const useCartesianPointerState = <TDatum>({
  data,
  xKey,
  xScale,
  fallbackWidth,
  height,
}: {
  data: readonly TDatum[];
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ChartCartesianScaleKind;
  fallbackWidth: number;
  height: number;
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [pointerPlot, setPointerPlot] = useState<CartesianPointerPlot | null>(null);

  const onPointerMove = useCallback(
    (event: JSX.TargetedPointerEvent<Element>) => {
      const { plot, position } = resolvePointerPlot(event, fallbackWidth, height);
      setPointerPlot({ plotX: position.plotX, plotY: position.plotY });
      setActiveIndex(
        findNearestCartesianIndexByX({
          data,
          xKey,
          xScale,
          plotWidth: plot.width,
          plotX: position.plotX,
        }),
      );
    },
    [data, fallbackWidth, height, xKey, xScale],
  );

  const onPointerLeave = useCallback(() => {
    setPointerPlot(null);
    setActiveIndex(null);
  }, []);

  const resetPointerPlot = useCallback(() => {
    setPointerPlot(null);
  }, []);

  return {
    activeIndex,
    setActiveIndex,
    pointerPlot,
    onPointerMove,
    onPointerLeave,
    resetPointerPlot,
  };
};
