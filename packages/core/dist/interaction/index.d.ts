import { CartesianPoint } from '../index.js';
import { KeyboardEventHandler } from 'preact';
import { ChartRect } from '../core/index.js';
import '../domain-BWwIEiBj.js';

type CartesianHitResult = {
    index: number;
    seriesIndex: number;
    distanceSquared: number;
};
type ProjectedXCandidate = {
    index: number;
    x: number;
};
type ProjectedPointCandidate = {
    index: number;
    seriesIndex: number;
    x: number;
    y: number;
};
declare const findNearestProjectedX: (candidates: readonly ProjectedXCandidate[], plotX: number) => {
    index: number;
    distanceSquared: number;
} | null;
declare const findNearestProjectedPoint: (candidates: readonly ProjectedPointCandidate[], plotX: number, plotY: number) => CartesianHitResult | null;
declare const findNearestPoint: <TDatum>(points: readonly CartesianPoint<TDatum>[], x: number, y: number) => CartesianPoint<TDatum> | undefined;

interface KeyboardNavigationState {
    activeIndex: number;
    activeSeriesIndex: number;
}
interface KeyboardNavigationOptions {
    pointCount: number;
    seriesCount: number;
    activeIndex: number;
    activeSeriesIndex: number;
    onChange: (state: KeyboardNavigationState) => void;
    onSelect?: (state: KeyboardNavigationState) => void;
    onEscape?: () => void;
}
declare const createChartKeyboardHandler: ({ pointCount, seriesCount, activeIndex, activeSeriesIndex, onChange, onSelect, onEscape, }: KeyboardNavigationOptions) => KeyboardEventHandler<SVGSVGElement>;

interface ChartPointerPosition {
    x: number;
    y: number;
    plotX: number;
    plotY: number;
}
/** Pointer or wheel events with client coordinates relative to the chart surface. */
type ChartPointerClientEvent = {
    clientX: number;
    clientY: number;
    currentTarget: EventTarget | null;
};
declare const getPointerPosition: (event: ChartPointerClientEvent, plotArea: ChartRect) => ChartPointerPosition;
/**
 * Maps plot X to a datum index assuming equal spacing across the plot width.
 * Intended only for explicitly index-spaced domains. Continuous numeric/time
 * and scatter selection should use projected-position helpers instead.
 */
declare const getNearestIndexByX: (plotX: number, plotWidth: number, pointCount: number) => number;

export { createChartKeyboardHandler, findNearestPoint, findNearestProjectedPoint, findNearestProjectedX, getNearestIndexByX, getPointerPosition };
export type { CartesianHitResult, ChartPointerClientEvent, ChartPointerPosition, KeyboardNavigationOptions, KeyboardNavigationState };
