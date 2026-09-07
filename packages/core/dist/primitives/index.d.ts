import * as preact from 'preact';
import { ComponentChildren } from 'preact';
import { d as ChartInteraction, D as DataAccessor } from '../types-Doyfwbln.js';
import { S as ScaleKind, D as DomainPadding } from '../domain-BtgmU7rB.js';
import { T as TooltipPlacement } from '../tooltip-placement-DZrqa8Zt.js';
export { R as ResolvedTooltipPlacement, a as TooltipPlacementInput, b as TooltipPlacementResult, c as calculateTooltipPlacement, d as clampTooltipPosition, v as viewBoxToContainerPixels } from '../tooltip-placement-DZrqa8Zt.js';

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
    class?: string;
}
declare const ReferenceLine: <TDatum>({ x, y, xKey, yKey, xScale, yScale, xDomain, yDomain, xPadding, yPadding, label, color, class: className, }: ReferenceLineProps<TDatum>) => preact.JSX.Element | null;

interface TooltipProps<TDatum> {
    interaction?: ChartInteraction<TDatum> | null;
    visible?: boolean;
    children?: (interaction: ChartInteraction<TDatum>) => ComponentChildren;
    placement?: TooltipPlacement;
    offset?: number;
}
declare const Tooltip: <TDatum>({ interaction, visible, children, placement, offset, }: TooltipProps<TDatum>) => preact.JSX.Element | null;

export { Crosshair, type CrosshairProps, Grid, type GridProps, Legend, type LegendItem, type LegendProps, LiveRegion, type LiveRegionProps, ReferenceLine, type ReferenceLineProps, Tooltip, TooltipPlacement, type TooltipProps };
