import type { JSX } from "preact";
import { useCallback, useMemo, useRef, useState } from "preact/hooks";
import { useChartContext, type ChartCartesianScaleKind, type DataAccessor } from "../core";
import {
  clampXViewportDomain,
  normalizeChartXDomain,
  panXViewportDomain,
  type ChartXViewportDomain,
} from "../charts/x-viewport";
import { resolvePointerPlot } from "../charts/chart-pointer";
import { invertPlotXToComparable, projectXValueToPlot } from "../charts/x-viewport-coordinates";

export type CartesianXBrushChangeReason = "brush" | "keyboard";

export interface CartesianXBrushProps<TDatum> {
  selection: ChartXViewportDomain;
  extents: ChartXViewportDomain;
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ChartCartesianScaleKind;
  minSpan?: number;
  onSelectionChange: (domain: ChartXViewportDomain, reason: CartesianXBrushChangeReason) => void;
}

const HANDLE_WIDTH = 8;

const toComparable = (domain: ChartXViewportDomain, index: 0 | 1): number => {
  const value = normalizeChartXDomain(domain)[index];
  return value instanceof Date ? value.getTime() : (value as number);
};

const fromComparable = (
  start: number,
  end: number,
  template: ChartXViewportDomain,
): ChartXViewportDomain => {
  if (template[0] instanceof Date) {
    return [new Date(start), new Date(end)];
  }
  return [start, end];
};

export const CartesianXBrush = <TDatum,>({
  selection,
  extents,
  xKey,
  xScale,
  minSpan,
  onSelectionChange,
}: CartesianXBrushProps<TDatum>) => {
  const { data, plotArea } = useChartContext<TDatum>();
  const plotWidth = plotArea.width;
  const plotHeight = plotArea.height;
  const dragRef = useRef<{
    mode: "move" | "resize-start" | "resize-end";
    pointerId: number;
    startPlotX: number;
    startSelection: ChartXViewportDomain;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const project = useCallback(
    (value: number | Date) =>
      projectXValueToPlot(value, {
        data,
        xKey,
        xScale,
        xDomain: extents,
        plotWidth,
      }),
    [data, extents, plotWidth, xKey, xScale],
  );

  const left = project(selection[0]);
  const right = project(selection[1]);
  const selectionReady = left != null && right != null && right > left;

  const emit = useCallback(
    (next: ChartXViewportDomain, reason: CartesianXBrushChangeReason) => {
      onSelectionChange(clampXViewportDomain(next, extents, xScale, minSpan), reason);
    },
    [extents, minSpan, onSelectionChange, xScale],
  );

  const plotXFromEvent = useCallback(
    (event: JSX.TargetedPointerEvent<Element>, fallbackHeight: number) =>
      resolvePointerPlot(event, plotWidth, fallbackHeight).position.plotX,
    [plotWidth],
  );

  const onPointerDown = (
    event: JSX.TargetedPointerEvent<SVGElement>,
    mode: "move" | "resize-start" | "resize-end",
  ) => {
    if (!selectionReady) {
      return;
    }
    event.preventDefault();
    (event.currentTarget as SVGElement).setPointerCapture(event.pointerId);
    const plotX = plotXFromEvent(event, plotHeight);
    dragRef.current = {
      mode,
      pointerId: event.pointerId,
      startPlotX: plotX,
      startSelection: selection,
    };
    setIsDragging(true);
  };

  const onPointerMove = (event: JSX.TargetedPointerEvent<SVGElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }
    const plotX = plotXFromEvent(event, plotHeight);
    const deltaPlot = plotX - drag.startPlotX;
    const startMs = toComparable(drag.startSelection, 0);
    const endMs = toComparable(drag.startSelection, 1);
    const span = endMs - startMs;
    const deltaDomain = (-deltaPlot / plotWidth) * span;

    if (drag.mode === "move") {
      emit(panXViewportDomain(drag.startSelection, deltaDomain, extents, xScale), "brush");
      return;
    }

    const pointerComparable = invertPlotXToComparable(plotX, {
      data,
      xKey,
      xScale,
      xDomain: extents,
      plotWidth,
    });
    if (pointerComparable == null) {
      return;
    }

    if (drag.mode === "resize-start") {
      emit(fromComparable(pointerComparable, endMs, drag.startSelection), "brush");
      return;
    }
    emit(fromComparable(startMs, pointerComparable, drag.startSelection), "brush");
  };

  const endDrag = (event: JSX.TargetedPointerEvent<SVGElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
      setIsDragging(false);
      (event.currentTarget as SVGElement).releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (event: JSX.TargetedKeyboardEvent<SVGElement>) => {
    const step = event.shiftKey ? 0.05 : 0.01;
    const [start, end] = domainComparableBounds(selection);
    const span = end - start;
    const delta = span * step;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      emit(panXViewportDomain(selection, -delta, extents, xScale), "keyboard");
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      emit(panXViewportDomain(selection, delta, extents, xScale), "keyboard");
    } else if (event.key === "ArrowUp" && event.altKey) {
      event.preventDefault();
      const nextEnd = end + delta;
      emit(fromComparable(start, nextEnd, selection), "keyboard");
    } else if (event.key === "ArrowDown" && event.altKey) {
      event.preventDefault();
      const nextStart = start + delta;
      emit(fromComparable(nextStart, end, selection), "keyboard");
    }
  };

  const shadeRects = useMemo(() => {
    if (!selectionReady) {
      return null;
    }
    return (
      <>
        <rect
          x={0}
          y={0}
          width={Math.max(0, left!)}
          height={plotHeight}
          fill="var(--chart-reference-area)"
          fill-opacity={0.45}
          pointer-events="none"
        />
        <rect
          x={right!}
          y={0}
          width={Math.max(0, plotWidth - right!)}
          height={plotHeight}
          fill="var(--chart-reference-area)"
          fill-opacity={0.45}
          pointer-events="none"
        />
      </>
    );
  }, [left, plotHeight, plotWidth, right, selectionReady]);

  if (!selectionReady) {
    return null;
  }

  const selectionWidth = right! - left!;

  return (
    <g
      data-kamod-cartesian-x-brush=""
      role="group"
      aria-label="Time range brush"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      data-kamod-cartesian-x-brush-dragging={isDragging ? "" : undefined}
    >
      {shadeRects}
      <rect
        x={left!}
        y={0}
        width={selectionWidth}
        height={plotHeight}
        fill="transparent"
        stroke="var(--chart-axis)"
        stroke-width={1}
        onPointerDown={(event) => onPointerDown(event, "move")}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      />
      <rect
        role="slider"
        aria-label="Range start"
        aria-valuemin={toComparable(extents, 0)}
        aria-valuemax={toComparable(extents, 1)}
        aria-valuenow={toComparable(selection, 0)}
        x={left! - HANDLE_WIDTH / 2}
        y={0}
        width={HANDLE_WIDTH}
        height={plotHeight}
        fill="var(--chart-axis)"
        fill-opacity={0.35}
        onPointerDown={(event) => onPointerDown(event, "resize-start")}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      />
      <rect
        role="slider"
        aria-label="Range end"
        aria-valuemin={toComparable(extents, 0)}
        aria-valuemax={toComparable(extents, 1)}
        aria-valuenow={toComparable(selection, 1)}
        x={right! - HANDLE_WIDTH / 2}
        y={0}
        width={HANDLE_WIDTH}
        height={plotHeight}
        fill="var(--chart-axis)"
        fill-opacity={0.35}
        onPointerDown={(event) => onPointerDown(event, "resize-end")}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      />
    </g>
  );
};

function domainComparableBounds(domain: ChartXViewportDomain): readonly [number, number] {
  const [start, end] = normalizeChartXDomain(domain);
  if (start instanceof Date && end instanceof Date) {
    return [start.getTime(), end.getTime()];
  }
  return [start as number, end as number];
}
