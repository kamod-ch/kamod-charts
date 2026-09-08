import type { ComponentChildren } from "preact";
import type { ChartAnimate } from "../animation";
import type { ChartCartesianScaleKind, DataAccessor } from "../core";
import type { TooltipPlacement } from "../primitives/tooltip-placement";
import type { LineCurve, AreaFill } from "../series";

export interface CartesianSeriesConfig<TDatum> {
  key: DataAccessor<TDatum, number | null | undefined>;
  id?: string;
  label?: string;
  color?: string;
  hidden?: boolean;
}

export interface BarDatumContext<TDatum> {
  datum: TDatum;
  index: number;
  value: number;
  valueStart: number;
  valueEnd: number;
  seriesId: string;
  seriesIndex: number;
  orientation: "vertical" | "horizontal";
  stacked: boolean;
  active: boolean;
}

export type BarFill<TDatum> = string | ((context: BarDatumContext<TDatum>) => string | undefined);

export interface BarSeriesConfig<TDatum> extends CartesianSeriesConfig<TDatum> {
  fill?: BarFill<TDatum>;
  valueLabels?: boolean | BarValueLabelOptions<TDatum>;
}

export interface BarValueLabelContext<TDatum> extends BarDatumContext<TDatum> {
  defaultLabel: string;
}

export interface BarValueLabelOptions<TDatum> {
  position?: "auto" | "inside" | "outside" | "center";
  format?: (value: number, context: BarValueLabelContext<TDatum>) => ComponentChildren;
  color?: string;
  class?: string;
  offset?: number;
}

export interface LineSeriesConfig<TDatum> extends CartesianSeriesConfig<TDatum> {
  strokeWidth?: number;
  strokeDasharray?: string;
  showPoints?: boolean | "auto";
  pointRadius?: number;
}

export interface CartesianReferenceLine<TDatum> {
  y?: number | Date | string;
  x?: string | number | Date;
  label?: string;
  color?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  yKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
}

export interface CartesianReferencePoint<TDatum> {
  id?: string;
  x: string | number | Date;
  y: number | Date | string;
  label?: string;
  color?: string;
  size?: number;
  shape?: "circle" | "square" | "diamond";
  labelPosition?: "top" | "right" | "bottom" | "left";
  class?: string;
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  yKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
}

export interface CartesianReferenceArea<TDatum> {
  id?: string;
  x1?: string | number | Date;
  x2?: string | number | Date;
  y1?: number | Date | string;
  y2?: number | Date | string;
  label?: string;
  fill?: string;
  fillOpacity?: number;
  class?: string;
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  yKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
}

export type CartesianTooltipMode = "axis" | "nearest";
export type { TooltipPlacement };

export interface CartesianTooltipSeriesValue<TDatum> {
  id: string;
  label: string;
  color?: string;
  value: number | null;
  series: CartesianSeriesConfig<TDatum>;
  stackStart?: number;
  stackEnd?: number;
}

export interface CartesianTooltipContext<TDatum> {
  datum: TDatum;
  index: number;
  xValue: string | number | Date | null;
  xLabel: string | null;
  seriesId: string;
  seriesLabel?: string;
  seriesValues: readonly CartesianTooltipSeriesValue<TDatum>[];
  x: number;
  y: number;
}

export interface CartesianTooltipOptions<TDatum> {
  mode?: CartesianTooltipMode;
  placement?: TooltipPlacement;
  offset?: number;
  render?: (context: CartesianTooltipContext<TDatum>) => ComponentChildren;
  formatValue?: (
    value: number | null,
    context: CartesianTooltipContext<TDatum>,
  ) => ComponentChildren | null | undefined;
  formatLabel?: (
    xValue: string | number | Date | null,
    context: CartesianTooltipContext<TDatum>,
  ) => ComponentChildren | null | undefined;
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
  tooltip?: boolean | CartesianTooltipOptions<TDatum>;
  animate?: ChartAnimate;
}

export interface LineChartProps<TDatum> extends CommonCartesianChartProps<TDatum> {
  series: readonly LineSeriesConfig<TDatum>[];
  stacked?: boolean;
  curve?: LineCurve;
  connectNulls?: boolean;
  strokeWidth?: number;
  strokeDasharray?: string;
  showPoints?: boolean | "auto";
  pointRadius?: number;
  referenceLines?: readonly CartesianReferenceLine<TDatum>[];
  referenceAreas?: readonly CartesianReferenceArea<TDatum>[];
  referencePoints?: readonly CartesianReferencePoint<TDatum>[];
}

export interface AreaChartProps<TDatum> extends CommonCartesianChartProps<TDatum> {
  series: readonly CartesianSeriesConfig<TDatum>[];
  stacked?: boolean;
  baseline?: number;
  opacity?: number;
  fill?: AreaFill;
  outline?: boolean;
  strokeWidth?: number;
  strokeDasharray?: string;
  showPoints?: boolean | "auto";
  pointRadius?: number;
  curve?: LineCurve;
  referenceLines?: readonly CartesianReferenceLine<TDatum>[];
}

export interface BarChartProps<TDatum> extends CommonCartesianChartProps<TDatum> {
  series: readonly BarSeriesConfig<TDatum>[];
  orientation?: "vertical" | "horizontal";
  stacked?: boolean;
  grouped?: boolean;
  radius?: number;
  minBarSize?: number;
  maxBarSize?: number;
  valueLabels?: boolean | BarValueLabelOptions<TDatum>;
  referenceLines?: readonly CartesianReferenceLine<TDatum>[];
  referenceAreas?: readonly CartesianReferenceArea<TDatum>[];
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
  animate?: ChartAnimate;
}

export interface ScatterChartProps<TDatum> extends CommonCartesianChartProps<TDatum> {
  series: readonly CartesianSeriesConfig<TDatum>[];
  pointSize?: number | ((datum: TDatum, index: number) => number);
  referenceLines?: readonly CartesianReferenceLine<TDatum>[];
}
