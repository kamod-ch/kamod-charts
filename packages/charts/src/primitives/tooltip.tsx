import type { ComponentChildren } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import type { ChartInteraction } from "../core";
import {
  calculateTooltipPlacement,
  defaultTooltipOffset,
  fallbackTooltipTransform,
  viewBoxToContainerPixels,
  type TooltipPlacement,
  type TooltipPlacementResult,
} from "./tooltip-placement";

export interface TooltipProps<TDatum> {
  interaction?: ChartInteraction<TDatum> | null;
  visible?: boolean;
  children?: (interaction: ChartInteraction<TDatum>) => ComponentChildren;
  placement?: TooltipPlacement;
  offset?: number;
}

const canUseResizeObserver = (): boolean =>
  typeof globalThis.ResizeObserver !== "undefined" &&
  typeof globalThis.ResizeObserver === "function";

const requestFrame = (callback: () => void): number => {
  if (typeof globalThis.requestAnimationFrame === "function") {
    return globalThis.requestAnimationFrame(callback);
  }

  callback();
  return 0;
};

const cancelFrame = (frame: number): void => {
  if (frame !== 0 && typeof globalThis.cancelAnimationFrame === "function") {
    globalThis.cancelAnimationFrame(frame);
  }
};

function formatDefaultContent<TDatum>(interaction: ChartInteraction<TDatum>): string {
  const name = interaction.label ?? interaction.seriesId;
  const value = interaction.value == null ? "–" : String(interaction.value);
  return `${name}: ${value}`;
}

const readViewBoxSize = (svg: Element | null): { width: number; height: number } | null => {
  if (!(svg instanceof SVGSVGElement)) {
    return null;
  }

  const viewBox = svg.viewBox.baseVal;
  if (viewBox.width > 0 && viewBox.height > 0) {
    return { width: viewBox.width, height: viewBox.height };
  }

  return {
    width: svg.width.baseVal.value || svg.clientWidth,
    height: svg.height.baseVal.value || svg.clientHeight,
  };
};

export const Tooltip = <TDatum,>({
  interaction,
  visible = Boolean(interaction),
  children,
  placement = "auto",
  offset = defaultTooltipOffset,
}: TooltipProps<TDatum>) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const [measured, setMeasured] = useState<TooltipPlacementResult | null>(null);

  useEffect(() => {
    if (!interaction || !visible) {
      setMeasured(null);
      return;
    }

    const anchorX = interaction.x;
    const anchorY = interaction.y;

    const measure = () => {
      const node = tooltipRef.current;
      if (!node) {
        return;
      }

      const container = node.closest("[data-kamod-chart-container]");
      if (!(container instanceof HTMLElement)) {
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const tooltipRect = node.getBoundingClientRect();
      if (containerRect.width <= 0 || tooltipRect.width <= 0 || tooltipRect.height <= 0) {
        return;
      }

      const svg = container.querySelector("[data-kamod-chart-surface]");
      const svgRect =
        svg instanceof Element
          ? svg.getBoundingClientRect()
          : {
              left: containerRect.left,
              top: containerRect.top,
              width: containerRect.width,
              height: containerRect.height,
            };
      const viewBox = readViewBoxSize(svg) ?? { width: svgRect.width, height: svgRect.height };
      const anchor = viewBoxToContainerPixels(anchorX, anchorY, viewBox, svgRect, containerRect);
      const next = calculateTooltipPlacement({
        anchorX: anchor.x,
        anchorY: anchor.y,
        tooltipWidth: tooltipRect.width,
        tooltipHeight: tooltipRect.height,
        boundaryWidth: containerRect.width,
        boundaryHeight: containerRect.height,
        placement,
        offset,
      });

      setMeasured((current) =>
        current &&
        current.left === next.left &&
        current.top === next.top &&
        current.placement === next.placement
          ? current
          : next,
      );
    };

    measure();

    const node = tooltipRef.current;
    const container =
      node?.closest("[data-kamod-chart-container]") ??
      (typeof node?.parentElement !== "undefined" ? node.parentElement : null);
    if (!node || !canUseResizeObserver() || !container) {
      return;
    }

    const observer = new globalThis.ResizeObserver(() => {
      cancelFrame(frameRef.current);
      frameRef.current = requestFrame(measure);
    });
    observer.observe(node);
    if (container instanceof Element) {
      observer.observe(container);
    }

    return () => {
      cancelFrame(frameRef.current);
      observer.disconnect();
    };
  }, [
    interaction?.index,
    interaction?.seriesId,
    interaction?.x,
    interaction?.y,
    offset,
    placement,
    visible,
  ]);

  if (!interaction || !visible) {
    return null;
  }

  const resolvedPlacement = measured?.placement ?? (placement === "auto" ? "top" : placement);

  return (
    <div
      ref={tooltipRef}
      data-kamod-chart-tooltip=""
      data-kamod-chart-tooltip-placement={resolvedPlacement}
      aria-hidden="true"
      style={{
        left: measured ? `${measured.left}px` : `${interaction.x}px`,
        top: measured ? `${measured.top}px` : `${interaction.y}px`,
        transform: measured ? "none" : fallbackTooltipTransform(placement, offset),
      }}
    >
      {children ? children(interaction) : formatDefaultContent(interaction)}
    </div>
  );
};
