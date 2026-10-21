import type { JSX } from "preact";
import { useCallback, useState } from "preact/hooks";
import type { ChartCartesianScaleKind, DataAccessor } from "../core";
import type { NumericDomain } from "../scales";
import { findNearestCartesianIndexByX } from "./cartesian-interaction";
import type { CartesianXIndex } from "./cartesian-x-index";
import type { ChartXViewportDomain } from "./x-viewport";
import { resolvePointerPlot } from "./chart-pointer";
import { useCartesianPointerFrame } from "./use-cartesian-pointer-frame";

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
  xIndex,
  xDomain,
  yDomain,
  seriesKey,
  controlledActiveIndex,
  onActiveIndexChange,
}: {
  data: readonly TDatum[];
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ChartCartesianScaleKind;
  fallbackWidth: number;
  height: number;
  xIndex?: CartesianXIndex | null;
  xDomain?: ChartXViewportDomain;
  yDomain?: NumericDomain;
  seriesKey?: DataAccessor<TDatum, number | null | undefined>;
  controlledActiveIndex?: number | null;
  onActiveIndexChange?: (index: number | null) => void;
}) => {
  const [internalActiveIndex, setInternalActiveIndex] = useState<number | null>(null);
  const activeIndex =
    controlledActiveIndex !== undefined ? controlledActiveIndex : internalActiveIndex;
  const setActiveIndex = useCallback(
    (index: number | null) => {
      if (controlledActiveIndex === undefined) {
        setInternalActiveIndex(index);
      }
    },
    [controlledActiveIndex],
  );
  const [pointerPlot, setPointerPlot] = useState<CartesianPointerPlot | null>(null);

  const applyPointer = useCallback(
    ({ plot, position }: ReturnType<typeof resolvePointerPlot>) => {
      setPointerPlot({ plotX: position.plotX, plotY: position.plotY });
      const nextIndex = findNearestCartesianIndexByX({
        data,
        xKey,
        xScale,
        plotWidth: plot.width,
        plotX: position.plotX,
        xIndex,
        xDomain,
        yDomain,
        seriesKey,
      });
      setActiveIndex(nextIndex);
      onActiveIndexChange?.(nextIndex);
    },
    [data, onActiveIndexChange, seriesKey, setActiveIndex, xIndex, xDomain, xKey, xScale, yDomain],
  );

  const schedulePointerMove = useCartesianPointerFrame(applyPointer);
  const onPointerMove = useCallback(
    (event: JSX.TargetedPointerEvent<Element>) => {
      // Preact clears currentTarget after dispatch. Resolve all event- and DOM-dependent
      // geometry synchronously before handing the latest sample to requestAnimationFrame.
      schedulePointerMove(resolvePointerPlot(event, fallbackWidth, height));
    },
    [fallbackWidth, height, schedulePointerMove],
  );

  const onPointerLeave = useCallback(() => {
    setPointerPlot(null);
    setActiveIndex(null);
    onActiveIndexChange?.(null);
  }, [onActiveIndexChange, setActiveIndex]);

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
