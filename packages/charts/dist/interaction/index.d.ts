import { C as CartesianPoint } from '../cartesian-DicNh8__.js';
import { JSX } from 'preact';
import { i as ChartRect } from '../types-Doyfwbln.js';
import '../domain-BtgmU7rB.js';

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
declare const createChartKeyboardHandler: ({ pointCount, seriesCount, activeIndex, activeSeriesIndex, onChange, onSelect, onEscape, }: KeyboardNavigationOptions) => JSX.KeyboardEventHandler<SVGSVGElement>;

interface ChartPointerPosition {
    x: number;
    y: number;
    plotX: number;
    plotY: number;
}
declare const getPointerPosition: (event: JSX.TargetedPointerEvent<SVGSVGElement>, plotArea: ChartRect) => ChartPointerPosition;
/**
 * Maps plot X to a datum index assuming equal spacing across the plot width.
 * Intended only for explicitly index-spaced domains. Continuous numeric/time
 * and scatter selection should use projected-position helpers instead.
 */
declare const getNearestIndexByX: (plotX: number, plotWidth: number, pointCount: number) => number;

export { type CartesianHitResult, type ChartPointerPosition, type KeyboardNavigationOptions, type KeyboardNavigationState, createChartKeyboardHandler, findNearestPoint, findNearestProjectedPoint, findNearestProjectedX, getNearestIndexByX, getPointerPosition };
