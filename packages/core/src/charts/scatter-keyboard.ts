import type { KeyboardEventHandler } from "preact";
import type { ScatterInteractionTarget } from "./scatter-interaction";

export interface ScatterKeyboardNavigationState {
  activeIndex: number;
  activeSeriesIndex: number;
}

export interface ScatterKeyboardNavigationOptions {
  targets: readonly ScatterInteractionTarget[];
  activeIndex: number | null;
  activeSeriesIndex: number;
  onChange: (state: ScatterKeyboardNavigationState) => void;
  onSelect?: (state: ScatterKeyboardNavigationState) => void;
  onEscape?: () => void;
}

const findTargetPosition = (
  targets: readonly ScatterInteractionTarget[],
  activeIndex: number,
  activeSeriesIndex: number,
): number =>
  targets.findIndex(
    (target) => target.index === activeIndex && target.seriesIndex === activeSeriesIndex,
  );

const clampTargetPosition = (position: number, targetCount: number): number =>
  Math.min(Math.max(position, 0), Math.max(targetCount - 1, 0));

const seriesTargetAtIndex = (
  targets: readonly ScatterInteractionTarget[],
  index: number,
  seriesIndex: number,
): ScatterInteractionTarget | undefined =>
  targets.find((target) => target.index === index && target.seriesIndex === seriesIndex);

export const createScatterKeyboardHandler =
  ({
    targets,
    activeIndex,
    activeSeriesIndex,
    onChange,
    onSelect,
    onEscape,
  }: ScatterKeyboardNavigationOptions): KeyboardEventHandler<SVGSVGElement> =>
  (event) => {
    if (targets.length === 0) {
      if (event.key === "Escape") {
        event.preventDefault();
        onEscape?.();
      }
      return;
    }

    const currentPosition =
      activeIndex == null ? -1 : findTargetPosition(targets, activeIndex, activeSeriesIndex);
    const fallbackPosition = currentPosition >= 0 ? currentPosition : 0;
    const currentTarget = targets[fallbackPosition] ?? targets[0]!;

    if (event.key === "Enter" || event.key === " ") {
      if (currentPosition >= 0) {
        event.preventDefault();
        onSelect?.({
          activeIndex: currentTarget.index,
          activeSeriesIndex: currentTarget.seriesIndex,
        });
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      onEscape?.();
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      const next = targets[clampTargetPosition(fallbackPosition + 1, targets.length)]!;
      onChange({ activeIndex: next.index, activeSeriesIndex: next.seriesIndex });
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      const next = targets[clampTargetPosition(fallbackPosition - 1, targets.length)]!;
      onChange({ activeIndex: next.index, activeSeriesIndex: next.seriesIndex });
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      const next = targets[0]!;
      onChange({ activeIndex: next.index, activeSeriesIndex: next.seriesIndex });
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      const next = targets[targets.length - 1]!;
      onChange({ activeIndex: next.index, activeSeriesIndex: next.seriesIndex });
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const sameRow = targets
        .filter((target) => target.index === currentTarget.index)
        .sort((left, right) => left.seriesIndex - right.seriesIndex);
      const rowPosition = sameRow.findIndex(
        (target) =>
          target.index === currentTarget.index && target.seriesIndex === currentTarget.seriesIndex,
      );
      const nextInRow = rowPosition >= 0 ? sameRow[rowPosition + direction] : undefined;

      if (nextInRow) {
        onChange({ activeIndex: nextInRow.index, activeSeriesIndex: nextInRow.seriesIndex });
        return;
      }

      const adjacent = seriesTargetAtIndex(
        targets,
        currentTarget.index,
        currentTarget.seriesIndex + direction,
      );
      if (adjacent) {
        onChange({ activeIndex: adjacent.index, activeSeriesIndex: adjacent.seriesIndex });
        return;
      }

      const next = targets[clampTargetPosition(fallbackPosition + direction, targets.length)]!;
      onChange({ activeIndex: next.index, activeSeriesIndex: next.seriesIndex });
    }
  };
