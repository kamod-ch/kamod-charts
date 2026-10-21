import type { JSX } from "preact";
import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import type { ChartCartesianScaleKind, DataAccessor } from "../core";
import {
  clampXViewportDomain,
  inferContinuousXDomainFromData,
  resolveControlledChartXDomain,
  zoomXViewportDomain,
  type ChartXViewportDomain,
} from "./x-viewport";
import { invertPlotXToComparable, panDomainByPlotDelta } from "./x-viewport-coordinates";
import { resolvePointerPlot } from "./chart-pointer";

export type XViewportWheelZoomMode = "modifier" | "focus";

export interface XViewportInteractionOptions {
  wheelZoom?: boolean | XViewportWheelZoomMode;
  /** Minimum viewport span in data units (ms for time). */
  minSpan?: number;
}

export type XViewportChangeReason = "pan" | "zoom" | "reset" | "keyboard";

const composeHandlers = <T extends JSX.TargetedEvent<EventTarget>>(
  first?: (event: T) => void,
  second?: (event: T) => void,
): ((event: T) => void) | undefined => {
  if (!first && !second) {
    return undefined;
  }
  return (event) => {
    first?.(event);
    second?.(event);
  };
};

export const useCartesianXViewportGestures = <TDatum>({
  enabled,
  data,
  xKey,
  xScale,
  xDomain: controlledDomain,
  onXViewportChange,
  interaction = {},
  plotWidth,
  fallbackWidth,
  chartHeight,
}: {
  enabled: boolean;
  data: readonly TDatum[];
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ChartCartesianScaleKind;
  xDomain?: ChartXViewportDomain;
  onXViewportChange?: (domain: ChartXViewportDomain, reason: XViewportChangeReason) => void;
  interaction?: XViewportInteractionOptions;
  plotWidth: number;
  fallbackWidth: number;
  chartHeight: number;
}) => {
  const extents = useMemo(
    () => inferContinuousXDomainFromData(data, xKey, xScale),
    [data, xKey, xScale],
  );
  const [internalDomain, setInternalDomain] = useState<ChartXViewportDomain | undefined>(undefined);
  const isControlled = controlledDomain != null;
  const lastEmittedRef = useRef<ChartXViewportDomain | undefined>(undefined);
  const panRef = useRef<{
    pointerId: number;
    startPlotX: number;
    startDomain: ChartXViewportDomain;
  } | null>(null);
  const rafRef = useRef<number>(0);
  const pendingDomainRef = useRef<ChartXViewportDomain | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const baseDomain = useMemo(() => {
    if (extents == null) {
      return undefined;
    }
    const controlled = resolveControlledChartXDomain(controlledDomain, xScale);
    if (controlled) {
      return clampXViewportDomain(controlled, extents, xScale);
    }
    if (internalDomain) {
      return clampXViewportDomain(internalDomain, extents, xScale);
    }
    return extents;
  }, [controlledDomain, extents, internalDomain, xScale]);

  const applyDomain = useCallback(
    (next: ChartXViewportDomain, reason: XViewportChangeReason) => {
      if (!extents) {
        return;
      }
      const clamped = clampXViewportDomain(next, extents, xScale, interaction.minSpan);
      lastEmittedRef.current = clamped;
      if (!isControlled) {
        setInternalDomain(clamped);
      }
      onXViewportChange?.(clamped, reason);
    },
    [extents, interaction.minSpan, isControlled, onXViewportChange, xScale],
  );

  const scheduleDomain = useCallback(
    (next: ChartXViewportDomain, reason: XViewportChangeReason) => {
      pendingDomainRef.current = next;
      if (rafRef.current) {
        return;
      }
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        const pending = pendingDomainRef.current;
        pendingDomainRef.current = null;
        if (pending) {
          applyDomain(pending, reason);
        }
      });
    },
    [applyDomain],
  );

  useEffect(
    () => () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      panRef.current = null;
    },
    [],
  );

  const resetViewport = useCallback(() => {
    if (!extents) {
      return;
    }
    applyDomain(extents, "reset");
  }, [applyDomain, extents]);

  const cancelPan = useCallback(() => {
    panRef.current = null;
    setIsPanning(false);
  }, []);

  const panByPlotDelta = useCallback(
    (deltaPlotPx: number, domain: ChartXViewportDomain, reason: XViewportChangeReason) => {
      if (!extents) {
        return;
      }
      scheduleDomain(panDomainByPlotDelta(domain, deltaPlotPx, plotWidth, extents, xScale), reason);
    },
    [extents, plotWidth, scheduleDomain, xScale],
  );

  const onPointerDown = useCallback(
    (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
      if (!enabled || !baseDomain || event.button !== 0 || plotWidth <= 0) {
        return;
      }
      const { position } = resolvePointerPlot(event, fallbackWidth, chartHeight);
      panRef.current = {
        pointerId: event.pointerId,
        startPlotX: position.plotX,
        startDomain: baseDomain,
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsPanning(true);
    },
    [baseDomain, chartHeight, enabled, fallbackWidth, plotWidth],
  );

  const onPointerMove = useCallback(
    (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
      const pan = panRef.current;
      if (!pan || pan.pointerId !== event.pointerId) {
        return;
      }
      const { position } = resolvePointerPlot(event, fallbackWidth, chartHeight);
      const delta = position.plotX - pan.startPlotX;
      if (Math.abs(delta) < 1) {
        return;
      }
      panByPlotDelta(delta, pan.startDomain, "pan");
    },
    [chartHeight, fallbackWidth, panByPlotDelta],
  );

  const onPointerUp = useCallback(
    (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
      const pan = panRef.current;
      if (!pan || pan.pointerId !== event.pointerId) {
        return;
      }
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      cancelPan();
    },
    [cancelPan],
  );

  const onPointerCancel = useCallback(
    (event: JSX.TargetedPointerEvent<SVGSVGElement>) => {
      if (panRef.current?.pointerId === event.pointerId) {
        cancelPan();
      }
    },
    [cancelPan],
  );

  const wheelMode: XViewportWheelZoomMode | false = useMemo(() => {
    if (!enabled || interaction.wheelZoom === false) {
      return false;
    }
    if (interaction.wheelZoom === true || interaction.wheelZoom === "focus") {
      return "focus";
    }
    return interaction.wheelZoom ?? "modifier";
  }, [enabled, interaction.wheelZoom]);

  const onWheel = useCallback(
    (event: JSX.TargetedWheelEvent<SVGSVGElement>) => {
      if (!wheelMode || !baseDomain || !extents || plotWidth <= 0) {
        return;
      }
      if (wheelMode === "modifier" && !event.altKey) {
        return;
      }
      if (wheelMode === "focus" && !isFocused) {
        return;
      }
      event.preventDefault();
      const { position } = resolvePointerPlot(event, fallbackWidth, chartHeight);
      const anchor =
        invertPlotXToComparable(position.plotX, {
          data,
          xKey,
          xScale,
          xDomain: baseDomain,
          plotWidth,
        }) ??
        (baseDomain[0] instanceof Date
          ? (baseDomain[0] as Date).getTime()
          : (baseDomain[0] as number));
      const factor = event.deltaY > 0 ? 1.12 : 1 / 1.12;
      const anchorValue = baseDomain[0] instanceof Date ? new Date(anchor) : (anchor as number);
      const zoomed = zoomXViewportDomain(
        baseDomain,
        factor,
        anchorValue instanceof Date ? anchorValue.getTime() : anchorValue,
        extents,
        xScale,
      );
      scheduleDomain(zoomed, "zoom");
    },
    [
      baseDomain,
      chartHeight,
      data,
      extents,
      fallbackWidth,
      isFocused,
      plotWidth,
      scheduleDomain,
      wheelMode,
      xKey,
      xScale,
    ],
  );

  const onFocus = useCallback(() => setIsFocused(true), []);
  const onBlur = useCallback(() => setIsFocused(false), []);

  const handleViewportKeyboard = useCallback(
    (event: KeyboardEvent): boolean => {
      if (!enabled || !baseDomain || !extents) {
        return false;
      }
      if (event.key === "Escape") {
        cancelPan();
        return true;
      }
      if (event.key === "r" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        resetViewport();
        return true;
      }
      if (!event.altKey) {
        return false;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        panByPlotDelta(-plotWidth * 0.08, baseDomain, "keyboard");
        return true;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        panByPlotDelta(plotWidth * 0.08, baseDomain, "keyboard");
        return true;
      }
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        const anchor =
          baseDomain[0] instanceof Date
            ? ((baseDomain[0] as Date).getTime() + (baseDomain[1] as Date).getTime()) / 2
            : ((baseDomain[0] as number) + (baseDomain[1] as number)) / 2;
        scheduleDomain(zoomXViewportDomain(baseDomain, 0.85, anchor, extents, xScale), "keyboard");
        return true;
      }
      if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        const anchor =
          baseDomain[0] instanceof Date
            ? ((baseDomain[0] as Date).getTime() + (baseDomain[1] as Date).getTime()) / 2
            : ((baseDomain[0] as number) + (baseDomain[1] as number)) / 2;
        scheduleDomain(zoomXViewportDomain(baseDomain, 1.15, anchor, extents, xScale), "keyboard");
        return true;
      }
      if (event.key === "Home") {
        event.preventDefault();
        resetViewport();
        return true;
      }
      return false;
    },
    [
      baseDomain,
      cancelPan,
      enabled,
      extents,
      panByPlotDelta,
      plotWidth,
      resetViewport,
      scheduleDomain,
      xScale,
    ],
  );

  const svgProps = useMemo(
    (): Record<string, unknown> =>
      enabled
        ? {
            "data-kamod-chart-viewport-interactive": "",
            "data-kamod-chart-viewport-panning": isPanning ? "" : undefined,
            onPointerDown,
            onPointerMove,
            onPointerUp,
            onPointerCancel,
            onWheel,
            onFocus,
            onBlur,
            "aria-keyshortcuts": "Alt+ArrowLeft Alt+ArrowRight Alt+= Alt+- R Home",
          }
        : {},
    [
      enabled,
      isPanning,
      onBlur,
      onFocus,
      onPointerCancel,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onWheel,
    ],
  );

  return {
    effectiveXDomain: baseDomain,
    isPanning,
    resetViewport,
    handleViewportKeyboard,
    svgProps,
    composeHandlers,
  };
};
