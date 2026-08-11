import type { ComponentChildren } from "preact";
import type { ChartCartesianScaleKind, DataAccessor } from "../core";
import type { LineCurve } from "../series";

export interface CartesianSeriesConfig<TDatum> {
  key: DataAccessor<TDatum, number | null | undefined>;
  id?: string;
  label?: string;
  color?: string;
  hidden?: boolean;
}

export interface CartesianReferenceLine<TDatum> {
  y?: number;
  x?: string | number | Date;
  label?: string;
  color?: string;
  yKey?: DataAccessor<TDatum, number | Date | null | undefined>;
}

export interface CommonCartesianChartProps<TDatum> {
  data: readonly TDatum[];
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ChartCartesianScaleKind;
  width?: number;
  height: number;
  initialWidth?: number;
  responsive?: boolean;
  title?: string;
  description?: string;
  id?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  tooltip?: boolean;
}

export interface LineChartProps<TDatum> extends CommonCartesianChartProps<TDatum> {
  series: readonly CartesianSeriesConfig<TDatum>[];
  curve?: LineCurve;
  connectNulls?: boolean;
  showPoints?: boolean | "auto";
  referenceLines?: readonly CartesianReferenceLine<TDatum>[];
}

export interface AreaChartProps<TDatum> extends CommonCartesianChartProps<TDatum> {
  series: readonly CartesianSeriesConfig<TDatum>[];
  stacked?: boolean;
  baseline?: number;
  opacity?: number;
  outline?: boolean;
  curve?: LineCurve;
  referenceLines?: readonly CartesianReferenceLine<TDatum>[];
}

export interface BarChartProps<TDatum> extends CommonCartesianChartProps<TDatum> {
  series: readonly CartesianSeriesConfig<TDatum>[];
  orientation?: "vertical" | "horizontal";
  stacked?: boolean;
  grouped?: boolean;
  radius?: number;
  minBarSize?: number;
  valueLabels?: boolean;
  referenceLines?: readonly CartesianReferenceLine<TDatum>[];
  onBarClick?: (datum: TDatum, seriesId: string, index: number, value: number) => void;
}

export interface PieChartProps<TDatum> {
  data: readonly TDatum[];
  valueKey: DataAccessor<TDatum, number | null | undefined>;
  labelKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  width?: number;
  height: number;
  initialWidth?: number;
  responsive?: boolean;
  title?: string;
  description?: string;
  id?: string;
  innerRadius?: number;
  outerRadius?: number;
  padAngle?: number;
  cornerRadius?: number;
  sort?: boolean;
  labels?: "none" | "inside" | "outside";
  colors?: readonly string[];
  centerContent?: ComponentChildren;
  onSegmentClick?: (datum: TDatum, index: number, value: number) => void;
}

export interface ScatterChartProps<TDatum> extends CommonCartesianChartProps<TDatum> {
  series: readonly CartesianSeriesConfig<TDatum>[];
  pointSize?: number | ((datum: TDatum, index: number) => number);
  referenceLines?: readonly CartesianReferenceLine<TDatum>[];
}
