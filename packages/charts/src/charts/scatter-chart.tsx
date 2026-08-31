import { useMemo, useState } from "preact/hooks";
import { XAxis, YAxis } from "../axes";
import { Chart } from "../core";
import { createChartKeyboardHandler, getPointerPosition } from "../interaction";
import { Grid, Legend, ReferenceLine } from "../primitives";
import { useChartMotionContext } from "../animation/slots";
import { inferCombinedNumericDomain, ScatterSeries as StaticScatterSeries } from "../series";
import { CartesianActiveCrosshair, CartesianActiveOverlay } from "./cartesian-active-layers";
import { findNearestCartesianPoint, resolvePlotAreaFromSize } from "./cartesian-interaction";
import { isTooltipEnabled } from "./tooltip-options";
import type { ScatterChartProps } from "./types";

export const ScatterChart = <TDatum,>({
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
  pointSize = 4,
  referenceLines = [],
  animate,
}: ScatterChartProps<TDatum>) => {
  const motion = useChartMotionContext();
  const ScatterSeries = (motion.slots.ScatterSeries ??
    StaticScatterSeries) as typeof StaticScatterSeries;
  const [hiddenSeries, setHiddenSeries] = useState<readonly string[]>([]);
  const visibleSeries = series.filter(
    (entry) => !entry.hidden && !hiddenSeries.includes(entry.id ?? String(entry.key)),
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeSeriesIndex, setActiveSeriesIndex] = useState(0);
  const yDomain = useMemo(
    () =>
      inferCombinedNumericDomain(
        data,
        visibleSeries.map((entry) => entry.key),
      ),
    [data, visibleSeries],
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
              const size = {
                width: event.currentTarget.viewBox.baseVal.width || fallbackWidth,
                height: event.currentTarget.viewBox.baseVal.height || height,
              };
              const nextPlot = resolvePlotAreaFromSize(size.width, size.height);
              const position = getPointerPosition(event, nextPlot);
              const hit = findNearestCartesianPoint({
                data,
                series: visibleSeries,
                xKey,
                xScale,
                yDomain,
                plotWidth: nextPlot.width,
                plotHeight: nextPlot.height,
                plotX: position.plotX,
                plotY: position.plotY,
              });
              if (!hit) {
                setActiveIndex(null);
                return;
              }
              setActiveIndex(hit.index);
              setActiveSeriesIndex(hit.seriesIndex);
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
              items={series.map((entry, index) => ({
                id: entry.id ?? String(entry.key),
                label: entry.label,
                color: entry.color ?? `var(--chart-${(index % 4) + 1})`,
                hidden: hiddenSeries.includes(entry.id ?? String(entry.key)),
              }))}
              onToggle={(seriesId) =>
                setHiddenSeries((current) =>
                  current.includes(seriesId)
                    ? current.filter((entry) => entry !== seriesId)
                    : [...current, seriesId],
                )
              }
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
            defaultMode="nearest"
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
        defaultMode="nearest"
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
      {visibleSeries.map((entry, index) => (
        <ScatterSeries
          key={entry.id ?? String(entry.key)}
          id={entry.id ?? String(entry.key)}
          yKey={entry.key}
          yDomain={yDomain}
          color={entry.color ?? `var(--chart-${(index % 4) + 1})`}
          size={pointSize}
          activeIndex={entry === activeSeries ? activeIndex : null}
          {...(animate === undefined ? {} : { animate })}
        />
      ))}
    </Chart>
  );
};
