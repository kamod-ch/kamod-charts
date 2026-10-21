import { D as DataAccessor, o as ChartSize, g as ChartMargin, l as ChartRect, c as ChartContextValue, a as ChartAccessibilityOptions, p as ChartSurfaceSvgOptions, m as ChartRootProps } from '../types-B5951TWW.js';
export { C as ChartCartesianScaleKind, b as ChartClippingOptions, d as ChartDefsSlotOptions, e as ChartDimensionsInput, f as ChartInteraction, h as ChartNullableValue, i as ChartOrientation, j as ChartPlotLayers, k as ChartPrimitiveValue, n as ChartSeries, q as ChartSvgProps, r as DomainDataAccessor, N as NumericDataAccessor } from '../types-B5951TWW.js';
import * as preact from 'preact';
import { ComponentChildren, CSSProperties, KeyboardEventHandler, PointerEventHandler } from 'preact';

type NormalizedAccessor<TDatum, TValue> = (datum: TDatum, index: number) => TValue;
declare const normalizeAccessor: <TDatum, TValue>(accessor: DataAccessor<TDatum, TValue>) => NormalizedAccessor<TDatum, TValue>;
declare const readAccessor: <TDatum, TValue>(datum: TDatum, index: number, accessor: DataAccessor<TDatum, TValue>) => TValue;

declare const defaultChartMargin: ChartMargin;
declare const normalizeMargin: (margin?: Partial<ChartMargin>) => ChartMargin;
declare const clampDimension: (value: number) => number;
declare const resolveChartSize: ({ width, height, initialWidth, responsive, aspectRatio, measuredWidth, }: {
    width?: number;
    height?: number;
    initialWidth?: number;
    responsive?: boolean;
    aspectRatio?: number;
    /** Responsive width from `ResizeObserver` (client only, after hydration). */
    measuredWidth?: number;
}) => ChartSize;
declare const calculatePlotArea: (size: ChartSize, margin: ChartMargin) => ChartRect;

declare const ChartProvider: preact.Provider<ChartContextValue<unknown> | null>;
declare const useChartContext: <TDatum>() => ChartContextValue<TDatum>;

interface ChartSurfaceProps extends ChartAccessibilityOptions, ChartSize, ChartSurfaceSvgOptions {
    children?: ComponentChildren;
    class?: string;
    style?: CSSProperties | string;
    tabIndex?: number;
    onKeyDown?: KeyboardEventHandler<SVGSVGElement>;
    onPointerMove?: PointerEventHandler<SVGSVGElement>;
    onPointerLeave?: PointerEventHandler<SVGSVGElement>;
}
declare const ChartSurface: ({ id, title, description, labelledBy, describedBy, role, width, height, class: className, style, tabIndex, onKeyDown, onPointerMove, onPointerLeave, svgRef, svgProps, children, }: ChartSurfaceProps) => preact.JSX.Element;

declare const createPlotClipPathId: (rootId: string) => string;

declare const defaultEmptyState: preact.JSX.Element;
declare const ChartRoot: <TDatum>({ data, width, height, initialWidth, responsive, aspectRatio, margin, xKey, xScale, id, title, description, labelledBy, describedBy, role, children, plotLayers, defs, clipPlotArea, class: className, style, tabIndex, onKeyDown, onPointerMove, onPointerLeave, svgRef, svgProps, overlay, emptyState, }: ChartRootProps<TDatum>) => preact.JSX.Element;
declare const Chart: <TDatum>({ data, width, height, initialWidth, responsive, aspectRatio, margin, xKey, xScale, id, title, description, labelledBy, describedBy, role, children, plotLayers, defs, clipPlotArea, class: className, style, tabIndex, onKeyDown, onPointerMove, onPointerLeave, svgRef, svgProps, overlay, emptyState, }: ChartRootProps<TDatum>) => preact.JSX.Element;

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

export { Chart, ChartAccessibilityOptions, ChartContextValue, ChartMargin, ChartProvider, ChartRect, ChartRoot, ChartRootProps, ChartSize, ChartSurface, ChartSurfaceSvgOptions, DataAccessor, PlotArea, ResponsiveContainer, calculatePlotArea, clampDimension, createPlotClipPathId, defaultChartMargin, defaultEmptyState, normalizeAccessor, normalizeMargin, readAccessor, resolveChartSize, useChartContext };
export type { ChartSurfaceProps, NormalizedAccessor, PlotAreaProps, ResponsiveContainerProps, ResponsiveContainerRenderState };
