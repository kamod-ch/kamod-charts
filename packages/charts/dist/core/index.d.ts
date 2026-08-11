import { D as DataAccessor, l as ChartSize, e as ChartMargin, i as ChartRect, b as ChartContextValue, C as ChartAccessibilityOptions, j as ChartRootProps } from '../types-CzGslxWS.js';
export { a as ChartCartesianScaleKind, c as ChartDimensionsInput, d as ChartInteraction, f as ChartNullableValue, g as ChartOrientation, h as ChartPrimitiveValue, k as ChartSeries, m as DomainDataAccessor, N as NumericDataAccessor } from '../types-CzGslxWS.js';
import * as preact from 'preact';
import { ComponentChildren, JSX } from 'preact';

type NormalizedAccessor<TDatum, TValue> = (datum: TDatum, index: number) => TValue;
declare const normalizeAccessor: <TDatum, TValue>(accessor: DataAccessor<TDatum, TValue>) => NormalizedAccessor<TDatum, TValue>;
declare const readAccessor: <TDatum, TValue>(datum: TDatum, index: number, accessor: DataAccessor<TDatum, TValue>) => TValue;

declare const defaultChartMargin: ChartMargin;
declare const normalizeMargin: (margin?: Partial<ChartMargin>) => ChartMargin;
declare const clampDimension: (value: number) => number;
declare const resolveChartSize: ({ width, height, initialWidth, responsive, }: {
    width?: number;
    height: number;
    initialWidth?: number;
    responsive?: boolean;
}) => ChartSize;
declare const calculatePlotArea: (size: ChartSize, margin: ChartMargin) => ChartRect;

declare const ChartProvider: preact.Provider<ChartContextValue<unknown> | null>;
declare const useChartContext: <TDatum>() => ChartContextValue<TDatum>;

interface ChartSurfaceProps extends ChartAccessibilityOptions, ChartSize {
    children?: ComponentChildren;
    class?: string;
    style?: JSX.CSSProperties | string;
    tabIndex?: number;
    onKeyDown?: JSX.KeyboardEventHandler<SVGSVGElement>;
    onPointerMove?: JSX.PointerEventHandler<SVGSVGElement>;
    onPointerLeave?: JSX.PointerEventHandler<SVGSVGElement>;
}
declare const ChartSurface: ({ id, title, description, labelledBy, describedBy, role, width, height, class: className, style, tabIndex, onKeyDown, onPointerMove, onPointerLeave, children, }: ChartSurfaceProps) => JSX.Element;

declare const defaultEmptyState: preact.JSX.Element;
declare const ChartRoot: <TDatum>({ data, width, height, initialWidth, responsive, margin, xKey, xScale, id, title, description, labelledBy, describedBy, role, children, class: className, style, tabIndex, onKeyDown, onPointerMove, onPointerLeave, overlay, emptyState, }: ChartRootProps<TDatum>) => preact.JSX.Element;
declare const Chart: <TDatum>({ data, width, height, initialWidth, responsive, margin, xKey, xScale, id, title, description, labelledBy, describedBy, role, children, class: className, style, tabIndex, onKeyDown, onPointerMove, onPointerLeave, overlay, emptyState, }: ChartRootProps<TDatum>) => preact.JSX.Element;

interface PlotAreaProps {
    children?: ComponentChildren;
    class?: string;
}
declare const PlotArea: <TDatum>({ children, class: className }: PlotAreaProps) => preact.JSX.Element;

interface ResponsiveContainerRenderState {
    width: number;
    containerRef: (element: HTMLDivElement | null) => void;
}
interface ResponsiveContainerProps {
    width?: number;
    initialWidth: number;
    responsive?: boolean;
    class?: string;
    children: (state: ResponsiveContainerRenderState) => ComponentChildren;
}
declare const ResponsiveContainer: ({ width, initialWidth, responsive, class: className, children, }: ResponsiveContainerProps) => preact.JSX.Element;

export { Chart, ChartAccessibilityOptions, ChartContextValue, ChartMargin, ChartProvider, ChartRect, ChartRoot, ChartRootProps, ChartSize, ChartSurface, type ChartSurfaceProps, DataAccessor, type NormalizedAccessor, PlotArea, type PlotAreaProps, ResponsiveContainer, type ResponsiveContainerProps, type ResponsiveContainerRenderState, calculatePlotArea, clampDimension, defaultChartMargin, defaultEmptyState, normalizeAccessor, normalizeMargin, readAccessor, resolveChartSize, useChartContext };
