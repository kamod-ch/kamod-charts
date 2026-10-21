import { useCallback, useMemo, useRef, useState } from "preact/hooks";
import type { ChartCartesianScaleKind, DataAccessor } from "../core";
import type { XViewportChangeReason } from "./use-cartesian-x-viewport-gestures";
import {
  clampXViewportDomain,
  inferContinuousXDomainFromData,
  resolveControlledChartXDomain,
  resolveSynchronizedXExtents,
  type ChartXViewportDomain,
} from "./x-viewport";

export type UseSynchronizedCartesianXDomainOptions = {
  initialXDomain?: ChartXViewportDomain;
};

/**
 * Shared X viewport (timestamps / numeric domain) for multiple cartesian charts.
 * Emits only on user-driven `onXViewportChange`; `setXDomain` from the parent does not echo.
 */
export const useSynchronizedCartesianXDomain = ({
  initialXDomain = undefined,
}: UseSynchronizedCartesianXDomainOptions = {}) => {
  const [xDomain, setXDomainState] = useState<ChartXViewportDomain | undefined>(initialXDomain);
  const suppressEmitRef = useRef(false);

  const setXDomain = useCallback((next: ChartXViewportDomain | undefined) => {
    suppressEmitRef.current = true;
    setXDomainState(next);
    queueMicrotask(() => {
      suppressEmitRef.current = false;
    });
  }, []);

  const createChartViewportHandlers = useCallback(
    <TDatum>({
      data,
      xKey,
      xScale,
      onXViewportChange,
      peerExtents = [],
    }: {
      data: readonly TDatum[];
      xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
      xScale?: ChartCartesianScaleKind;
      onXViewportChange?: (domain: ChartXViewportDomain, reason: XViewportChangeReason) => void;
      /** Additional chart extents included when clamping user gestures (unequal sampling / widths). */
      peerExtents?: readonly (ChartXViewportDomain | null)[];
    }) => {
      const chartExtents = inferContinuousXDomainFromData(data, xKey, xScale);
      const syncExtents = resolveSynchronizedXExtents([chartExtents, ...peerExtents], xScale);
      const resolvedDomain = resolveControlledChartXDomain(xDomain, xScale);
      const effectiveXDomain =
        resolvedDomain && syncExtents
          ? clampXViewportDomain(resolvedDomain, syncExtents, xScale)
          : resolvedDomain;

      const handleXViewportChange = (
        domain: ChartXViewportDomain,
        reason: XViewportChangeReason,
      ) => {
        if (!suppressEmitRef.current && syncExtents) {
          const clamped = clampXViewportDomain(domain, syncExtents, xScale);
          setXDomainState(clamped);
        }
        onXViewportChange?.(domain, reason);
      };

      return {
        xDomain: effectiveXDomain,
        onXViewportChange: handleXViewportChange,
        chartExtents,
        syncExtents,
      };
    },
    [xDomain],
  );

  const sharedExtents = useMemo(
    () =>
      (
        chartExtentsList: readonly (ChartXViewportDomain | null)[],
        xScale?: ChartCartesianScaleKind,
      ) =>
        resolveSynchronizedXExtents(chartExtentsList, xScale),
    [],
  );

  return {
    xDomain,
    setXDomain,
    createChartViewportHandlers,
    resolveSharedExtents: sharedExtents,
  };
};
