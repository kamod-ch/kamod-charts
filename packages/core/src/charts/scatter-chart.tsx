import { useEffect, useMemo, useState } from "preact/hooks";
import { XAxis, YAxis } from "../axes";
import { Chart } from "../core";
import { getPointerPosition } from "../interaction";
import {
  Grid,
  Legend,
  ReferenceArea,
  ReferenceLine,
  ReferencePoint,
  ReferenceSegment,
} from "../primitives";
import { useChartMotionContext } from "../animation/slots";
import { inferCombinedNumericDomain, ScatterSeries as StaticScatterSeries } from "../series";
import { CartesianActiveCrosshair, CartesianActiveOverlay } from "./cartesian-active-layers";
import { resolvePlotAreaFromSize } from "./cartesian-interaction";
import { createScatterCategoryContext, isScatterDatumActiveHidden } from "./scatter-model";
import {
  buildScatterInteractionCandidates,
  buildScatterInteractionTargets,
  findNearestScatterCandidate,
  isScatterInteractionTargetValid,
  toScatterPointContext,
} from "./scatter-interaction";
import { createScatterKeyboardHandler } from "./scatter-keyboard";
import { DEFAULT_SCATTER_SIZE_SCALE, inferScatterSizeDomain } from "./scatter-size";
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
  pointSize,
  pointRadius,
  sizeKey,
  sizeScale = DEFAULT_SCATTER_SIZE_SCALE,
  sizeDomain,
  pointRadiusRange,
  categoryKey,
  categories,
  referenceLines = [],
  referenceSegments = [],
  referenceAreas = [],
  referencePoints = [],
  animate,
}: ScatterChartProps<TDatum>) => {
  const motion = useChartMotionContext();
  const ScatterSeries = (motion.slots.ScatterSeries ??
    StaticScatterSeries) as typeof StaticScatterSeries;
  const categoryMode = categoryKey != null;
  const [hiddenSeries, setHiddenSeries] = useState<readonly string[]>([]);
  const [hiddenCategoryIds, setHiddenCategoryIds] = useState<readonly string[]>([]);
  const visibleSeries = series.filter(
    (entry) => !entry.hidden && !hiddenSeries.includes(entry.id ?? String(entry.key)),
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [activeSeriesIndex, setActiveSeriesIndex] = useState(0);
  const categoryContext = useMemo(
    () =>
      categoryMode
        ? createScatterCategoryContext({
            data,
            categoryKey,
            categories,
            hiddenCategoryIds,
          })
        : null,
    [categoryMode, categories, categoryKey, data, hiddenCategoryIds],
  );
  const yDomain = useMemo(
    () =>
      inferCombinedNumericDomain(
        data,
        visibleSeries.map((entry) => entry.key),
      ),
    [data, visibleSeries],
  );
  const resolvedSizeDomain = useMemo(
    () => (sizeKey != null ? inferScatterSizeDomain(data, sizeKey, sizeDomain) : undefined),
    [data, sizeDomain, sizeKey],
  );
  const resolvedSeriesIndex =
    visibleSeries.length === 0 ? 0 : Math.min(activeSeriesIndex, visibleSeries.length - 1);
  const activeSeries = visibleSeries[resolvedSeriesIndex];
  const tooltipEnabled = isTooltipEnabled(tooltip);
  const fallbackWidth = width ?? initialWidth ?? 640;
  const sortByRadius = sizeKey != null;
  const fallbackPlotArea = useMemo(
    () => resolvePlotAreaFromSize(fallbackWidth, height),
    [fallbackWidth, height],
  );
  const interactionCandidates = useMemo(
    () =>
      buildScatterInteractionCandidates({
        data,
        series,
        visibleSeries,
        xKey,
        xScale,
        yDomain,
        plotWidth: fallbackPlotArea.width,
        plotHeight: fallbackPlotArea.height,
        sizeKey,
        sizeScale,
        sizeDomain: resolvedSizeDomain,
        pointRadiusRange,
        pointRadius,
        pointSize,
        categoryKey,
        categories,
        hiddenCategoryIds,
        hiddenSeriesIds: hiddenSeries,
        categoryContext,
        sortByRadius,
      }),
    [
      categories,
      categoryContext,
      categoryKey,
      data,
      fallbackPlotArea.height,
      fallbackPlotArea.width,
      hiddenCategoryIds,
      hiddenSeries,
      pointRadius,
      pointRadiusRange,
      pointSize,
      resolvedSizeDomain,
      series,
      sizeKey,
      sizeScale,
      sortByRadius,
      visibleSeries,
      xKey,
      xScale,
      yDomain,
    ],
  );
  const interactionTargets = useMemo(
    () => buildScatterInteractionTargets(interactionCandidates),
    [interactionCandidates],
  );
  const activeCandidate = useMemo(() => {
    if (activeIndex == null) {
      return null;
    }

    return (
      interactionCandidates.find(
        (candidate) =>
          candidate.index === activeIndex && candidate.seriesIndex === resolvedSeriesIndex,
      ) ?? null
    );
  }, [activeIndex, interactionCandidates, resolvedSeriesIndex]);
  const effectiveActiveIndex =
    activeIndex != null &&
    isScatterInteractionTargetValid(interactionTargets, activeIndex, resolvedSeriesIndex) &&
    !isScatterDatumActiveHidden(data, activeIndex, categoryContext)
      ? activeIndex
      : null;
  const scatterPoint = activeCandidate ? toScatterPointContext(activeCandidate.point, true) : null;
  const scatterPlotPosition = activeCandidate
    ? { plotX: activeCandidate.plotX, plotY: activeCandidate.plotY }
    : null;

  useEffect(() => {
    if (
      activeIndex != null &&
      !isScatterInteractionTargetValid(interactionTargets, activeIndex, resolvedSeriesIndex)
    ) {
      setActiveIndex(null);
    }
  }, [activeIndex, interactionTargets, resolvedSeriesIndex]);

  const toggleCategory = (categoryId: string) => {
    setHiddenCategoryIds((current) => {
      const next = current.includes(categoryId)
        ? current.filter((entry) => entry !== categoryId)
        : [...current, categoryId];

      if (activeIndex != null && categoryContext) {
        const datum = data[activeIndex];
        if (
          datum != null &&
          categoryContext.resolveDatumCategory(datum, activeIndex).categoryId === categoryId
        ) {
          setActiveIndex(null);
        }
      }

      return next;
    });
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
              const size = {
                width: event.currentTarget.viewBox.baseVal.width || fallbackWidth,
                height: event.currentTarget.viewBox.baseVal.height || height,
              };
              const nextPlot = resolvePlotAreaFromSize(size.width, size.height);
              const position = getPointerPosition(event, nextPlot);
              const hit = findNearestScatterCandidate(
                buildScatterInteractionCandidates({
                  data,
                  series,
                  visibleSeries,
                  xKey,
                  xScale,
                  yDomain,
                  plotWidth: nextPlot.width,
                  plotHeight: nextPlot.height,
                  sizeKey,
                  sizeScale,
                  sizeDomain: resolvedSizeDomain,
                  pointRadiusRange,
                  pointRadius,
                  pointSize,
                  categoryKey,
                  categories,
                  hiddenCategoryIds,
                  hiddenSeriesIds: hiddenSeries,
                  categoryContext,
                  sortByRadius,
                }),
                position.plotX,
                position.plotY,
              );
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
      onKeyDown={createScatterKeyboardHandler({
        targets: interactionTargets,
        activeIndex: effectiveActiveIndex,
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
              items={
                categoryMode && categoryContext
                  ? categoryContext.categories.map((entry) => ({
                      id: entry.id,
                      label: entry.label,
                      color: entry.color,
                      hidden: categoryContext.isCategoryLegendHidden(entry.id),
                    }))
                  : series.map((entry, index) => ({
                      id: entry.id ?? String(entry.key),
                      label: entry.label,
                      color: entry.color ?? `var(--chart-${(index % 4) + 1})`,
                      hidden: hiddenSeries.includes(entry.id ?? String(entry.key)),
                    }))
              }
              onToggle={(itemId) =>
                categoryMode
                  ? toggleCategory(itemId)
                  : setHiddenSeries((current) =>
                      current.includes(itemId)
                        ? current.filter((entry) => entry !== itemId)
                        : [...current, itemId],
                    )
              }
            />
          ) : null}
          <CartesianActiveOverlay
            activeIndex={effectiveActiveIndex}
            activeSeries={activeSeries}
            visibleSeries={visibleSeries}
            xKey={xKey}
            xScale={xScale}
            yDomain={yDomain}
            tooltip={tooltip}
            defaultMode="nearest"
            scatterPoint={scatterPoint}
            scatterPlotPosition={scatterPlotPosition}
          />
        </>
      }
    >
      {referenceAreas.map((area, index) => (
        <ReferenceArea
          key={area.id ?? `reference-area-${index}`}
          id={area.id}
          x1={area.x1}
          x2={area.x2}
          y1={area.y1}
          y2={area.y2}
          xKey={area.xKey ?? xKey}
          yKey={area.yKey}
          xScale={xScale}
          yDomain={yDomain}
          label={area.label}
          fill={area.fill}
          fillOpacity={area.fillOpacity}
          class={area.class}
        />
      ))}
      {showGrid ? <Grid xKey={xKey} xScale={xScale} yDomain={yDomain} /> : null}
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
          strokeWidth={line.strokeWidth}
          strokeDasharray={line.strokeDasharray}
          yKey={line.yKey}
          xKey={xKey}
          xScale={xScale}
        />
      ))}
      {referenceSegments.map((segment, index) => (
        <ReferenceSegment
          key={segment.id ?? `reference-segment-${index}`}
          id={segment.id}
          start={segment.start}
          end={segment.end}
          xKey={segment.xKey ?? xKey}
          yKey={segment.yKey}
          xScale={xScale}
          yDomain={yDomain}
          label={segment.label}
          labelPosition={segment.labelPosition}
          color={segment.color}
          strokeWidth={segment.strokeWidth}
          strokeDasharray={segment.strokeDasharray}
          class={segment.class}
        />
      ))}
      {visibleSeries.map((entry, index) => (
        <ScatterSeries
          key={entry.id ?? String(entry.key)}
          id={entry.id ?? String(entry.key)}
          yKey={entry.key}
          yDomain={yDomain}
          color={entry.color ?? `var(--chart-${(index % 4) + 1})`}
          sizeKey={sizeKey}
          sizeScale={sizeScale}
          sizeDomain={resolvedSizeDomain}
          pointRadiusRange={pointRadiusRange}
          pointRadius={pointRadius}
          pointSize={pointSize}
          seriesPointRadius={entry.pointRadius}
          pointOpacity={entry.pointOpacity}
          sortByRadius={sortByRadius}
          categoryContext={categoryContext}
          activeIndex={entry === activeSeries ? effectiveActiveIndex : null}
          {...(animate === undefined ? {} : { animate })}
        />
      ))}
      {referencePoints.map((point, index) => (
        <ReferencePoint
          key={point.id ?? `reference-point-${index}`}
          id={point.id}
          x={point.x}
          y={point.y}
          xKey={point.xKey ?? xKey}
          yKey={point.yKey}
          xScale={xScale}
          yDomain={yDomain}
          label={point.label}
          color={point.color}
          size={point.size}
          shape={point.shape}
          labelPosition={point.labelPosition}
          class={point.class}
        />
      ))}
      <CartesianActiveCrosshair
        activeIndex={effectiveActiveIndex}
        activeSeries={activeSeries}
        visibleSeries={visibleSeries}
        xKey={xKey}
        xScale={xScale}
        yDomain={yDomain}
        tooltip={tooltip}
        defaultMode="nearest"
        scatterPlotPosition={scatterPlotPosition}
      />
    </Chart>
  );
};
