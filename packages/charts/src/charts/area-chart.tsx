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
import { findNearestCartesianIndexByX } from "./cartesian-interaction";
import { resolvePointerPlot } from "./chart-pointer";
import { getSeriesId } from "./series-identity";
import { isTooltipEnabled } from "./tooltip-options";
import type { AreaChartProps } from "./types";

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
  outline = false,
  curve = "linear",
  referenceLines = [],
  animate,
}: AreaChartProps<TDatum>) => {
  const motion = useChartMotionContext();
  const AreaSeries = (motion.slots.AreaSeries ?? StaticAreaSeries) as typeof StaticAreaSeries;
  const StackedAreaSeries = (motion.slots.StackedAreaSeries ??
    StaticStackedAreaSeries) as typeof StaticStackedAreaSeries;
  const [hiddenSeries, setHiddenSeries] = useState<readonly string[]>([]);
  const visibleSeries = series.filter(
    (entry, index) => !entry.hidden && !hiddenSeries.includes(getSeriesId(entry, index)),
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeSeriesIndex, setActiveSeriesIndex] = useState(0);
  const stackSeries = visibleSeries.map((entry, index) => ({
    id: getSeriesId(entry, index),
    value: entry.key,
    color: entry.color,
  }));
  const yDomain = useMemo(
    () => (stacked ? inferStackedDomain(data, stackSeries) : inferGroupedDomain(data, stackSeries)),
    [data, stacked, stackSeries],
  );
  const resolvedSeriesIndex =
    visibleSeries.length === 0 ? 0 : Math.min(activeSeriesIndex, visibleSeries.length - 1);
  const activeSeries = visibleSeries[resolvedSeriesIndex];
  const tooltipEnabled = isTooltipEnabled(tooltip);
  const fallbackWidth = width ?? initialWidth ?? 640;

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
      onPointerMove={
        tooltipEnabled
          ? (event) => {
              const { plot, position } = resolvePointerPlot(event, fallbackWidth, height);
              setActiveIndex(
                findNearestCartesianIndexByX({
                  data,
                  xKey,
                  xScale,
                  plotWidth: plot.width,
                  plotX: position.plotX,
                }),
              );
            }
          : undefined
      }
      onPointerLeave={tooltipEnabled ? () => setActiveIndex(null) : undefined}
      onKeyDown={createChartKeyboardHandler({
        pointCount: data.length,
        seriesCount: Math.max(visibleSeries.length, 1),
        activeIndex: activeIndex ?? 0,
        activeSeriesIndex: resolvedSeriesIndex,
        onChange: (state) => {
          setActiveIndex(state.activeIndex);
          setActiveSeriesIndex(state.activeSeriesIndex);
        },
        onEscape: () => setActiveIndex(null),
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
                const activeId = activeSeries
                  ? getSeriesId(activeSeries, resolvedSeriesIndex)
                  : null;
                setHiddenSeries((current) =>
                  current.includes(seriesId)
                    ? current.filter((entry) => entry !== seriesId)
                    : [...current, seriesId],
                );
                if (activeId === seriesId) {
                  setActiveIndex(null);
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
          {...(animate === undefined ? {} : { animate })}
        />
      ) : (
        visibleSeries.map((entry, index) => (
          <AreaSeries
            key={getSeriesId(entry, index)}
            id={getSeriesId(entry, index)}
            dataKey={entry.key}
            yDomain={yDomain}
            color={entry.color ?? `var(--chart-${(index % 4) + 1})`}
            baseline={baseline}
            opacity={opacity}
            outline={outline}
            curve={curve}
            {...(animate === undefined ? {} : { animate })}
          />
        ))
      )}
    </Chart>
  );
};
