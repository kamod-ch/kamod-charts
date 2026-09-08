import { useCallback, useMemo, useState } from "preact/hooks";
import type { DataAccessor } from "../core";
import {
  normalizePieData,
  resolveNextActiveIndexAfterHide,
  type PieSortComparator,
} from "../series/pie-geometry";
import type { PieLegendOptions } from "./types";

export interface CircularChartControllerOptions<TDatum> {
  data: readonly TDatum[];
  valueKey: DataAccessor<TDatum, number | null | undefined>;
  labelKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  colors?: readonly string[];
  sort?: boolean | PieSortComparator<TDatum>;
  legend?: PieLegendOptions;
}

export interface CircularChartCenterMetrics {
  total: number;
  grandTotal: number;
  visibleCount: number;
  segmentCount: number;
}

export interface CircularChartController<TDatum> {
  hiddenKeys: readonly string[];
  pieModel: ReturnType<typeof normalizePieData<TDatum>>;
  visibleIndices: readonly number[];
  legendItems: Array<{ id: string; label: string; color: string; hidden: boolean }>;
  keyboardIndex: number | null;
  pointerIndex: number | null;
  activeIndex: number | null;
  legendInteractive: boolean;
  centerMetrics: CircularChartCenterMetrics;
  handleLegendToggle: (key: string) => void;
  handleSlicePointer: (index: number) => void;
  handleSlicePointerLeave: () => void;
  handleChartKeyDown: (event: KeyboardEvent) => void;
}

export const useCircularChartController = <TDatum>({
  data,
  valueKey,
  labelKey,
  colors,
  sort = false,
  legend,
  onSegmentClick,
}: CircularChartControllerOptions<TDatum> & {
  onSegmentClick?: (datum: TDatum, index: number, value: number) => void;
}): CircularChartController<TDatum> => {
  const legendInteractive = legend?.interactive !== false;
  const [hiddenKeys, setHiddenKeys] = useState<readonly string[]>([]);
  const pieModel = useMemo(
    () =>
      normalizePieData({
        data,
        valueKey,
        labelKey,
        colors,
        sort,
        hiddenKeys,
      }),
    [colors, data, hiddenKeys, labelKey, sort, valueKey],
  );
  const unfilteredModel = useMemo(
    () =>
      normalizePieData({
        data,
        valueKey,
        labelKey,
        colors,
        sort,
      }),
    [colors, data, labelKey, sort, valueKey],
  );
  const visibleIndices = useMemo(() => pieModel.visible.map((entry) => entry.index), [pieModel]);
  const legendItems = useMemo(
    () =>
      pieModel.entries
        .filter((entry) => entry.value > 0)
        .map((entry) => ({
          id: entry.key,
          label: entry.label,
          color: entry.color,
          hidden: hiddenKeys.includes(entry.key),
        })),
    [hiddenKeys, pieModel.entries],
  );
  const [keyboardIndex, setKeyboardIndex] = useState<number | null>(null);
  const [pointerIndex, setPointerIndex] = useState<number | null>(null);
  const activeIndex = pointerIndex ?? keyboardIndex;

  const centerMetrics = useMemo(
    (): CircularChartCenterMetrics => ({
      total: pieModel.total,
      grandTotal: unfilteredModel.total,
      visibleCount: pieModel.visible.length,
      segmentCount: unfilteredModel.visible.length,
    }),
    [
      pieModel.total,
      pieModel.visible.length,
      unfilteredModel.total,
      unfilteredModel.visible.length,
    ],
  );

  const moveVisible = useCallback(
    (direction: 1 | -1) => {
      if (visibleIndices.length === 0) {
        return;
      }

      const currentPosition =
        keyboardIndex === null
          ? direction === 1
            ? -1
            : visibleIndices.length
          : visibleIndices.indexOf(keyboardIndex);

      const nextPosition = Math.min(
        Math.max(currentPosition + direction, 0),
        visibleIndices.length - 1,
      );
      setKeyboardIndex(visibleIndices[nextPosition] ?? null);
    },
    [keyboardIndex, visibleIndices],
  );

  const clearInteraction = useCallback(() => {
    setKeyboardIndex(null);
    setPointerIndex(null);
  }, []);

  const handleSlicePointer = useCallback((index: number) => {
    setPointerIndex(index);
  }, []);

  const handleSlicePointerLeave = useCallback(() => {
    setPointerIndex(null);
  }, []);

  const handleLegendToggle = useCallback(
    (key: string) => {
      if (!legendInteractive) {
        return;
      }

      const togglingHide = !hiddenKeys.includes(key);
      const nextHidden = togglingHide
        ? [...hiddenKeys, key]
        : hiddenKeys.filter((entry) => entry !== key);
      const entry = pieModel.entries.find((item) => item.key === key);

      if (togglingHide && entry) {
        const nextModel = normalizePieData({
          data,
          valueKey,
          labelKey,
          colors,
          sort,
          hiddenKeys: nextHidden,
        });
        const nextVisibleIndices = nextModel.visible.map((item) => item.index);

        if (keyboardIndex === entry.index) {
          setKeyboardIndex(
            resolveNextActiveIndexAfterHide(entry.index, visibleIndices, nextVisibleIndices),
          );
        }

        if (pointerIndex === entry.index) {
          setPointerIndex(
            resolveNextActiveIndexAfterHide(entry.index, visibleIndices, nextVisibleIndices),
          );
        }
      }

      setHiddenKeys(nextHidden);
    },
    [
      colors,
      data,
      hiddenKeys,
      keyboardIndex,
      labelKey,
      legendInteractive,
      pieModel.entries,
      pointerIndex,
      sort,
      valueKey,
      visibleIndices,
    ],
  );

  const handleChartKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (visibleIndices.length === 0) {
        return;
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        moveVisible(1);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        moveVisible(-1);
      } else if (event.key === "Home") {
        event.preventDefault();
        setKeyboardIndex(visibleIndices[0] ?? null);
      } else if (event.key === "End") {
        event.preventDefault();
        setKeyboardIndex(visibleIndices[visibleIndices.length - 1] ?? null);
      } else if (event.key === "Escape") {
        event.preventDefault();
        clearInteraction();
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (keyboardIndex === null) {
          return;
        }

        const entry = pieModel.entries[keyboardIndex];
        if (!entry || entry.value <= 0 || hiddenKeys.includes(entry.key)) {
          return;
        }

        onSegmentClick?.(entry.datum, entry.index, entry.value);
      }
    },
    [
      clearInteraction,
      hiddenKeys,
      keyboardIndex,
      moveVisible,
      onSegmentClick,
      pieModel.entries,
      visibleIndices,
    ],
  );

  return {
    hiddenKeys,
    pieModel,
    visibleIndices,
    legendItems,
    keyboardIndex,
    pointerIndex,
    activeIndex,
    legendInteractive,
    centerMetrics,
    handleLegendToggle,
    handleSlicePointer,
    handleSlicePointerLeave,
    handleChartKeyDown,
  };
};
