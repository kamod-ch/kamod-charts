import { useCallback, useMemo, useState } from "preact/hooks";
import { useChartMotionContext } from "../animation/slots";
import { XAxis, YAxis } from "../axes";
import { Chart } from "../core";
import { createChartKeyboardHandler } from "../interaction";
import { Grid, Legend } from "../primitives";
import {
  CartesianReferenceClippedLayers,
  CartesianReferenceLineLayers,
  CartesianReferencePointLayers,
} from "./cartesian-reference-layers";
import {
  AreaSeries as StaticAreaSeries,
  inferGroupedDomain,
  inferStackedDomain,
  StackedAreaSeries as StaticStackedAreaSeries,
} from "../series";
import { CartesianActiveCrosshair, CartesianActiveOverlay } from "./cartesian-active-layers";
import { useCartesianIntlAxisTicks } from "./cartesian-axis-formatters";
import { cartesianAxisCollisionProps } from "./cartesian-axis-props";
import { CartesianChartFrame } from "./cartesian-chart-frame";
import { resolveCartesianEmptyState } from "./cartesian-empty-state";
import { resolvePlotAreaFromSize } from "./cartesian-interaction";
import { buildCartesianLayoutModel } from "./cartesian-layout-model";
import { resolveCartesianViewport } from "./resolve-cartesian-viewport";
import { isContinuousCartesianXScale } from "./x-viewport";
import { useCartesianXViewportGestures } from "./use-cartesian-x-viewport-gestures";
import type { ChartSvgProps } from "../core/chart-svg-props";
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
  aspectRatio,
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
  referenceAreas = [],
  referencePoints = [],
  referenceSegments = [],
  animate,
  xDomain: xDomainProp,
  yAutoscale = "data",
  xViewportInteraction,
  onXViewportChange,
  yDomain: yDomainProp,
  margin,
  class: className,
  style: styleProp,
  emptyContent,
  format,
  activeIndex: controlledActiveIndex,
  onActiveChange,
  svgRef,
  svgProps,
  defs,
  clipPlotArea,
  plotForeground,
  tickCollision,
  maxTickLabelLength,
  maxTickLabelWidth,
  tickRotation,
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
  const tooltipEnabled = isTooltipEnabled(tooltip);
  const fallbackWidth = width ?? initialWidth ?? 640;
  const chartHeight = height ?? 320;
  const plotWidth = useMemo(
    () => resolvePlotAreaFromSize(fallbackWidth, chartHeight).width,
    [chartHeight, fallbackWidth],
  );
  const viewportInteractionEnabled =
    Boolean(xViewportInteraction) && isContinuousCartesianXScale(xScale);
  const viewportGestures = useCartesianXViewportGestures({
    enabled: viewportInteractionEnabled,
    data,
    xKey,
    xScale,
    xDomain: xDomainProp,
    onXViewportChange,
    interaction: typeof xViewportInteraction === "object" ? xViewportInteraction : {},
    plotWidth,
    fallbackWidth,
    chartHeight,
  });
  const { resolvedXDomain, dataForYDomain } = useMemo(() => {
    if (viewportInteractionEnabled) {
      return resolveCartesianViewport({
        data,
        xKey,
        xScale,
        xDomain: viewportGestures.effectiveXDomain,
        yAutoscale,
      });
    }
    return resolveCartesianViewport({
      data,
      xKey,
      xScale,
      xDomain: xDomainProp,
      yAutoscale,
    });
  }, [
    data,
    viewportGestures.effectiveXDomain,
    viewportInteractionEnabled,
    xDomainProp,
    xKey,
    xScale,
    yAutoscale,
  ]);
  const inferredYDomain = useMemo(
    () =>
      stacked
        ? inferStackedDomain(dataForYDomain, stackSeries)
        : inferGroupedDomain(dataForYDomain, stackSeries),
    [dataForYDomain, stacked, stackSeries],
  );
  const yDomain = yDomainProp ?? inferredYDomain;
  const resolvedSeriesIndex =
    visibleSeries.length === 0 ? 0 : Math.min(activeSeriesIndex, visibleSeries.length - 1);
  const activeSeriesEntry = visibleEntries[resolvedSeriesIndex];
  const activeSeries = activeSeriesEntry?.entry;
  const activeSeriesId = activeSeriesEntry
    ? getSeriesId(activeSeriesEntry.entry, activeSeriesEntry.originalIndex)
    : null;
  const primarySeriesKey = visibleSeries[0]?.key;
  const layout = useMemo(
    () =>
      buildCartesianLayoutModel({
        data,
        xKey,
        xScale,
        xDomain: resolvedXDomain,
        yDomain,
        width: fallbackWidth,
        height: chartHeight,
        primarySeriesKey,
      }),
    [chartHeight, data, fallbackWidth, primarySeriesKey, resolvedXDomain, xKey, xScale, yDomain],
  );
  const notifyActiveChange = useCallback(
    (index: number | null, source: "pointer" | "keyboard") => {
      onActiveChange?.({
        activeIndex: index,
        activeSeriesId: activeSeriesId,
        source,
      });
    },
    [activeSeriesId, onActiveChange],
  );
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
    xIndex: layout.xIndex,
    xDomain: resolvedXDomain,
    yDomain,
    seriesKey: primarySeriesKey,
    controlledActiveIndex,
    onActiveIndexChange: (index) => notifyActiveChange(index, "pointer"),
  });
  const tooltipPointerMove = useCallback(
    (event: Parameters<typeof onPointerMove>[0]) => {
      if (!viewportGestures.isPanning) {
        onPointerMove(event);
      }
    },
    [onPointerMove, viewportGestures.isPanning],
  );
  const mergedSvgProps: ChartSvgProps = {
    ...(typeof svgProps === "object" && svgProps ? svgProps : {}),
    ...(viewportGestures.svgProps as ChartSvgProps),
    onKeyDown: (event) => {
      if (viewportGestures.handleViewportKeyboard(event)) {
        return;
      }
      createChartKeyboardHandler({
        pointCount: data.length,
        seriesCount: Math.max(visibleSeries.length, 1),
        activeIndex: activeIndex ?? 0,
        activeSeriesIndex: resolvedSeriesIndex,
        onChange: (state) => {
          resetPointerPlot();
          setActiveIndex(state.activeIndex);
          notifyActiveChange(state.activeIndex, "keyboard");
          setActiveSeriesIndex(state.activeSeriesIndex);
        },
        onEscape: () => {
          resetPointerPlot();
          setActiveIndex(null);
          notifyActiveChange(null, "keyboard");
        },
      })(event);
    },
  };

  const chartStyle =
    typeof styleProp === "string"
      ? styleProp
      : { ...styleProp, ...(tooltipEnabled ? { cursor: "crosshair" } : {}) };
  const { xTickFormatter, yTickFormatter } = useCartesianIntlAxisTicks(format);
  const axisCollision = cartesianAxisCollisionProps({
    tickCollision,
    maxTickLabelLength,
    maxTickLabelWidth,
    tickRotation,
  });

  return (
    <CartesianChartFrame format={format}>
      <Chart
        data={data}
        xKey={xKey}
        xScale={xScale}
        width={width}
        height={height}
        initialWidth={initialWidth}
        responsive={responsive}
        aspectRatio={aspectRatio}
        margin={margin}
        class={className}
        title={title}
        description={description}
        id={id}
        emptyState={resolveCartesianEmptyState(emptyContent)}
        tabIndex={0}
        style={chartStyle}
        svgRef={svgRef}
        svgProps={mergedSvgProps}
        defs={defs}
        clipPlotArea={clipPlotArea}
        onPointerMove={tooltipEnabled ? tooltipPointerMove : undefined}
        onPointerLeave={tooltipEnabled ? onPointerLeave : undefined}
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
              xDomain={resolvedXDomain}
              yDomain={yDomain}
              tooltip={tooltip}
              defaultMode="axis"
              pointerPlot={pointerPlot}
              stacked={stacked}
              stackSeries={stacked ? stackSeries : undefined}
              format={format}
            />
          </>
        }
        plotLayers={{
          clipped: (
            <>
              <CartesianReferenceClippedLayers
                xKey={xKey}
                xScale={xScale}
                xDomain={resolvedXDomain}
                yDomain={yDomain}
                referenceAreas={referenceAreas}
                referenceSegments={referenceSegments}
              />
              {showGrid ? (
                <Grid xKey={xKey} xScale={xScale} xDomain={resolvedXDomain} yDomain={yDomain} />
              ) : null}
              {stacked ? (
                <StackedAreaSeries
                  series={stackSeries}
                  xKey={xKey}
                  xScale={xScale}
                  xDomain={resolvedXDomain}
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
                    xDomain={resolvedXDomain}
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
                    activeIndex={
                      activeSeriesId === getSeriesId(entry, originalIndex) ? activeIndex : null
                    }
                    seriesLabel={entry.label}
                    renderPoint={entry.renderPoint}
                    {...(animate === undefined ? {} : { animate })}
                  />
                ))
              )}
            </>
          ),
          foreground: (
            <>
              <CartesianActiveCrosshair
                activeIndex={activeIndex}
                activeSeries={activeSeries}
                visibleSeries={visibleSeries}
                xKey={xKey}
                xScale={xScale}
                xDomain={resolvedXDomain}
                yDomain={yDomain}
                tooltip={tooltip}
                defaultMode="axis"
                pointerPlot={pointerPlot}
              />
              <CartesianReferencePointLayers
                xKey={xKey}
                xScale={xScale}
                xDomain={resolvedXDomain}
                yDomain={yDomain}
                referencePoints={referencePoints}
              />
              {plotForeground}
            </>
          ),
          axes: (
            <>
              <XAxis
                dataKey={xKey}
                scale={xScale}
                domain={resolvedXDomain}
                tickFormatter={xTickFormatter}
                {...axisCollision}
              />
              <YAxis
                domain={yDomain}
                tickFormatter={yTickFormatter}
                tickCollision={tickCollision}
                maxTickLabelLength={maxTickLabelLength}
                maxTickLabelWidth={maxTickLabelWidth}
              />
              <CartesianReferenceLineLayers
                xKey={xKey}
                xScale={xScale}
                xDomain={resolvedXDomain}
                yDomain={yDomain}
                referenceLines={referenceLines}
              />
            </>
          ),
        }}
      />
    </CartesianChartFrame>
  );
};
