import { useMemo, useState } from "preact/hooks";
import { useChartMotionContext } from "../animation/slots";
import { XAxis, YAxis } from "../axes";
import { Chart } from "../core";
import { createChartKeyboardHandler } from "../interaction";
import { Grid, Legend, ReferenceLine } from "../primitives";
import {
  AreaSeries as StaticAreaSeries,
  inferGroupedDomain,
  inferStackedDomain,
  StackedAreaSeries as StaticStackedAreaSeries,
} from "../series";
import { CartesianActiveCrosshair, CartesianActiveOverlay } from "./cartesian-active-layers";
import { getSeriesId } from "./series-identity";
import { isTooltipEnabled } from "./tooltip-options";
import type { AreaChartProps, CartesianSeriesConfig } from "./types";
import { useCartesianPointerState } from "./use-cartesian-pointer-state";

const findSeriesOriginalIndex = <TDatum,>(
  series: readonly CartesianSeriesConfig<TDatum>[],
  seriesId: string,
): number => series.findIndex((entry, index) => getSeriesId(entry, index) === seriesId);

export const AreaChart = <TDatum,>({
  data,
  xKey,
  xScale,
  series,
  width,
  height,
  initialWidth,
  responsive,
  title,
  description,
  id,
  showGrid = false,
  showLegend = false,
  tooltip = false,
  stacked = false,
  baseline = 0,
  opacity = 0.2,
  fill = "solid",
  outline = false,
  strokeWidth,
  strokeDasharray,
  showPoints = false,
  pointRadius,
  curve = "linear",
  referenceLines = [],
  animate,
}: AreaChartProps<TDatum>) => {
  const motion = useChartMotionContext();
  const AreaSeries = (motion.slots.AreaSeries ?? StaticAreaSeries) as typeof StaticAreaSeries;
  const StackedAreaSeries = (motion.slots.StackedAreaSeries ??
    StaticStackedAreaSeries) as typeof StaticStackedAreaSeries;
  const [hiddenSeries, setHiddenSeries] = useState<readonly string[]>([]);
  const visibleEntries = useMemo(
    () =>
      series
        .map((entry, originalIndex) => ({ entry, originalIndex }))
        .filter(
          ({ entry, originalIndex }) =>
            !entry.hidden && !hiddenSeries.includes(getSeriesId(entry, originalIndex)),
        ),
    [series, hiddenSeries],
  );
  const visibleSeries = visibleEntries.map(({ entry }) => entry);
  const [activeSeriesIndex, setActiveSeriesIndex] = useState(0);
  const stackSeries = visibleEntries.map(({ entry, originalIndex }) => ({
    id: getSeriesId(entry, originalIndex),
    value: entry.key,
    color: entry.color,
  }));
  const yDomain = useMemo(
    () => (stacked ? inferStackedDomain(data, stackSeries) : inferGroupedDomain(data, stackSeries)),
    [data, stacked, stackSeries],
  );
  const resolvedSeriesIndex =
    visibleSeries.length === 0 ? 0 : Math.min(activeSeriesIndex, visibleSeries.length - 1);
  const activeSeriesEntry = visibleEntries[resolvedSeriesIndex];
  const activeSeries = activeSeriesEntry?.entry;
  const activeSeriesId = activeSeriesEntry
    ? getSeriesId(activeSeriesEntry.entry, activeSeriesEntry.originalIndex)
    : null;
  const tooltipEnabled = isTooltipEnabled(tooltip);
  const fallbackWidth = width ?? initialWidth ?? 640;
  const chartHeight = height ?? 320;
  const {
    activeIndex,
    setActiveIndex,
    pointerPlot,
    onPointerMove,
    onPointerLeave,
    resetPointerPlot,
  } = useCartesianPointerState({
    data,
    xKey,
    xScale,
    fallbackWidth,
    height: chartHeight,
  });

  return (
    <Chart
      data={data}
      xKey={xKey}
      xScale={xScale}
      width={width}
      height={height}
      initialWidth={initialWidth}
      responsive={responsive}
      title={title}
      description={description}
      id={id}
      tabIndex={0}
      style={tooltipEnabled ? { cursor: "crosshair" } : undefined}
      onPointerMove={tooltipEnabled ? onPointerMove : undefined}
      onPointerLeave={tooltipEnabled ? onPointerLeave : undefined}
      onKeyDown={createChartKeyboardHandler({
        pointCount: data.length,
        seriesCount: Math.max(visibleSeries.length, 1),
        activeIndex: activeIndex ?? 0,
        activeSeriesIndex: resolvedSeriesIndex,
        onChange: (state) => {
          resetPointerPlot();
          setActiveIndex(state.activeIndex);
          setActiveSeriesIndex(state.activeSeriesIndex);
        },
        onEscape: () => {
          resetPointerPlot();
          setActiveIndex(null);
        },
      })}
      overlay={
        <>
          {showLegend ? (
            <Legend
              items={series.map((entry, index) => {
                const seriesId = getSeriesId(entry, index);
                return {
                  id: seriesId,
                  label: entry.label,
                  color: entry.color ?? `var(--chart-${(index % 4) + 1})`,
                  hidden: hiddenSeries.includes(seriesId),
                };
              })}
              onToggle={(seriesId) => {
                const togglingHide = !hiddenSeries.includes(seriesId);
                const toggledOriginalIndex = findSeriesOriginalIndex(series, seriesId);
                const currentActiveOriginalIndex = activeSeriesEntry?.originalIndex ?? null;

                setHiddenSeries((current) =>
                  togglingHide
                    ? [...current, seriesId]
                    : current.filter((entry) => entry !== seriesId),
                );

                if (togglingHide) {
                  if (activeSeriesId === seriesId) {
                    setActiveIndex(null);
                  } else if (
                    toggledOriginalIndex >= 0 &&
                    currentActiveOriginalIndex != null &&
                    toggledOriginalIndex < currentActiveOriginalIndex
                  ) {
                    setActiveSeriesIndex((current) => Math.max(0, current - 1));
                  }
                  return;
                }

                if (
                  toggledOriginalIndex >= 0 &&
                  currentActiveOriginalIndex != null &&
                  toggledOriginalIndex < currentActiveOriginalIndex
                ) {
                  setActiveSeriesIndex((current) =>
                    Math.min(current + 1, Math.max(visibleSeries.length, 1)),
                  );
                }
              }}
            />
          ) : null}
          <CartesianActiveOverlay
            activeIndex={activeIndex}
            activeSeries={activeSeries}
            visibleSeries={visibleSeries}
            xKey={xKey}
            xScale={xScale}
            yDomain={yDomain}
            tooltip={tooltip}
            defaultMode="axis"
            pointerPlot={pointerPlot}
          />
        </>
      }
    >
      {showGrid ? <Grid xKey={xKey} xScale={xScale} yDomain={yDomain} /> : null}
      <CartesianActiveCrosshair
        activeIndex={activeIndex}
        activeSeries={activeSeries}
        visibleSeries={visibleSeries}
        xKey={xKey}
        xScale={xScale}
        yDomain={yDomain}
        tooltip={tooltip}
        defaultMode="axis"
        pointerPlot={pointerPlot}
      />
      <XAxis dataKey={xKey} scale={xScale} />
      <YAxis domain={yDomain} />
      {referenceLines.map((line, index) => (
        <ReferenceLine
          key={index}
          x={line.x}
          y={line.y}
          yDomain={yDomain}
          label={line.label}
          color={line.color}
          yKey={line.yKey}
          xKey={xKey}
          xScale={xScale}
        />
      ))}
      {stacked ? (
        <StackedAreaSeries
          series={stackSeries}
          xKey={xKey}
          xScale={xScale}
          yDomain={yDomain}
          opacity={opacity}
          fill={fill}
          curve={curve}
          outline={outline}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          showPoints={showPoints}
          pointRadius={pointRadius}
          activeIndex={activeIndex}
          activeSeriesId={activeSeriesId}
          {...(animate === undefined ? {} : { animate })}
        />
      ) : (
        visibleEntries.map(({ entry, originalIndex }) => (
          <AreaSeries
            key={getSeriesId(entry, originalIndex)}
            id={getSeriesId(entry, originalIndex)}
            dataKey={entry.key}
            yDomain={yDomain}
            color={entry.color ?? `var(--chart-${(originalIndex % 4) + 1})`}
            baseline={baseline}
            opacity={opacity}
            fill={fill}
            outline={outline}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            showPoints={showPoints}
            pointRadius={pointRadius}
            curve={curve}
            activeIndex={activeSeriesId === getSeriesId(entry, originalIndex) ? activeIndex : null}
            {...(animate === undefined ? {} : { animate })}
          />
        ))
      )}
    </Chart>
  );
};
