import { useMemo, useState } from "preact/hooks";
import { XAxis, YAxis } from "../axes";
import { Chart, normalizeAccessor, type ChartInteraction } from "../core";
import { createChartKeyboardHandler, getNearestIndexByX, getPointerPosition } from "../interaction";
import { Crosshair, Grid, Legend, LiveRegion, ReferenceLine, Tooltip } from "../primitives";
import { inferCombinedNumericDomain, LineSeries } from "../series";
import type { LineChartProps } from "./types";

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
}: LineChartProps<TDatum>) => {
  const [hiddenSeries, setHiddenSeries] = useState<readonly string[]>([]);
  const visibleSeries = series.filter(
    (entry) => !entry.hidden && !hiddenSeries.includes(entry.id ?? String(entry.key)),
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeSeriesIndex, setActiveSeriesIndex] = useState(0);
  const yDomain = useMemo(
    () =>
      inferCombinedNumericDomain(
        data,
        visibleSeries.map((entry) => entry.key),
      ),
    [data, visibleSeries],
  );
  const activeSeries = visibleSeries[activeSeriesIndex];
  const activeDatum = data[activeIndex];
  const activeValue =
    activeDatum && activeSeries
      ? normalizeAccessor(activeSeries.key)(activeDatum, activeIndex)
      : null;
  const interaction: ChartInteraction<TDatum> | null =
    activeDatum && activeSeries
      ? {
          datum: activeDatum,
          seriesId: activeSeries.id ?? String(activeSeries.key),
          index: activeIndex,
          value: typeof activeValue === "number" ? activeValue : null,
          x: 40 + activeIndex * 24,
          y: 24,
        }
      : null;
  const plotWidth = Math.max((width ?? initialWidth ?? 640) - 56, 1);

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
      onPointerMove={(event) => {
        const position = getPointerPosition(event, {
          x: 40,
          y: 16,
          width: plotWidth,
          height: Math.max(height - 48, 1),
        });
        setActiveIndex(getNearestIndexByX(position.plotX, plotWidth, data.length));
      }}
      onPointerLeave={() => setActiveIndex(0)}
      onKeyDown={createChartKeyboardHandler({
        pointCount: data.length,
        seriesCount: visibleSeries.length,
        activeIndex,
        activeSeriesIndex,
        onChange: (state) => {
          setActiveIndex(state.activeIndex);
          setActiveSeriesIndex(state.activeSeriesIndex);
        },
        onEscape: () => setActiveIndex(0),
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
          {tooltip ? <Tooltip interaction={interaction} /> : null}
          <LiveRegion interaction={interaction} />
        </>
      }
    >
      {showGrid ? <Grid xKey={xKey} xScale={xScale} yDomain={yDomain} /> : null}
      {tooltip ? (
        <Crosshair interaction={interaction} width={plotWidth} height={Math.max(height - 48, 1)} />
      ) : null}
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
        />
      ))}
    </Chart>
  );
};
