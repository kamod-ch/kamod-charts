import { useCallback, useMemo, useState } from "preact/hooks";
import { useChartMotionContext } from "../animation/slots";
import { Chart } from "../core";
import { Legend } from "../primitives";
import { normalizePieData, resolveNextActiveIndexAfterHide } from "../series/pie-geometry";
import { PieSeries as StaticPieSeries } from "../series";
import { PieActiveOverlay } from "./pie-active-layers";
import { isPieTooltipEnabled } from "./pie-tooltip-options";
import type { PieChartProps } from "./types";

export const PieChart = <TDatum,>({
  data,
  valueKey,
  labelKey,
  width,
  height,
  initialWidth,
  responsive,
  title,
  description,
  id,
  innerRadius = 0,
  outerRadius,
  padAngle = 0,
  cornerRadius = 0,
  sort = false,
  labels = "inside",
  rose,
  colors,
  centerContent,
  emptyContent,
  activeOffset,
  tooltip = false,
  showLegend = false,
  legend,
  onSegmentClick,
  animate,
}: PieChartProps<TDatum>) => {
  const motion = useChartMotionContext();
  const PieSeries = (motion.slots.PieSeries ?? StaticPieSeries) as typeof StaticPieSeries;
  const tooltipEnabled = isPieTooltipEnabled(tooltip);
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

  const moveVisible = (direction: 1 | -1) => {
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
  };

  const handleSlicePointer = useCallback((index: number) => {
    setPointerIndex(index);
  }, []);

  const handleSlicePointerLeave = useCallback(() => {
    setPointerIndex(null);
  }, []);

  const clearInteraction = useCallback(() => {
    setKeyboardIndex(null);
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

  const overlay = (
    <>
      {showLegend ? (
        <Legend items={legendItems} onToggle={legendInteractive ? handleLegendToggle : undefined} />
      ) : null}
      {tooltipEnabled ? (
        <PieActiveOverlay
          keyboardIndex={keyboardIndex}
          pointerIndex={pointerIndex}
          tooltip={tooltip}
          valueKey={valueKey}
          labelKey={labelKey}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          padAngle={padAngle}
          cornerRadius={cornerRadius}
          sort={sort}
          colors={colors}
          hiddenKeys={hiddenKeys}
          activeOffset={activeOffset}
          rose={rose}
          labels={labels}
        />
      ) : null}
    </>
  );

  return (
    <Chart
      data={data}
      width={width}
      height={height}
      initialWidth={initialWidth}
      responsive={responsive}
      title={title}
      description={description}
      id={id}
      tabIndex={0}
      style={tooltipEnabled ? { cursor: "default" } : undefined}
      onKeyDown={(event) => {
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
      }}
      overlay={showLegend || tooltipEnabled ? overlay : undefined}
    >
      <PieSeries
        valueKey={valueKey}
        labelKey={labelKey}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        padAngle={padAngle}
        cornerRadius={cornerRadius}
        sort={sort}
        hiddenKeys={hiddenKeys}
        activeIndex={activeIndex}
        activeOffset={activeOffset}
        colors={colors}
        labels={labels}
        rose={rose}
        centerContent={centerContent}
        emptyContent={emptyContent}
        onSegmentClick={onSegmentClick}
        onSlicePointerEnter={
          tooltipEnabled ? (event) => handleSlicePointer(event.context.index) : undefined
        }
        onSlicePointerMove={
          tooltipEnabled ? (event) => handleSlicePointer(event.context.index) : undefined
        }
        onSlicePointerLeave={tooltipEnabled ? handleSlicePointerLeave : undefined}
        {...(animate === undefined ? {} : { animate })}
      />
    </Chart>
  );
};
