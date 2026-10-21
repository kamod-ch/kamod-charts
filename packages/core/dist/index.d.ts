export { ChartDescriptionInput, DataTable, DataTableColumn, DataTableProps, buildChartDescription } from './accessibility/index.js';
export { TransitionOptions, barKey, defaultChartAnimate, domainKey, interpolateValue, pointKey, prefersReducedMotion, resolveChartAnimate, shouldAnimate, sliceKey, uniquifyKeys, useReducedMotion } from './animation/index.js';
export { C as ChartAnimate, a as ChartAnimateOptions, b as ChartMotionEasing, c as ChartMotionPreset, d as ChartReducedMotionPolicy, R as ResolvedChartAnimate } from './types-vhy5Wa3f.js';
export { AxisScaleOptions, TickFormatOptions, TickFormatter, TickValue, XAxis, XAxisProps, YAxis, YAxisProps, formatTick, inferNumericTickFormatSpecifier, useAxisScale } from './axes/index.js';
export { A as AxisScale, a as AxisTick, b as AxisTickValue, g as getScalePosition, c as getTicks } from './ticks-BOjDQK87.js';
export { P as PreparedAxisTick, T as TickCollisionOptions, a as TickCollisionStrategy, e as estimateTickLabelWidth, p as prepareAxisTicks, t as truncateTickLabel } from './tick-collision-BnKxhH61.js';
export { AreaChart } from './charts/area-chart.js';
export { BarChart } from './charts/bar-chart.js';
export { LineChart } from './charts/line-chart.js';
import * as preact from 'preact';
import { JSX, ComponentChildren } from 'preact';
import { L as LineChartProps, C as CartesianXBrushOptions, f as LineCurve, g as CartesianActiveSelection, X as XViewportChangeReason, h as ChartFormatOptions } from './types-CTHw58sL.js';
export { A as AreaChartProps, i as AreaFill, j as AreaGradientDirection, k as AreaGradientFill, B as BarChartProps, l as BarDatumContext, m as BarFill, n as BarRenderContext, o as BarSeriesConfig, p as BarValueLabelContext, q as BarValueLabelOptions, r as CartesianReferenceArea, s as CartesianReferenceLine, t as CartesianReferencePoint, u as CartesianReferenceSegment, v as CartesianReferenceSegmentPoint, w as CartesianSeriesConfig, x as CartesianTooltipContext, y as CartesianTooltipMode, z as CartesianTooltipOptions, E as CartesianTooltipSeriesValue, F as CircularVariant, G as DEFAULT_INNER_RADIUS_RATIO, H as DEFAULT_PIE_ACTIVE_OFFSET, b as DonutCenterContent, c as DonutCenterContext, D as DonutChartProps, d as DonutFormatTotal, a as DonutVariant, I as FULL_PIE_END_ANGLE, J as FULL_PIE_START_ANGLE, K as HALF_PIE_CENTER_Y_RATIO, M as HALF_PIE_END_ANGLE, N as HALF_PIE_START_ANGLE, O as LineSeriesConfig, Q as MAX_INNER_RADIUS_RATIO, e as PieChartProps, R as PieDatum, T as PieLabelCollision, U as PieLabelLineOptions, V as PieLabelOptions, P as PieLabels, W as PieLayoutLabelOptions, Y as PieLayoutPlotArea, Z as PieLegendOptions, _ as PieRose, $ as PieRoseOptions, a0 as PieSliceContext, a1 as PieSortComparator, a2 as PieTooltipOptions, a3 as PointRenderContext, a4 as RenderBar, a5 as RenderPoint, a6 as ResolvePieLayoutOptions, a7 as ResolvedPieLayout, a8 as ScatterCategoryConfig, a9 as ScatterCategoryValue, S as ScatterChartProps, aa as ScatterPointContext, ab as ScatterSeriesConfig, ac as ScatterSizeScale, ad as computeOutsideLabelGeometry, ae as computeOutsideLabelGutter, af as computeRoseOuterRadius, ag as layoutPieLabels, ah as normalizePieData, ai as normalizePieValue, aj as normalizeRoseScale, ak as resolveNextActiveIndexAfterHide, al as resolvePieLabelOptions, am as resolvePieLayout, an as resolvePieOuterRadius, ao as resolvePieRoseOptions, ap as resolveRoseMinRadius } from './types-CTHw58sL.js';
import { D as DataAccessor, C as ChartCartesianScaleKind } from './types-B5951TWW.js';
export { a as ChartAccessibilityOptions, b as ChartClippingOptions, c as ChartContextValue, d as ChartDefsSlotOptions, e as ChartDimensionsInput, f as ChartInteraction, g as ChartMargin, h as ChartNullableValue, i as ChartOrientation, j as ChartPlotLayers, k as ChartPrimitiveValue, l as ChartRect, m as ChartRootProps, n as ChartSeries, o as ChartSize, p as ChartSurfaceSvgOptions, q as ChartSvgProps, r as DomainDataAccessor, N as NumericDataAccessor } from './types-B5951TWW.js';
import { C as ChartXViewportDomain } from './x-viewport-DnjNKMMu.js';
export { a as CartesianYAutoscale, R as ResolvedTooltipPlacement, T as TooltipPlacement, b as TooltipPlacementInput, c as TooltipPlacementResult, d as calculateTooltipPlacement, e as clampTooltipPosition, f as clampXViewportDomain, g as createTrailingTimeWindowDomain, i as inferContinuousXDomainFromData, h as intersectContinuousXDomains, j as isContinuousCartesianXScale, n as normalizeChartXDomain, p as panXViewportDomain, r as resolveControlledChartXDomain, k as resolveSynchronizedXExtents, u as unionContinuousXDomains, v as viewBoxToContainerPixels, z as zoomXViewportDomain } from './x-viewport-DnjNKMMu.js';
export { PieChart } from './charts/pie-chart.js';
export { DonutChart } from './charts/donut-chart.js';
export { ScatterChart } from './charts/scatter-chart.js';
export { Chart, ChartProvider, ChartRoot, ChartSurface, ChartSurfaceProps, NormalizedAccessor, PlotArea, PlotAreaProps, ResponsiveContainer, ResponsiveContainerProps, ResponsiveContainerRenderState, calculatePlotArea, clampDimension, createPlotClipPathId, defaultChartMargin, defaultEmptyState, normalizeAccessor, normalizeMargin, readAccessor, resolveChartSize, useChartContext } from './core/index.js';
export { CartesianHitResult, ChartPointerClientEvent, ChartPointerPosition, KeyboardNavigationOptions, KeyboardNavigationState, createChartKeyboardHandler, findNearestPoint, findNearestProjectedPoint, findNearestProjectedX, getNearestIndexByX, getPointerPosition } from './interaction/index.js';
export { DownsampleOptions, MinMaxDownsampleOptions, MinMaxDownsamplePoint, SegmentedMinMaxDownsampleOptions, SegmentedMinMaxDownsampleResult, SegmentedMinMaxDownsampleSegment, bisectDate, downsampleByStride, downsampleMinMax, downsampleMinMaxSegmented, getLargeDatasetWarning, shouldReduceMarkers } from './performance/index.js';
export { CartesianXBrush, CartesianXBrushChangeReason, CartesianXBrushProps, Crosshair, CrosshairProps, Grid, GridProps, Legend, LegendItem, LegendProps, LiveRegion, LiveRegionProps, ReferenceArea, ReferenceAreaProps, ReferenceLine, ReferenceLineProps, ReferencePoint, ReferencePointLabelPosition, ReferencePointProps, ReferencePointShape, ReferenceSegment, ReferenceSegmentEndpoint, ReferenceSegmentLabelPosition, ReferenceSegmentProps, Tooltip, TooltipProps } from './primitives/index.js';
export { BandChartScale, BandScaleOptions, LinearChartScale, LinearScaleOptions, PointChartScale, PointScaleOptions, TimeChartScale, TimeScaleOptions, createBandScale, createLinearScale, createPointScale, createTimeScale } from './scales/index.js';
export { C as CategoricalDomain, a as ContinuousDomain, b as ContinuousDomainOptions, c as ContinuousDomainValue, D as DomainPadding, N as NumericDomain, S as ScaleKind, T as TimeDomain, e as ensureNumericDomain, i as includeZero, d as inferCategoricalDomain, f as inferNumericDomain, g as inferTimeDomain, t as toNumber } from './domain-BWwIEiBj.js';
export { C as CartesianPoint, a as CartesianScaleOptions, i as inferCombinedNumericDomain } from './cartesian-C4wSVjYy.js';
export { A as AreaSeries, a as AreaSeriesProps, B as BarSeries, b as BarSeriesProps, L as LineSeries, c as LineSeriesProps, P as PieSeries, d as PieSeriesProps, S as ScatterSeries, e as ScatterSeriesProps, f as StackSeries, g as StackedAreaSeries, h as StackedAreaSeriesProps, i as StackedLineSeries, j as StackedLineSeriesEntry, k as StackedLineSeriesProps, l as StackedValue, m as getStackedValues, n as inferGroupedDomain, o as inferStackedDomain } from './stacked-line-series-Dqj0sPVa.js';
export { getStackedSeriesValueAt, stackedLayerToCartesianPoints } from './series/index.js';
import 'd3-scale';
import 'd3-shape';

type LineChartWithXBrushProps<TDatum> = LineChartProps<TDatum> & {
    xBrush: boolean | CartesianXBrushOptions;
};
declare const LineChartWithXBrush: <TDatum>({ xBrush, xDomain: xDomainProp, onXViewportChange, data, xKey, xScale, series, width, initialWidth, responsive, ...rest }: LineChartWithXBrushProps<TDatum>) => preact.JSX.Element;

interface SparklineProps<TDatum> {
    data: readonly TDatum[];
    valueKey: DataAccessor<TDatum, number | null | undefined>;
    xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
    xScale?: ChartCartesianScaleKind;
    xDomain?: ChartXViewportDomain;
    width?: number;
    height?: number;
    /** Accessible name for the sparkline chart surface. */
    label: string;
    /** Short trend description (e.g. “Up 3% in the last hour”). */
    trendSummary?: string;
    connectNulls?: boolean;
    curve?: LineCurve;
    color?: string;
    class?: string;
}
/** Compact line preset — same LineChart layout/scales, minimal chrome. */
declare const Sparkline: <TDatum>({ data, valueKey, xKey, xScale, xDomain, width, height, label, trendSummary, connectNulls, curve, color, class: className, }: SparklineProps<TDatum>) => JSX.Element;

/** Nearest row index by X value (time/numeric). Returns null when no row within maxDeltaMs. */
declare const findNearestDatumIndexByX: <TDatum>(data: readonly TDatum[], xKey: DataAccessor<TDatum, string | number | Date | null | undefined>, targetX: string | number | Date | null | undefined, options?: {
    maxDeltaMs?: number;
    xScale?: ChartCartesianScaleKind;
}) => number | null;

type UseSynchronizedCartesianSelectionOptions = {
    initialXValue?: string | number | Date | null;
    maxDeltaMs?: number;
};
/**
 * Shared X selection for multiple cartesian charts (nearest timestamp by default).
 */
declare const useSynchronizedCartesianSelection: ({ initialXValue, maxDeltaMs, }?: UseSynchronizedCartesianSelectionOptions) => {
    xValue: string | number | Date | null;
    setXValue: (next: string | number | Date | null) => void;
    createChartHandlers: <TDatum>({ data, xKey, xScale, onActiveChange, }: {
        data: readonly TDatum[];
        xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
        xScale?: ChartCartesianScaleKind;
        onActiveChange?: (selection: CartesianActiveSelection) => void;
    }) => {
        activeIndex: number | null;
        onActiveChange: (selection: CartesianActiveSelection) => void;
    };
};

type UseSynchronizedCartesianXDomainOptions = {
    initialXDomain?: ChartXViewportDomain;
};
/**
 * Shared X viewport (timestamps / numeric domain) for multiple cartesian charts.
 * Emits only on user-driven `onXViewportChange`; `setXDomain` from the parent does not echo.
 */
declare const useSynchronizedCartesianXDomain: ({ initialXDomain, }?: UseSynchronizedCartesianXDomainOptions) => {
    xDomain: ChartXViewportDomain | undefined;
    setXDomain: (next: ChartXViewportDomain | undefined) => void;
    createChartViewportHandlers: <TDatum>({ data, xKey, xScale, onXViewportChange, peerExtents, }: {
        data: readonly TDatum[];
        xKey?: DataAccessor<TDatum, string | number | Date | null | undefined>;
        xScale?: ChartCartesianScaleKind;
        onXViewportChange?: (domain: ChartXViewportDomain, reason: XViewportChangeReason) => void;
        /** Additional chart extents included when clamping user gestures (unequal sampling / widths). */
        peerExtents?: readonly (ChartXViewportDomain | null)[];
    }) => {
        xDomain: ChartXViewportDomain | undefined;
        onXViewportChange: (domain: ChartXViewportDomain, reason: XViewportChangeReason) => void;
        chartExtents: ChartXViewportDomain | null;
        syncExtents: ChartXViewportDomain | null;
    };
    resolveSharedExtents: (chartExtentsList: readonly (ChartXViewportDomain | null)[], xScale?: ChartCartesianScaleKind) => ChartXViewportDomain | null;
};

type TimeSeriesDuplicatePolicy = "reject" | "replace" | "allow";
/** How late-arriving points are handled (never silently re-sorts the whole buffer). */
type TimeSeriesOutOfOrderPolicy = "reject" | "drop" | "reorder-window";
interface TimeSeriesBufferOptions<T> {
    capacity: number;
    readTime: (item: T) => number;
    /** Drop points older than `newest - retentionMs` after each append. */
    retentionMs?: number;
    duplicatePolicy?: TimeSeriesDuplicatePolicy;
    outOfOrderPolicy?: TimeSeriesOutOfOrderPolicy;
    /** Only used with `reorder-window`; late points older than this span are dropped. */
    reorderWindowMs?: number;
}
interface TimeSeriesAppendStats {
    accepted: number;
    rejected: number;
    dropped: number;
    replaced: number;
}
interface TimeSeriesTrailingView<T> {
    items: readonly T[];
    domain: readonly [Date, Date];
    /** True when older samples exist before the window start (trimmed or outside window). */
    clippedStart: boolean;
}
declare class TimeSeriesBuffer<T> {
    private readonly options;
    private items;
    private times;
    constructor(options: TimeSeriesBufferOptions<T>);
    get size(): number;
    get newestTime(): number | null;
    get oldestTime(): number | null;
    /** Returns the internal ordered snapshot (new array reference). */
    toArray(): readonly T[];
    clear(): void;
    append(batch: readonly T[]): TimeSeriesAppendStats;
    appendOne(item: T): keyof TimeSeriesAppendStats;
    viewTrailing(windowMs: number, endMs?: number): TimeSeriesTrailingView<T>;
    private findDuplicateIndex;
    private insertAt;
    private trim;
}

type TimeSeriesBufferMode = "live" | "paused";
interface UseTimeSeriesBufferOptions<T> extends TimeSeriesBufferOptions<T> {
    /** Trailing window for live follow (default 5 minutes). */
    windowMs?: number;
    /** Max visual refresh rate while live (default 30 fps). */
    maxUpdateFps?: number;
    now?: () => number;
}
interface TimeSeriesBufferView<T> {
    data: readonly T[];
    xDomain: ChartXViewportDomain;
    clippedStart: boolean;
}
interface UseTimeSeriesBufferResult<T> {
    view: TimeSeriesBufferView<T>;
    mode: TimeSeriesBufferMode;
    pause: () => void;
    resumeLive: () => void;
    append: (batch: readonly T[]) => TimeSeriesAppendStats;
    clear: () => void;
    /** True when the frozen pause anchor is older than retained history. */
    historyTruncated: boolean;
}
declare const useTimeSeriesBuffer: <T>({ windowMs, maxUpdateFps, now, ...bufferOptions }: UseTimeSeriesBufferOptions<T>) => UseTimeSeriesBufferResult<T>;

type ChartFormatContextValue = ChartFormatOptions;
declare const ChartFormatProvider: ({ value, children, }: {
    value: ChartFormatContextValue;
    children: ComponentChildren;
}) => preact.JSX.Element;
declare const useChartFormat: (override?: ChartFormatOptions) => ChartFormatContextValue;
declare const createChartNumberFormatter: (format?: ChartFormatOptions) => Intl.NumberFormat;
declare const createChartDateFormatter: (format?: ChartFormatOptions) => Intl.DateTimeFormat;

type HistogramBin = {
    index: number;
    /** Left edge (inclusive). */
    left: number;
    /** Right edge: exclusive for interior bins; inclusive for the last bin. */
    right: number;
    count: number;
};
type HistogramBinsResult = {
    bins: HistogramBin[];
    /** Valid numeric samples assigned to exactly one bin. */
    assignedCount: number;
    /** Ignored `null`, `undefined`, and non-finite numbers. */
    skippedCount: number;
    edges: readonly number[];
};
type ComputeHistogramBinsOptions = {
    /**
     * Number of equal-width bins when `edges` is omitted.
     * Ignored when `edges` is provided.
     */
    binCount?: number;
    /** Monotonic bin edges (`length = binCount + 1`). Overrides `binCount`. */
    edges?: readonly number[];
};
/**
 * Count-based histogram binning.
 * Interval rule: `[left, right)` for all bins except the last, which is `[left, right]` (right inclusive).
 */
declare const computeHistogramBins: (values: readonly (number | null | undefined)[], options?: ComputeHistogramBinsOptions) => HistogramBinsResult;
declare const formatHistogramBinInterval: (bin: HistogramBin, isLast: boolean) => string;
declare const histogramBinsToBarData: (result: HistogramBinsResult) => Array<{
    bin: string;
    count: number;
    left: number;
    right: number;
}>;

export { CartesianActiveSelection, CartesianXBrushOptions, ChartCartesianScaleKind, ChartFormatOptions, ChartFormatProvider, ChartXViewportDomain, DataAccessor, LineChartProps, LineChartWithXBrush, LineCurve, Sparkline, TimeSeriesBuffer, XViewportChangeReason, computeHistogramBins, createChartDateFormatter, createChartNumberFormatter, findNearestDatumIndexByX, formatHistogramBinInterval, histogramBinsToBarData, useChartFormat, useSynchronizedCartesianSelection, useSynchronizedCartesianXDomain, useTimeSeriesBuffer };
export type { ComputeHistogramBinsOptions, HistogramBin, HistogramBinsResult, SparklineProps, TimeSeriesAppendStats, TimeSeriesBufferMode, TimeSeriesBufferOptions, TimeSeriesBufferView, TimeSeriesDuplicatePolicy, TimeSeriesOutOfOrderPolicy, TimeSeriesTrailingView, UseTimeSeriesBufferOptions, UseTimeSeriesBufferResult };
