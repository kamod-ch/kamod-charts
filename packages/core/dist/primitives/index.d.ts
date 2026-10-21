import * as preact from 'preact';
import { JSX, ComponentChildren } from 'preact';
import { D as DataAccessor, C as ChartCartesianScaleKind, f as ChartInteraction } from '../types-rFU8suko.js';
import { C as ChartXViewportDomain, T as TooltipPlacement } from '../x-viewport-PV7LAEVO.js';
export { R as ResolvedTooltipPlacement, b as TooltipPlacementInput, c as TooltipPlacementResult, d as calculateTooltipPlacement, e as clampTooltipPosition, v as viewBoxToContainerPixels } from '../x-viewport-PV7LAEVO.js';
import { S as ScaleKind, D as DomainPadding } from '../domain-C6g4S_9B.js';

type CartesianXBrushChangeReason = "brush" | "keyboard";
interface CartesianXBrushProps<TDatum> {
    selection: ChartXViewportDomain;
    extents: ChartXViewportDomain;
    xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
    xScale?: ChartCartesianScaleKind;
    minSpan?: number;
    onSelectionChange: (domain: ChartXViewportDomain, reason: CartesianXBrushChangeReason) => void;
}
declare const CartesianXBrush: <TDatum>({ selection, extents, xKey, xScale, minSpan, onSelectionChange, }: CartesianXBrushProps<TDatum>) => JSX.Element | null;

interface CrosshairProps<TDatum> {
    interaction?: ChartInteraction<TDatum> | null;
    /** Plot-relative width. Defaults to the chart plot area width from context. */
    width?: number;
    /** Plot-relative height. Defaults to the chart plot area height from context. */
    height?: number;
    color?: string;
}
declare const Crosshair: <TDatum>({ interaction, width, height, color, }: CrosshairProps<TDatum>) => preact.JSX.Element | null;

interface GridProps<TDatum> {
    xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
    yKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
    xScale?: ScaleKind;
    yScale?: ScaleKind;
    xDomain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
    yDomain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
    xPadding?: number | DomainPadding;
    yPadding?: number | DomainPadding;
    xTickCount?: number;
    yTickCount?: number;
    vertical?: boolean;
    horizontal?: boolean;
    class?: string;
}
declare const Grid: <TDatum>({ xKey, yKey, xScale, yScale, xDomain, yDomain, xPadding, yPadding, xTickCount, yTickCount, vertical, horizontal, class: className, }: GridProps<TDatum>) => preact.JSX.Element;

interface LegendItem {
    id: string;
    label?: string;
    color?: string;
    hidden?: boolean;
}
interface LegendProps {
    items: readonly LegendItem[];
    onToggle?: (id: string) => void;
}
declare const Legend: ({ items, onToggle }: LegendProps) => preact.JSX.Element;

interface LiveRegionProps<TDatum> {
    interaction?: ChartInteraction<TDatum> | null;
    format?: (interaction: ChartInteraction<TDatum>) => string;
}
declare const LiveRegion: <TDatum>({ interaction, format }: LiveRegionProps<TDatum>) => preact.JSX.Element;

interface ReferenceLineProps<TDatum> {
    x?: string | number | Date;
    y?: string | number | Date;
    xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
    yKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
    xScale?: ScaleKind;
    yScale?: ScaleKind;
    xDomain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
    yDomain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
    xPadding?: number | DomainPadding;
    yPadding?: number | DomainPadding;
    label?: string;
    color?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
    class?: string;
}
declare const ReferenceLine: <TDatum>({ x, y, xKey, yKey, xScale, yScale, xDomain, yDomain, xPadding, yPadding, label, color, strokeWidth, strokeDasharray, class: className, }: ReferenceLineProps<TDatum>) => preact.JSX.Element | null;

interface ReferenceAreaProps<TDatum> {
    x1?: string | number | Date;
    x2?: string | number | Date;
    y1?: string | number | Date;
    y2?: string | number | Date;
    xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
    yKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
    xScale?: ScaleKind;
    yScale?: ScaleKind;
    xDomain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
    yDomain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
    xPadding?: number | DomainPadding;
    yPadding?: number | DomainPadding;
    id?: string;
    label?: string;
    fill?: string;
    fillOpacity?: number;
    class?: string;
}
declare const ReferenceArea: <TDatum>({ x1, x2, y1, y2, xKey, yKey, xScale, yScale, xDomain, yDomain, xPadding, yPadding, id, label, fill, fillOpacity, class: className, }: ReferenceAreaProps<TDatum>) => preact.JSX.Element | null;

type ReferencePointShape = "circle" | "square" | "diamond";
type ReferencePointLabelPosition = "top" | "right" | "bottom" | "left";

interface ReferencePointProps<TDatum> {
    x: string | number | Date;
    y: string | number | Date;
    xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
    yKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
    xScale?: ScaleKind;
    yScale?: ScaleKind;
    xDomain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
    yDomain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
    xPadding?: number | DomainPadding;
    yPadding?: number | DomainPadding;
    id?: string;
    label?: string;
    color?: string;
    size?: number;
    shape?: ReferencePointShape;
    labelPosition?: ReferencePointLabelPosition;
    class?: string;
}
declare const ReferencePoint: <TDatum>({ x, y, xKey, yKey, xScale, yScale, xDomain, yDomain, xPadding, yPadding, id, label, color, size, shape, labelPosition, class: className, }: ReferencePointProps<TDatum>) => preact.JSX.Element | null;

type ReferenceSegmentLabelPosition = "start" | "middle" | "end";

interface ReferenceSegmentEndpoint {
    x: string | number | Date;
    y: string | number | Date;
}
interface ReferenceSegmentProps<TDatum> {
    start: ReferenceSegmentEndpoint;
    end: ReferenceSegmentEndpoint;
    xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
    yKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
    xScale?: ScaleKind;
    yScale?: ScaleKind;
    xDomain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
    yDomain?: readonly [number, number] | readonly [Date, Date] | readonly string[];
    xPadding?: number | DomainPadding;
    yPadding?: number | DomainPadding;
    id?: string;
    label?: string;
    labelPosition?: ReferenceSegmentLabelPosition;
    color?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
    class?: string;
}
declare const ReferenceSegment: <TDatum>({ start, end, xKey, yKey, xScale, yScale, xDomain, yDomain, xPadding, yPadding, id, label, labelPosition, color, strokeWidth, strokeDasharray, class: className, }: ReferenceSegmentProps<TDatum>) => preact.JSX.Element | null;

interface TooltipProps<TDatum> {
    interaction?: ChartInteraction<TDatum> | null;
    visible?: boolean;
    children?: (interaction: ChartInteraction<TDatum>) => ComponentChildren;
    placement?: TooltipPlacement;
    offset?: number;
}
declare const Tooltip: <TDatum>({ interaction, visible, children, placement, offset, }: TooltipProps<TDatum>) => preact.JSX.Element | null;

export { CartesianXBrush, type CartesianXBrushChangeReason, type CartesianXBrushProps, Crosshair, type CrosshairProps, Grid, type GridProps, Legend, type LegendItem, type LegendProps, LiveRegion, type LiveRegionProps, ReferenceArea, type ReferenceAreaProps, ReferenceLine, type ReferenceLineProps, ReferencePoint, type ReferencePointLabelPosition, type ReferencePointProps, type ReferencePointShape, ReferenceSegment, type ReferenceSegmentEndpoint, type ReferenceSegmentLabelPosition, type ReferenceSegmentProps, Tooltip, TooltipPlacement, type TooltipProps };
