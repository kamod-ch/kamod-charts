import type { ComponentChildren } from "preact";
import type { ChartAnimate } from "../animation";
import type { ChartCartesianScaleKind, DataAccessor } from "../core";
import type { ChartChromeProps, CartesianSurfaceChartProps } from "./chart-chrome-props";
import type { TooltipPlacement } from "../primitives/tooltip-placement";
import type {
  AreaFill,
  LineCurve,
  PieLabels,
  PieRose,
  PieSliceContext,
  PieSortComparator,
  RenderBar,
  RenderPoint,
} from "../series";
import type { CartesianYAutoscale, ChartXViewportDomain } from "./x-viewport";
import type {
  XViewportChangeReason,
  XViewportInteractionOptions,
} from "./use-cartesian-x-viewport-gestures";

export interface CartesianSeriesConfig<TDatum> {
  key: DataAccessor<TDatum, number | null | undefined>;
  id?: string;
  label?: string;
  color?: string;
  hidden?: boolean;
  renderPoint?: RenderPoint<TDatum>;
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
  renderBar?: RenderBar<TDatum>;
  valueLabels?: boolean | BarValueLabelOptions<TDatum>;
}

export interface BarValueLabelContext<TDatum> extends BarDatumContext<TDatum> {
  defaultLabel: string;
}

export interface BarValueLabelOptions<TDatum> {
  position?: "auto" | "inside" | "outside" | "center";
  format?: (value: number, context: BarValueLabelContext<TDatum>) => ComponentChildren;
  renderLabel?: (context: BarValueLabelContext<TDatum>) => ComponentChildren;
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

export interface CartesianReferenceSegmentPoint {
  x: string | number | Date;
  y: number | Date | string;
}

export interface CartesianReferenceSegment<TDatum> {
  id?: string;
  start: CartesianReferenceSegmentPoint;
  end: CartesianReferenceSegmentPoint;
  label?: string;
  labelPosition?: "start" | "middle" | "end";
  color?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  class?: string;
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
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
  scatterPoint?: ScatterPointContext<TDatum>;
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

export interface ChartMargin {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export interface ChartFormatOptions {
  locale?: string;
  timeZone?: string;
  number?: Intl.NumberFormatOptions;
}

export interface CartesianActiveSelection {
  activeIndex: number | null;
  activeSeriesId: string | null;
  source?: "pointer" | "keyboard" | "external";
}

export type { CartesianYAutoscale, ChartXViewportDomain };
export type {
  XViewportChangeReason,
  XViewportInteractionOptions,
} from "./use-cartesian-x-viewport-gestures";

export interface CartesianXBrushOptions {
  /** Height of the overview strip (default 72). */
  overviewHeight?: number;
  minSpan?: number;
  /** Min-max downsample budget for overview series (default 320). */
  overviewPointBudget?: number;
}

export interface CommonCartesianChartProps<TDatum> extends CartesianSurfaceChartProps {
  data: readonly TDatum[];
  xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  xScale?: ChartCartesianScaleKind;
  /**
   * Controlled X viewport for `linear` / `time` scales. Ignored for categorical (`point` / `band`) charts.
   */
  xDomain?: ChartXViewportDomain;
  /** When `xDomain` is set, choose whether Y inference uses all rows or only rows inside the window. Default `data`. */
  yAutoscale?: CartesianYAutoscale;
  /** Opt-in drag pan / wheel zoom on linear or time X axes. */
  xViewportInteraction?: boolean | XViewportInteractionOptions;
  /** User-driven viewport updates (not fired when `xDomain` changes from props). */
  onXViewportChange?: (domain: ChartXViewportDomain, reason: XViewportChangeReason) => void;
  /** Fixed numeric Y domain; overrides inference when set. */
  yDomain?: readonly [number, number];
  margin?: ChartMargin;
  /** Shown when `data` is empty (chart-level empty state). */
  emptyContent?: ComponentChildren;
  format?: ChartFormatOptions;
  showGrid?: boolean;
  showLegend?: boolean;
  tooltip?: boolean | CartesianTooltipOptions<TDatum>;
  animate?: ChartAnimate;
  /** Controlled active datum index (cartesian row). */
  activeIndex?: number | null;
  /** Fires on user-driven selection changes only. */
  onActiveChange?: (selection: CartesianActiveSelection) => void;
  /** Controlled hidden series ids (legend toggles). */
  hiddenSeriesIds?: readonly string[];
  onHiddenSeriesChange?: (hiddenIds: readonly string[]) => void;
  /** Extra SVG content in the foreground plot layer (inside clip when enabled). */
  plotForeground?: ComponentChildren;
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
  referenceSegments?: readonly CartesianReferenceSegment<TDatum>[];
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
  referenceAreas?: readonly CartesianReferenceArea<TDatum>[];
  referencePoints?: readonly CartesianReferencePoint<TDatum>[];
  referenceSegments?: readonly CartesianReferenceSegment<TDatum>[];
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

export interface PieChartProps<TDatum> extends ChartChromeProps {
  data: readonly TDatum[];
  valueKey: DataAccessor<TDatum, number | null | undefined>;
  labelKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  innerRadius?: number;
  outerRadius?: number;
  padAngle?: number;
  cornerRadius?: number;
  sort?: boolean | PieSortComparator<TDatum>;
  labels?: PieLabels<TDatum>;
  rose?: PieRose;
  colors?: readonly string[];
  centerContent?: ComponentChildren;
  /** Shown when data exists but no slice has a finite value > 0. Omit for no fallback text. */
  emptyContent?: ComponentChildren;
  activeOffset?: number;
  tooltip?: boolean | PieTooltipOptions<TDatum>;
  showLegend?: boolean;
  legend?: PieLegendOptions;
  onSegmentClick?: (datum: TDatum, index: number, value: number) => void;
  animate?: ChartAnimate;
}

export type DonutVariant = "full" | "half";

export interface DonutCenterContext<TDatum> {
  data: readonly TDatum[];
  variant: DonutVariant;
  total: number;
  grandTotal: number;
  visibleCount: number;
  segmentCount: number;
}

export type DonutCenterContent<TDatum> =
  | ComponentChildren
  | ((context: DonutCenterContext<TDatum>) => ComponentChildren);

export type DonutFormatTotal<TDatum> = (
  total: number,
  context: DonutCenterContext<TDatum>,
) => ComponentChildren;

export interface DonutChartProps<TDatum> extends ChartChromeProps {
  data: readonly TDatum[];
  valueKey: DataAccessor<TDatum, number | null | undefined>;
  labelKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
  variant?: DonutVariant;
  innerRadiusRatio?: number;
  outerRadius?: number;
  padAngle?: number;
  cornerRadius?: number;
  sort?: boolean | PieSortComparator<TDatum>;
  labels?: PieLabels<TDatum>;
  colors?: readonly string[];
  showTotal?: boolean;
  formatTotal?: DonutFormatTotal<TDatum>;
  centerContent?: DonutCenterContent<TDatum>;
  /** Shown when data exists but no slice has a finite value > 0. Omit for no fallback text. */
  emptyContent?: ComponentChildren;
  activeOffset?: number;
  tooltip?: boolean | PieTooltipOptions<TDatum>;
  showLegend?: boolean;
  legend?: PieLegendOptions;
  onSegmentClick?: (datum: TDatum, index: number, value: number) => void;
  animate?: ChartAnimate;
}

export interface PieLegendOptions {
  /** When `false`, legend items render without toggle behavior. Defaults to interactive toggling. */
  interactive?: boolean;
}

export type { PieSliceContext };

export type {
  PieLabelCollision,
  PieLabelLineOptions,
  PieLabelOptions,
  PieLabels,
  PieRose,
  PieRoseOptions,
} from "../series";

export interface PieTooltipOptions<TDatum> {
  placement?: TooltipPlacement;
  offset?: number;
  render?: (context: PieSliceContext<TDatum>) => ComponentChildren;
  formatValue?: (
    value: number,
    context: PieSliceContext<TDatum>,
  ) => ComponentChildren | null | undefined;
  formatPercentage?: (
    percentage: number,
    context: PieSliceContext<TDatum>,
  ) => ComponentChildren | null | undefined;
}

export type ScatterSizeScale = "sqrt" | "linear";

export type ScatterCategoryValue = string | number;

export interface ScatterCategoryConfig {
  value: ScatterCategoryValue;
  id?: string;
  label?: string;
  color?: string;
  hidden?: boolean;
}

export interface ScatterSeriesConfig<TDatum> extends CartesianSeriesConfig<TDatum> {
  pointRadius?: number | ((datum: TDatum, index: number) => number);
  pointOpacity?: number | ((datum: TDatum, index: number) => number);
}

export interface ScatterPointContext<TDatum> {
  datum: TDatum;
  index: number;
  seriesId: string;
  seriesLabel: string | undefined;
  xValue: string | number | Date | null;
  yValue: number | null;
  sizeValue: number | null;
  radius: number;
  categoryValue: ScatterCategoryValue | null;
  categoryId: string | null;
  categoryLabel: string | null;
  color: string;
  active: boolean;
}

export interface ScatterChartProps<TDatum> extends CommonCartesianChartProps<TDatum> {
  series: readonly ScatterSeriesConfig<TDatum>[];
  /**
   * Legacy alias for a fixed marker radius when `sizeKey` is not set.
   * Prefer `pointRadius` for new code.
   */
  pointSize?: number | ((datum: TDatum, index: number) => number);
  pointRadius?: number | ((datum: TDatum, index: number) => number);
  sizeKey?: DataAccessor<TDatum, number | null | undefined>;
  sizeScale?: ScatterSizeScale;
  sizeDomain?: readonly [number, number];
  pointRadiusRange?: readonly [number, number];
  categoryKey?: DataAccessor<TDatum, ScatterCategoryValue | null | undefined>;
  categories?: readonly ScatterCategoryConfig[];
  referenceLines?: readonly CartesianReferenceLine<TDatum>[];
  referenceSegments?: readonly CartesianReferenceSegment<TDatum>[];
  referenceAreas?: readonly CartesianReferenceArea<TDatum>[];
  referencePoints?: readonly CartesianReferencePoint<TDatum>[];
}
