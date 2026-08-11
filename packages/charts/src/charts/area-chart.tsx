import { useMemo } from "preact/hooks";
import { XAxis, YAxis } from "../axes";
import { Chart } from "../core";
import { Grid, ReferenceLine } from "../primitives";
import { AreaSeries, inferGroupedDomain, inferStackedDomain, StackedAreaSeries } from "../series";
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
  stacked = false,
  baseline = 0,
  opacity = 0.2,
  outline = false,
  curve = "linear",
  referenceLines = [],
}: AreaChartProps<TDatum>) => {
  const visibleSeries = series.filter((entry) => !entry.hidden);
  const stackSeries = visibleSeries.map((entry) => ({
    id: entry.id ?? String(entry.key),
    value: entry.key,
    color: entry.color,
  }));
  const yDomain = useMemo(
    () => (stacked ? inferStackedDomain(data, stackSeries) : inferGroupedDomain(data, stackSeries)),
    [data, stacked, stackSeries],
  );

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
    >
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
        />
      ) : (
        visibleSeries.map((entry, index) => (
          <AreaSeries
            key={entry.id ?? String(entry.key)}
            id={entry.id ?? String(entry.key)}
            dataKey={entry.key}
            yDomain={yDomain}
            color={entry.color ?? `var(--chart-${(index % 4) + 1})`}
            baseline={baseline}
            opacity={opacity}
            outline={outline}
            curve={curve}
          />
        ))
      )}
    </Chart>
  );
};
