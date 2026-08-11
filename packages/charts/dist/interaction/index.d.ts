import { C as CartesianPoint } from '../cartesian-D9x2nTtt.js';
import { JSX } from 'preact';
import { i as ChartRect } from '../types-CzGslxWS.js';
import '../domain-COQUkiLk.js';

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
declare const getNearestIndexByX: (plotX: number, plotWidth: number, pointCount: number) => number;

export { type ChartPointerPosition, type KeyboardNavigationOptions, type KeyboardNavigationState, createChartKeyboardHandler, findNearestPoint, getNearestIndexByX, getPointerPosition };
