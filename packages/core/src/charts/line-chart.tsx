import { useMemo, useState } from "preact/hooks";
import { useChartMotionContext } from "../animation/slots";
import { XAxis, YAxis } from "../axes";
import { Chart } from "../core";
import { createChartKeyboardHandler } from "../interaction";
import { Grid, Legend, ReferenceLine } from "../primitives";
import { inferCombinedNumericDomain, LineSeries as StaticLineSeries } from "../series";
import { CartesianActiveCrosshair, CartesianActiveOverlay } from "./cartesian-active-layers";
import { isTooltipEnabled } from "./tooltip-options";
import type { LineChartProps } from "./types";
import { useCartesianPointerState } from "./use-cartesian-pointer-state";

export const LineChart = <TDatum,>({
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
  curve = "linear",
  connectNulls = false,
  showPoints = "auto",
  referenceLines = [],
  animate,
}: LineChartProps<TDatum>) => {
  const motion = useChartMotionContext();
  const LineSeries = (motion.slots.LineSeries ?? StaticLineSeries) as typeof StaticLineSeries;
  const [hiddenSeries, setHiddenSeries] = useState<readonly string[]>([]);
  const visibleSeries = series.filter(
    (entry) => !entry.hidden && !hiddenSeries.includes(entry.id ?? String(entry.key)),
  );
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
      {visibleSeries.map((entry, index) => (
        <LineSeries
          key={entry.id ?? String(entry.key)}
          id={entry.id ?? String(entry.key)}
          dataKey={entry.key}
          yDomain={yDomain}
          color={entry.color ?? `var(--chart-${(index % 4) + 1})`}
          curve={curve}
          connectNulls={connectNulls}
          showPoints={showPoints}
          activeIndex={entry === activeSeries ? activeIndex : null}
          {...(animate === undefined ? {} : { animate })}
        />
      ))}
    </Chart>
  );
};
