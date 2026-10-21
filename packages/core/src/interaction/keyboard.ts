import type { KeyboardEventHandler } from "preact";

export interface KeyboardNavigationState {
  activeIndex: number;
  activeSeriesIndex: number;
}

export interface KeyboardNavigationOptions {
  pointCount: number;
  seriesCount: number;
  activeIndex: number;
  activeSeriesIndex: number;
  onChange: (state: KeyboardNavigationState) => void;
  onSelect?: (state: KeyboardNavigationState) => void;
  onEscape?: () => void;
}

const clamp = (value: number, max: number): number =>
  Math.min(Math.max(value, 0), Math.max(max, 0));

export const createChartKeyboardHandler =
  ({
    pointCount,
    seriesCount,
    activeIndex,
    activeSeriesIndex,
    onChange,
    onSelect,
    onEscape,
  }: KeyboardNavigationOptions): KeyboardEventHandler<SVGSVGElement> =>
  (event) => {
    if (pointCount <= 0 || seriesCount <= 0) {
      return;
    }

    let nextIndex = activeIndex;
    let nextSeriesIndex = activeSeriesIndex;

    if (event.key === "ArrowRight") {
      nextIndex = clamp(activeIndex + 1, pointCount - 1);
    } else if (event.key === "ArrowLeft") {
      nextIndex = clamp(activeIndex - 1, pointCount - 1);
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = pointCount - 1;
    } else if (event.key === "ArrowDown") {
      nextSeriesIndex = clamp(activeSeriesIndex + 1, seriesCount - 1);
    } else if (event.key === "ArrowUp") {
      nextSeriesIndex = clamp(activeSeriesIndex - 1, seriesCount - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect?.({ activeIndex, activeSeriesIndex });
      return;
    } else if (event.key === "Escape") {
      event.preventDefault();
      onEscape?.();
      return;
    } else {
      return;
    }

    event.preventDefault();
    onChange({ activeIndex: nextIndex, activeSeriesIndex: nextSeriesIndex });
  };
