import { useCallback, useRef, useState } from "preact/hooks";
import type { ChartCartesianScaleKind, DataAccessor } from "../core";
import { normalizeAccessor } from "../core";
import { findNearestDatumIndexByX } from "./cartesian-sync";
import type { CartesianActiveSelection } from "./types";

export type UseSynchronizedCartesianSelectionOptions = {
  initialXValue?: string | number | Date | null;
  maxDeltaMs?: number;
};

/**
 * Shared X selection for multiple cartesian charts (nearest timestamp by default).
 */
export const useSynchronizedCartesianSelection = ({
  initialXValue = null,
  maxDeltaMs,
}: UseSynchronizedCartesianSelectionOptions = {}) => {
  const [xValue, setXValue] = useState<string | number | Date | null>(initialXValue);
  const suppressEmitRef = useRef(false);

  const setXValueFromParent = useCallback((next: string | number | Date | null) => {
    suppressEmitRef.current = true;
    setXValue(next);
    queueMicrotask(() => {
      suppressEmitRef.current = false;
    });
  }, []);

  const createChartHandlers = useCallback(
    <TDatum>({
      data,
      xKey,
      xScale,
      onActiveChange,
    }: {
      data: readonly TDatum[];
      xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
      xScale?: ChartCartesianScaleKind;
      onActiveChange?: (selection: CartesianActiveSelection) => void;
    }) => {
      const resolvedXKey = xKey ?? ((_datum: TDatum, index: number) => index);
      const readX = normalizeAccessor(resolvedXKey);
      const activeIndex = findNearestDatumIndexByX(data, resolvedXKey, xValue, {
        maxDeltaMs,
        xScale,
      });

      const handleActiveChange = (selection: CartesianActiveSelection) => {
        if (!suppressEmitRef.current) {
          if (selection.activeIndex == null) {
            setXValue(null);
          } else {
            const datum = data[selection.activeIndex];
            if (datum != null) {
              setXValue(readX(datum, selection.activeIndex) ?? null);
            }
          }
        }
        onActiveChange?.(selection);
      };

      return { activeIndex, onActiveChange: handleActiveChange };
    },
    [maxDeltaMs, xValue],
  );

  return {
    xValue,
    setXValue: setXValueFromParent,
    createChartHandlers,
  };
};
