import { useMemo } from "preact/hooks";
import { XAxis, YAxis } from "../axes";
import { Chart, normalizeAccessor, useChartContext } from "../core";
import { Grid, ReferenceLine } from "../primitives";
import { createBandScale, createLinearScale, inferCategoricalDomain } from "../scales";
import { getStackedValues, inferGroupedDomain, inferStackedDomain } from "../series";
import type { BarChartProps } from "./types";

const categoryOf = (value: string | number | Date | null | undefined, index: number): string => {
  if (value == null) {
    return String(index);
  }

  return value instanceof Date ? value.toISOString() : String(value);
};

const roundedRectPath = (
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): string => {
  const safeRadius = Math.max(0, Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2));
  const right = x + width;
  const bottom = y + height;

  if (safeRadius === 0) {
    return `M${x},${y}H${right}V${bottom}H${x}Z`;
  }

  return `M${x + safeRadius},${y}H${right - safeRadius}Q${right},${y} ${right},${y + safeRadius}V${bottom - safeRadius}Q${right},${bottom} ${right - safeRadius},${bottom}H${x + safeRadius}Q${x},${bottom} ${x},${bottom - safeRadius}V${y + safeRadius}Q${x},${y} ${x + safeRadius},${y}Z`;
};

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
  orientation = "vertical",
  stacked = false,
  grouped = true,
  radius = 0,
  minBarSize = 0,
  valueLabels = false,
  referenceLines = [],
  onBarClick,
}: BarChartProps<TDatum>) => {
  const visibleSeries = series.filter((entry) => !entry.hidden);
  const stackSeries = visibleSeries.map((entry) => ({
    id: entry.id ?? String(entry.key),
    value: entry.key,
  }));
  const yDomain = useMemo(
    () => (stacked ? inferStackedDomain(data, stackSeries) : inferGroupedDomain(data, stackSeries)),
    [data, stacked, stackSeries],
  );
  const isHorizontal = orientation === "horizontal";

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
      <Bars
        data={data}
        xKey={xKey}
        series={visibleSeries}
        yDomain={yDomain}
        stacked={stacked}
        grouped={grouped}
        horizontal={isHorizontal}
        radius={radius}
        minBarSize={minBarSize}
        valueLabels={valueLabels}
        onBarClick={onBarClick}
      />
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
    </Chart>
  );
};

interface BarsProps<TDatum> {
  data: readonly TDatum[];
  xKey?: BarChartProps<TDatum>["xKey"];
  series: readonly BarChartProps<TDatum>["series"][number][];
  yDomain: readonly [number, number];
  stacked: boolean;
  grouped: boolean;
  horizontal: boolean;
  radius: number;
  minBarSize: number;
  valueLabels: boolean;
  onBarClick?: BarChartProps<TDatum>["onBarClick"];
}

const Bars = <TDatum,>({
  data,
  xKey,
  series,
  yDomain,
  stacked,
  grouped,
  horizontal,
  radius,
  minBarSize,
  valueLabels,
  onBarClick,
}: BarsProps<TDatum>) => {
  const { plotArea } = useChartContext<TDatum>();
  const readX = normalizeAccessor(xKey ?? ((_datum: TDatum, index: number) => index));
  const domain = inferCategoricalDomain(data, xKey ?? ((_datum, index) => index));
  const categoryScale = createBandScale({
    domain,
    range: horizontal ? [0, plotArea.height] : [0, plotArea.width],
    paddingInner: 0.2,
  });
  const innerScale = createBandScale({
    domain: series.map((entry) => entry.id ?? String(entry.key)),
    range: [0, categoryScale.bandwidth()],
    paddingInner: grouped ? 0.1 : 0,
    paddingOuter: 0,
  });
  const valueScale = createLinearScale({
    domain: yDomain,
    range: horizontal ? [0, plotArea.width] : [plotArea.height, 0],
    nice: true,
  });
  const stackedLayers = stacked
    ? getStackedValues(
        data,
        series.map((entry) => ({ id: entry.id ?? String(entry.key), value: entry.key })),
      )
    : [];

  return (
    <g data-kamod-chart-bars="">
      {series.map((entry, seriesIndex) => {
        const readY = normalizeAccessor(entry.key);
        const seriesId = entry.id ?? String(entry.key);
        return data.map((datum, index) => {
          const category = categoryOf(readX(datum, index), index);
          const categoryPosition = categoryScale(category);
          if (categoryPosition == null) {
            return null;
          }

          const raw = readY(datum, index);
          const value = typeof raw === "number" && Number.isFinite(raw) ? raw : 0;
          const stackValue = stackedLayers[seriesIndex]?.[index];
          const valueStart = stacked ? (stackValue?.y0 ?? 0) : 0;
          const valueEnd = stacked ? (stackValue?.y1 ?? value) : value;
          const scaledStart = valueScale(valueStart);
          const scaledEnd = valueScale(valueEnd);
          const groupOffset = stacked ? 0 : (innerScale(seriesId) ?? 0);
          const bandSize = stacked ? categoryScale.bandwidth() : innerScale.bandwidth();
          const x = horizontal ? Math.min(scaledStart, scaledEnd) : categoryPosition + groupOffset;
          const y = horizontal ? categoryPosition + groupOffset : Math.min(scaledStart, scaledEnd);
          const barWidth = horizontal
            ? Math.max(Math.abs(scaledEnd - scaledStart), minBarSize)
            : bandSize;
          const barHeight = horizontal
            ? bandSize
            : Math.max(Math.abs(scaledEnd - scaledStart), minBarSize);
          const labelX = horizontal ? x + barWidth + 4 : x + barWidth / 2;
          const labelY = horizontal ? y + barHeight / 2 : y - 4;

          return (
            <g key={`${seriesId}-${index}`}>
              <path
                d={roundedRectPath(x, y, barWidth, barHeight, radius)}
                fill={entry.color ?? `var(--chart-${(seriesIndex % 4) + 1})`}
                data-kamod-chart-bar=""
                onClick={onBarClick ? () => onBarClick(datum, seriesId, index, value) : undefined}
              />
              {valueLabels ? (
                <text
                  x={labelX}
                  y={labelY}
                  text-anchor={horizontal ? "start" : "middle"}
                  dominant-baseline="middle"
                >
                  {value}
                </text>
              ) : null}
            </g>
          );
        });
      })}
    </g>
  );
};
