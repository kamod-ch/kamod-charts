import { useMemo, useState } from "preact/hooks";
import { useChartMotionContext } from "../animation/slots";
import { XAxis, YAxis } from "../axes";
import { Chart, useChartContext } from "../core";
import { createChartKeyboardHandler } from "../interaction";
import { Grid, Legend, ReferenceArea, ReferenceLine } from "../primitives";
import { inferGroupedDomain, inferStackedDomain } from "../series";
import { CartesianActiveCrosshair, CartesianActiveOverlay } from "./cartesian-active-layers";
import type { CartesianActivePoint } from "./cartesian-interaction";
import { resolvePlotAreaFromSize } from "./cartesian-interaction";
import {
  findDefinedBar,
  hitTestBars,
  resolveBarGeometry,
  stepDefinedBar,
  type BarGeometry,
} from "./bar-geometry";
import { BarMarks as StaticBarMarks } from "./bar-marks";
import { resolveBarReferenceAreaProps } from "./bar-reference-area";
import { resolvePointerPlot } from "./chart-pointer";
import { getSeriesId } from "./series-identity";
import { isTooltipEnabled, resolveTooltipOptions } from "./tooltip-options";
import type { BarChartProps } from "./types";

export const BarChart = <TDatum,>({
  data,
  xKey,
  xScale = "band",
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
  orientation = "vertical",
  stacked = false,
  grouped = true,
  radius = 0,
  minBarSize = 0,
  maxBarSize,
  valueLabels = false,
  referenceLines = [],
  referenceAreas = [],
  onBarClick,
  animate,
}: BarChartProps<TDatum>) => {
  const motion = useChartMotionContext();
  const BarMarks = (motion.slots.BarMarks ?? StaticBarMarks) as typeof StaticBarMarks;
  const [hiddenSeries, setHiddenSeries] = useState<readonly string[]>([]);
  const visibleSeries = series.filter(
    (entry, index) => !entry.hidden && !hiddenSeries.includes(getSeriesId(entry, index)),
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeSeriesIndex, setActiveSeriesIndex] = useState(0);
  const stackSeries = visibleSeries.map((entry, index) => ({
    id: getSeriesId(entry, index),
    value: entry.key,
  }));
  const yDomain = useMemo(
    () => (stacked ? inferStackedDomain(data, stackSeries) : inferGroupedDomain(data, stackSeries)),
    [data, stacked, stackSeries],
  );
  const isHorizontal = orientation === "horizontal";
  const resolvedSeriesIndex =
    visibleSeries.length === 0 ? 0 : Math.min(activeSeriesIndex, visibleSeries.length - 1);
  const activeSeries = visibleSeries[resolvedSeriesIndex];
  const tooltipEnabled = isTooltipEnabled(tooltip);
  const tooltipOptions = resolveTooltipOptions(tooltip, "nearest");
  const fallbackWidth = width ?? initialWidth ?? 640;

  const activateBar = (bar: BarGeometry<TDatum> | null) => {
    if (!bar) {
      setActiveIndex(null);
      return;
    }
    setActiveIndex(bar.index);
    setActiveSeriesIndex(bar.seriesIndex);
  };

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
              const bars = resolveBarGeometry({
                data,
                series: visibleSeries,
                xKey,
                yDomain,
                stacked,
                grouped,
                horizontal: isHorizontal,
                minBarSize,
                maxBarSize,
                plotWidth: plot.width,
                plotHeight: plot.height,
              });
              activateBar(
                hitTestBars(
                  bars,
                  position.plotX,
                  position.plotY,
                  tooltipOptions?.mode ?? "nearest",
                  isHorizontal,
                ),
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
          const plot = resolvePlotAreaFromSize(width ?? fallbackWidth, height);
          const bars = resolveBarGeometry({
            data,
            series: visibleSeries,
            xKey,
            yDomain,
            stacked,
            grouped,
            horizontal: isHorizontal,
            minBarSize,
            maxBarSize,
            plotWidth: plot.width,
            plotHeight: plot.height,
          });
          const stepped = stepDefinedBar(
            bars,
            state.activeIndex,
            state.activeSeriesIndex,
            state.activeIndex - (activeIndex ?? 0),
            state.activeSeriesIndex - resolvedSeriesIndex,
            data.length,
            visibleSeries.length,
          );
          if (!stepped) {
            setActiveIndex(null);
            return;
          }
          setActiveIndex(stepped.index);
          setActiveSeriesIndex(stepped.seriesIndex);
        },
        onSelect: (state) => {
          if (!onBarClick || !activeSeries) {
            return;
          }
          const plot = resolvePlotAreaFromSize(width ?? fallbackWidth, height);
          const bars = resolveBarGeometry({
            data,
            series: visibleSeries,
            xKey,
            yDomain,
            stacked,
            grouped,
            horizontal: isHorizontal,
            minBarSize,
            maxBarSize,
            plotWidth: plot.width,
            plotHeight: plot.height,
          });
          const bar = findDefinedBar(bars, state.activeIndex, state.activeSeriesIndex);
          if (bar && bar.value != null) {
            onBarClick(bar.datum, bar.seriesId, bar.index, bar.value);
          }
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
          <BarActiveLayers
            data={data}
            xKey={xKey}
            visibleSeries={visibleSeries}
            yDomain={yDomain}
            stacked={stacked}
            grouped={grouped}
            horizontal={isHorizontal}
            minBarSize={minBarSize}
            maxBarSize={maxBarSize}
            activeIndex={activeIndex}
            activeSeries={activeSeries}
            resolvedSeriesIndex={resolvedSeriesIndex}
            tooltip={tooltip}
          />
        </>
      }
    >
      {referenceAreas.map((area, index) => (
        <ReferenceArea
          key={area.id ?? `reference-area-${index}`}
          {...resolveBarReferenceAreaProps(area, {
            xKey,
            xScale,
            yDomain,
            horizontal: isHorizontal,
          })}
        />
      ))}
      {showGrid ? (
        isHorizontal ? (
          <Grid xScale="linear" xDomain={yDomain} yKey={xKey} yScale={xScale} />
        ) : (
          <Grid xKey={xKey} xScale={xScale} yDomain={yDomain} />
        )
      ) : null}
      <BarActiveCrosshair
        data={data}
        xKey={xKey}
        visibleSeries={visibleSeries}
        yDomain={yDomain}
        stacked={stacked}
        grouped={grouped}
        horizontal={isHorizontal}
        minBarSize={minBarSize}
        maxBarSize={maxBarSize}
        activeIndex={activeIndex}
        activeSeries={activeSeries}
        resolvedSeriesIndex={resolvedSeriesIndex}
        tooltip={tooltip}
      />
      {isHorizontal ? (
        <>
          <XAxis scale="linear" domain={yDomain} />
          <YAxis dataKey={xKey} scale={xScale} />
        </>
      ) : (
        <>
          <XAxis dataKey={xKey} scale={xScale} />
          <YAxis domain={yDomain} />
        </>
      )}
      <BarMarks
        data={data}
        xKey={xKey}
        series={visibleSeries}
        yDomain={yDomain}
        stacked={stacked}
        grouped={grouped}
        horizontal={isHorizontal}
        radius={radius}
        minBarSize={minBarSize}
        maxBarSize={maxBarSize}
        valueLabels={valueLabels}
        activeIndex={activeIndex}
        activeSeriesIndex={resolvedSeriesIndex}
        onBarClick={onBarClick}
        {...(animate === undefined ? {} : { animate })}
      />
      {referenceLines.map((line, index) => (
        <ReferenceLine
          key={index}
          x={line.x}
          y={line.y}
          label={line.label}
          color={line.color}
          yKey={line.yKey}
          xKey={xKey}
          xScale={isHorizontal ? "linear" : xScale}
          xDomain={isHorizontal ? yDomain : undefined}
          yScale={isHorizontal ? xScale : "linear"}
          yDomain={isHorizontal ? undefined : yDomain}
        />
      ))}
    </Chart>
  );
};

type BarActiveProps<TDatum> = {
  data: readonly TDatum[];
  xKey?: BarChartProps<TDatum>["xKey"];
  visibleSeries: readonly BarChartProps<TDatum>["series"][number][];
  yDomain: readonly [number, number];
  stacked: boolean;
  grouped: boolean;
  horizontal: boolean;
  minBarSize: number;
  maxBarSize?: number;
  activeIndex: number | null;
  activeSeries?: BarChartProps<TDatum>["series"][number];
  resolvedSeriesIndex: number;
  tooltip: BarChartProps<TDatum>["tooltip"];
};

const useBarActivePoint = <TDatum,>(props: BarActiveProps<TDatum>): CartesianActivePoint | null => {
  const { plotArea } = useChartContext<TDatum>();
  if (props.activeIndex == null || !props.activeSeries) {
    return null;
  }

  const bars = resolveBarGeometry({
    data: props.data,
    series: props.visibleSeries,
    xKey: props.xKey,
    yDomain: props.yDomain,
    stacked: props.stacked,
    grouped: props.grouped,
    horizontal: props.horizontal,
    minBarSize: props.minBarSize,
    maxBarSize: props.maxBarSize,
    plotWidth: plotArea.width,
    plotHeight: plotArea.height,
  });
  const bar = findDefinedBar(bars, props.activeIndex, props.resolvedSeriesIndex);
  if (!bar) {
    return null;
  }

  return {
    plotX: bar.anchorX,
    plotY: bar.anchorY,
    surfaceX: plotArea.x + bar.anchorX,
    surfaceY: plotArea.y + bar.anchorY,
  };
};

const BarActiveLayers = <TDatum,>(props: BarActiveProps<TDatum>) => {
  const activePoint = useBarActivePoint(props);
  return (
    <CartesianActiveOverlay
      activeIndex={props.activeIndex}
      activeSeries={props.activeSeries}
      visibleSeries={props.visibleSeries}
      xKey={props.xKey}
      xScale="band"
      yDomain={props.yDomain}
      tooltip={props.tooltip}
      defaultMode="nearest"
      activePoint={activePoint}
    />
  );
};

const BarActiveCrosshair = <TDatum,>(props: BarActiveProps<TDatum>) => {
  const activePoint = useBarActivePoint(props);
  return (
    <CartesianActiveCrosshair
      activeIndex={props.activeIndex}
      activeSeries={props.activeSeries}
      visibleSeries={props.visibleSeries}
      xKey={props.xKey}
      xScale="band"
      yDomain={props.yDomain}
      tooltip={props.tooltip}
      defaultMode="nearest"
      activePoint={activePoint}
    />
  );
};
