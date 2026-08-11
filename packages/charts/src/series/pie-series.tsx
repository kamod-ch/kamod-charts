import { arc, pie, type PieArcDatum } from "d3-shape";
import type { ComponentChildren } from "preact";
import { useMemo } from "preact/hooks";
import { normalizeAccessor, useChartContext, type DataAccessor } from "../core";

export interface PieDatum<TDatum> {
  datum: TDatum;
  index: number;
  label: string;
  value: number;
  color: string;
}

export interface PieSeriesProps<TDatum> {
  valueKey: DataAccessor<TDatum, number | null | undefined>;
  labelKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  innerRadius?: number;
  outerRadius?: number;
  padAngle?: number;
  cornerRadius?: number;
  sort?: boolean | ((a: PieDatum<TDatum>, b: PieDatum<TDatum>) => number);
  activeIndex?: number | null;
  activeOffset?: number;
  colors?: readonly string[];
  labelPosition?: "none" | "inside" | "outside";
  centerContent?: ComponentChildren;
  class?: string;
  onSegmentClick?: (datum: TDatum, index: number, value: number) => void;
}

const defaultColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

const valueToLabel = (value: string | number | Date | null | undefined, index: number): string => {
  if (value == null) {
    return `Segment ${index + 1}`;
  }

  return value instanceof Date ? value.toISOString() : String(value);
};

export const PieSeries = <TDatum,>({
  valueKey,
  labelKey,
  innerRadius = 0,
  outerRadius,
  padAngle = 0,
  cornerRadius = 0,
  sort = false,
  activeIndex = null,
  activeOffset = 6,
  colors = defaultColors,
  labelPosition = "inside",
  centerContent,
  class: className,
  onSegmentClick,
}: PieSeriesProps<TDatum>) => {
  const { data, plotArea } = useChartContext<TDatum>();
  const radius = outerRadius ?? Math.max(0, Math.min(plotArea.width, plotArea.height) / 2);
  const centerX = plotArea.width / 2;
  const centerY = plotArea.height / 2;
  const readValue = normalizeAccessor(valueKey);
  const readLabel = normalizeAccessor(labelKey ?? ((_datum: TDatum, index: number) => index));
  const pieData = useMemo(
    () =>
      data.map((datum, index) => {
        const raw = readValue(datum, index);
        const value = typeof raw === "number" && Number.isFinite(raw) ? Math.max(0, raw) : 0;
        return {
          datum,
          index,
          label: valueToLabel(readLabel(datum, index), index),
          value,
          color: colors[index % colors.length] ?? "var(--chart-1)",
        };
      }),
    [colors, data, readLabel, readValue],
  );
  const total = pieData.reduce((sum, datum) => sum + datum.value, 0);
  const arcs = useMemo(() => {
    const generator = pie<PieDatum<TDatum>>()
      .value((datum) => datum.value)
      .padAngle(padAngle);

    if (sort === false) {
      generator.sort(null);
    } else if (typeof sort === "function") {
      generator.sort(sort);
    }

    return generator(pieData.filter((datum) => datum.value > 0));
  }, [padAngle, pieData, sort]);

  if (total <= 0) {
    return (
      <g
        class={className}
        data-kamod-chart-pie-series=""
        transform={`translate(${centerX} ${centerY})`}
      >
        <text text-anchor="middle" dominant-baseline="middle">
          Keine positiven Werte
        </text>
        {centerContent}
      </g>
    );
  }

  return (
    <g
      class={className}
      data-kamod-chart-pie-series=""
      transform={`translate(${centerX} ${centerY})`}
    >
      {arcs.map((segment) => {
        const isActive = activeIndex === segment.data.index;
        const segmentArc = arc<PieArcDatum<PieDatum<TDatum>>>()
          .innerRadius(innerRadius)
          .outerRadius(radius + (isActive ? activeOffset : 0))
          .cornerRadius(cornerRadius);
        const labelArc = arc<PieArcDatum<PieDatum<TDatum>>>()
          .innerRadius(labelPosition === "outside" ? radius + 18 : (innerRadius + radius) / 2)
          .outerRadius(labelPosition === "outside" ? radius + 18 : (innerRadius + radius) / 2);
        const [labelX, labelY] = labelArc.centroid(segment);

        return (
          <g key={segment.data.index} data-kamod-chart-pie-segment="">
            <path
              d={segmentArc(segment) ?? ""}
              fill={segment.data.color}
              stroke="var(--chart-tooltip-background)"
              stroke-width="1"
              data-kamod-chart-active={isActive ? "true" : undefined}
              onClick={
                onSegmentClick
                  ? () => onSegmentClick(segment.data.datum, segment.data.index, segment.data.value)
                  : undefined
              }
            />
            {labelPosition === "none" ? null : (
              <text x={labelX} y={labelY} text-anchor="middle" dominant-baseline="middle">
                {segment.data.label}
              </text>
            )}
          </g>
        );
      })}
      {centerContent}
    </g>
  );
};
