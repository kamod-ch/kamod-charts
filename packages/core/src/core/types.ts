import type { ComponentChildren, JSX } from "preact";
import type { ChartClippingOptions, ChartDefsSlotOptions, ChartPlotLayers } from "./chart-layers";
import type { ChartSurfaceSvgOptions } from "./chart-svg-props";

export type ChartPrimitiveValue = string | number | Date;
export type ChartNullableValue<TValue extends ChartPrimitiveValue = ChartPrimitiveValue> =
  | TValue
  | null
  | undefined;

export type DataAccessor<TDatum, TValue = ChartPrimitiveValue> =
  | Extract<keyof TDatum, string | number>
  | ((datum: TDatum, index: number) => TValue);

export type NumericDataAccessor<TDatum> = DataAccessor<TDatum, number | null | undefined>;
export type DomainDataAccessor<TDatum> = DataAccessor<TDatum, ChartNullableValue>;

export interface ChartSeries<TDatum> {
  id: string;
  label?: string;
  value: NumericDataAccessor<TDatum>;
  color?: string;
  hidden?: boolean;
}

export interface ChartMargin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartSize {
  width: number;
  height: number;
}

export interface ChartRect extends ChartSize {
  x: number;
  y: number;
}

export type ChartOrientation = "vertical" | "horizontal";
export type ChartCartesianScaleKind = "linear" | "time" | "band" | "point";

export interface ChartInteraction<TDatum> {
  datum: TDatum;
  seriesId: string;
  index: number;
  value: number | null;
  x: number;
  y: number;
  /** Optional human-readable series label for tooltips / live regions. */
  label?: string;
  nativeEvent?: PointerEvent | KeyboardEvent;
}

export interface ChartAccessibilityOptions {
  id?: string;
  title?: string;
  description?: string;
  labelledBy?: string;
  describedBy?: string;
  role?: "img" | "group";
}

export interface ChartDimensionsInput {
  width?: number;
  /** Ignored when `aspectRatio` is set on a responsive chart. */
  height?: number;
  initialWidth?: number;
  responsive?: boolean;
  /** width / height; derives height from measured width when `responsive` is true. */
  aspectRatio?: number;
}

export interface ChartRootProps<TDatum>
  extends
    ChartDimensionsInput,
    ChartAccessibilityOptions,
    ChartSurfaceSvgOptions,
    ChartDefsSlotOptions,
    ChartClippingOptions {
  data: readonly TDatum[];
  margin?: Partial<ChartMargin>;
  xKey?: DomainDataAccessor<TDatum>;
  xScale?: ChartCartesianScaleKind;
  children?: ComponentChildren;
  /**
   * Explicit cartesian layer content. When set, `children` are not rendered in the plot
   * (use `children` only for unstructured low-level charts).
   */
  plotLayers?: ChartPlotLayers;
  class?: string;
  style?: JSX.CSSProperties | string;
  tabIndex?: number;
  onKeyDown?: JSX.KeyboardEventHandler<SVGSVGElement>;
  onPointerMove?: JSX.PointerEventHandler<SVGSVGElement>;
  onPointerLeave?: JSX.PointerEventHandler<SVGSVGElement>;
  overlay?: ComponentChildren;
  emptyState?: ComponentChildren;
}

export interface ChartContextValue<TDatum> {
  data: readonly TDatum[];
  ids: {
    root: string;
    title: string;
    description: string;
    plotClipPath?: string;
  };
  margin: ChartMargin;
  size: ChartSize;
  plotArea: ChartRect;
  isEmpty: boolean;
  xKey?: DomainDataAccessor<TDatum>;
  xScale?: ChartCartesianScaleKind;
}
