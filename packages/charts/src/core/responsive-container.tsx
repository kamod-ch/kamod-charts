import type { ComponentChildren } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { clampDimension } from "./chart-layout";

export interface ResponsiveContainerRenderState {
  width: number;
  containerRef: (element: HTMLDivElement | null) => void;
}

export interface ResponsiveContainerProps {
  width?: number;
  initialWidth: number;
  responsive?: boolean;
  class?: string;
  children: (state: ResponsiveContainerRenderState) => ComponentChildren;
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

export const ResponsiveContainer = ({
  width,
  initialWidth,
  responsive = false,
  class: className,
  children,
}: ResponsiveContainerProps) => {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef(0);
  const [measuredWidth, setMeasuredWidth] = useState(() =>
    clampDimension(responsive ? initialWidth : (width ?? initialWidth)),
  );

  const containerRef = (element: HTMLDivElement | null) => {
    elementRef.current = element;
  };

  useEffect(() => {
    if (!responsive) {
      setMeasuredWidth(clampDimension(width ?? initialWidth));
      return;
    }

    const element = elementRef.current;
    if (!element || !canUseResizeObserver()) {
      return;
    }

    const observer = new globalThis.ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect.width;
      if (typeof nextWidth !== "number") {
        return;
      }

      cancelFrame(frameRef.current);
      frameRef.current = requestFrame(() => {
        setMeasuredWidth(clampDimension(nextWidth));
      });
    });

    observer.observe(element);

    return () => {
      cancelFrame(frameRef.current);
      observer.disconnect();
    };
  }, [initialWidth, responsive, width]);

  return (
    <div
      class={className}
      data-kamod-chart-container=""
      ref={containerRef}
      style={{ position: "relative" }}
    >
      {children({ width: measuredWidth, containerRef })}
    </div>
  );
};
