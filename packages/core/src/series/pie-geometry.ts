import { arc, pie, type PieArcDatum } from "d3-shape";
import { sliceKey, uniquifyKeys } from "../animation/keys";
import { normalizeAccessor, type DataAccessor } from "../core";

export interface PieDatum<TDatum> {
  datum: TDatum;
  index: number;
  label: string;
  value: number;
  color: string;
}

export const defaultPieColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
];

export const valueToPieLabel = (
  value: string | number | Date | null | undefined,
  index: number,
): string => {
  if (value == null) {
    return `Segment ${index + 1}`;
  }

  return value instanceof Date ? value.toISOString() : String(value);
};

export interface PieSlice<TDatum> extends PieDatum<TDatum> {
  key: string;
  startAngle: number;
  endAngle: number;
  padAngle: number;
  innerRadius: number;
  outerRadius: number;
  cornerRadius: number;
}

export interface BuildPieSlicesOptions<TDatum> {
  data: readonly TDatum[];
  valueKey: DataAccessor<TDatum, number | null | undefined>;
  labelKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  innerRadius: number;
  outerRadius: number;
  padAngle: number;
  cornerRadius: number;
  sort?: boolean | ((a: PieDatum<TDatum>, b: PieDatum<TDatum>) => number);
  colors?: readonly string[];
  activeIndex?: number | null;
  activeOffset?: number;
}

export const buildPieSlices = <TDatum>({
  data,
  valueKey,
  labelKey,
  innerRadius,
  outerRadius,
  padAngle,
  cornerRadius,
  sort = false,
  colors = defaultPieColors,
  activeIndex = null,
  activeOffset = 6,
}: BuildPieSlicesOptions<TDatum>): { slices: PieSlice<TDatum>[]; total: number } => {
  const readValue = normalizeAccessor(valueKey);
  const readLabel = normalizeAccessor(labelKey ?? ((_datum: TDatum, index: number) => index));
  const pieData = data.map((datum, index) => {
    const raw = readValue(datum, index);
    const value = typeof raw === "number" && Number.isFinite(raw) ? Math.max(0, raw) : 0;
    return {
      datum,
      index,
      label: valueToPieLabel(readLabel(datum, index), index),
      value,
      color: colors[index % colors.length] ?? "var(--chart-1)",
    };
  });
  const keys = uniquifyKeys(pieData.map((entry) => sliceKey(entry.label, entry.index)));
  const total = pieData.reduce((sum, entry) => sum + entry.value, 0);
  const generator = pie<PieDatum<TDatum>>()
    .value((entry) => entry.value)
    .padAngle(padAngle);

  if (sort === false) {
    generator.sort(null);
  } else if (typeof sort === "function") {
    generator.sort(sort);
  }

  const arcs = generator(pieData.filter((entry) => entry.value > 0));
  const slices = arcs.map((segment) => {
    const isActive = activeIndex === segment.data.index;
    return {
      ...segment.data,
      key: keys[segment.data.index] ?? sliceKey(segment.data.label, segment.data.index),
      startAngle: segment.startAngle,
      endAngle: segment.endAngle,
      padAngle: segment.padAngle,
      innerRadius,
      outerRadius: outerRadius + (isActive ? activeOffset : 0),
      cornerRadius,
    };
  });

  return { slices, total };
};

export const pieSlicePath = <TDatum>(slice: PieSlice<TDatum>): string => {
  const generator = arc<PieArcDatum<PieDatum<TDatum>>>()
    .innerRadius(slice.innerRadius)
    .outerRadius(slice.outerRadius)
    .cornerRadius(slice.cornerRadius);

  return (
    generator({
      data: slice,
      index: slice.index,
      value: slice.value,
      startAngle: slice.startAngle,
      endAngle: slice.endAngle,
      padAngle: slice.padAngle,
    }) ?? ""
  );
};

export const pieLabelPoint = <TDatum>(
  slice: PieSlice<TDatum>,
  labelPosition: "inside" | "outside",
): readonly [number, number] => {
  const radius =
    labelPosition === "outside"
      ? slice.outerRadius + 18
      : (slice.innerRadius + slice.outerRadius) / 2;
  const generator = arc<PieArcDatum<PieDatum<TDatum>>>().innerRadius(radius).outerRadius(radius);

  return generator.centroid({
    data: slice,
    index: slice.index,
    value: slice.value,
    startAngle: slice.startAngle,
    endAngle: slice.endAngle,
    padAngle: slice.padAngle,
  });
};
