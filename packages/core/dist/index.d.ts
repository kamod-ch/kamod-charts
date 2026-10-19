export { ChartDescriptionInput, DataTable, DataTableColumn, DataTableProps, buildChartDescription } from './accessibility/index.js';
export { TransitionOptions, barKey, defaultChartAnimate, domainKey, interpolateValue, pointKey, prefersReducedMotion, resolveChartAnimate, shouldAnimate, sliceKey, uniquifyKeys, useReducedMotion } from './animation/index.js';
export { C as ChartAnimate, a as ChartAnimateOptions, b as ChartMotionEasing, c as ChartMotionPreset, d as ChartReducedMotionPolicy, R as ResolvedChartAnimate } from './types-vhy5Wa3f.js';
export { AxisScaleOptions, TickFormatOptions, TickFormatter, TickValue, XAxis, XAxisProps, YAxis, YAxisProps, formatTick, inferNumericTickFormatSpecifier, useAxisScale } from './axes/index.js';
export { A as AxisScale, a as AxisTick, b as AxisTickValue, g as getScalePosition, c as getTicks } from './ticks-CmQrA2Ry.js';
export { AreaChart } from './charts/area-chart.js';
export { BarChart } from './charts/bar-chart.js';
export { LineChart } from './charts/line-chart.js';
export { PieChart } from './charts/pie-chart.js';
export { DonutChart } from './charts/donut-chart.js';
export { ScatterChart } from './charts/scatter-chart.js';
import { D as DataAccessor, C as ChartCartesianScaleKind } from './types-B2kenooF.js';
export { a as ChartAccessibilityOptions, b as ChartContextValue, c as ChartDimensionsInput, d as ChartInteraction, e as ChartMargin, f as ChartNullableValue, g as ChartOrientation, h as ChartPrimitiveValue, i as ChartRect, j as ChartRootProps, k as ChartSeries, l as ChartSize, m as DomainDataAccessor, N as NumericDataAccessor } from './types-B2kenooF.js';
import { C as CartesianActiveSelection, f as ChartFormatOptions } from './types-D9_pj9ff.js';
export { A as AreaChartProps, g as AreaFill, h as AreaGradientDirection, i as AreaGradientFill, B as BarChartProps, j as BarDatumContext, k as BarFill, l as BarSeriesConfig, m as BarValueLabelContext, n as BarValueLabelOptions, o as CartesianReferenceArea, p as CartesianReferenceLine, q as CartesianReferencePoint, r as CartesianReferenceSegment, s as CartesianReferenceSegmentPoint, t as CartesianSeriesConfig, u as CartesianTooltipContext, v as CartesianTooltipMode, w as CartesianTooltipOptions, x as CartesianTooltipSeriesValue, y as CircularVariant, z as DEFAULT_INNER_RADIUS_RATIO, E as DEFAULT_PIE_ACTIVE_OFFSET, b as DonutCenterContent, c as DonutCenterContext, D as DonutChartProps, d as DonutFormatTotal, a as DonutVariant, F as FULL_PIE_END_ANGLE, G as FULL_PIE_START_ANGLE, H as HALF_PIE_CENTER_Y_RATIO, I as HALF_PIE_END_ANGLE, J as HALF_PIE_START_ANGLE, L as LineChartProps, K as LineCurve, M as LineSeriesConfig, N as MAX_INNER_RADIUS_RATIO, e as PieChartProps, O as PieDatum, Q as PieLabelCollision, R as PieLabelLineOptions, T as PieLabelOptions, P as PieLabels, U as PieLayoutLabelOptions, V as PieLayoutPlotArea, W as PieLegendOptions, X as PieRose, Y as PieRoseOptions, Z as PieSliceContext, _ as PieSortComparator, $ as PieTooltipOptions, a0 as ResolvePieLayoutOptions, a1 as ResolvedPieLayout, a2 as ScatterCategoryConfig, a3 as ScatterCategoryValue, S as ScatterChartProps, a4 as ScatterPointContext, a5 as ScatterSeriesConfig, a6 as ScatterSizeScale, a7 as computeOutsideLabelGeometry, a8 as computeOutsideLabelGutter, a9 as computeRoseOuterRadius, aa as layoutPieLabels, ab as normalizePieData, ac as normalizePieValue, ad as normalizeRoseScale, ae as resolveNextActiveIndexAfterHide, af as resolvePieLabelOptions, ag as resolvePieLayout, ah as resolvePieOuterRadius, ai as resolvePieRoseOptions, aj as resolveRoseMinRadius } from './types-D9_pj9ff.js';
export { Chart, ChartProvider, ChartRoot, ChartSurface, ChartSurfaceProps, NormalizedAccessor, PlotArea, PlotAreaProps, ResponsiveContainer, ResponsiveContainerProps, ResponsiveContainerRenderState, calculatePlotArea, clampDimension, defaultChartMargin, defaultEmptyState, normalizeAccessor, normalizeMargin, readAccessor, resolveChartSize, useChartContext } from './core/index.js';
export { CartesianHitResult, ChartPointerPosition, KeyboardNavigationOptions, KeyboardNavigationState, createChartKeyboardHandler, findNearestPoint, findNearestProjectedPoint, findNearestProjectedX, getNearestIndexByX, getPointerPosition } from './interaction/index.js';
export { DownsampleOptions, MinMaxDownsampleOptions, MinMaxDownsamplePoint, bisectDate, downsampleByStride, downsampleMinMax, getLargeDatasetWarning, shouldReduceMarkers } from './performance/index.js';
export { Crosshair, CrosshairProps, Grid, GridProps, Legend, LegendItem, LegendProps, LiveRegion, LiveRegionProps, ReferenceArea, ReferenceAreaProps, ReferenceLine, ReferenceLineProps, ReferencePoint, ReferencePointLabelPosition, ReferencePointProps, ReferencePointShape, ReferenceSegment, ReferenceSegmentEndpoint, ReferenceSegmentLabelPosition, ReferenceSegmentProps, Tooltip, TooltipProps } from './primitives/index.js';
export { R as ResolvedTooltipPlacement, T as TooltipPlacement, a as TooltipPlacementInput, b as TooltipPlacementResult, c as calculateTooltipPlacement, d as clampTooltipPosition, v as viewBoxToContainerPixels } from './tooltip-placement-DZrqa8Zt.js';
export { BandChartScale, BandScaleOptions, LinearChartScale, LinearScaleOptions, PointChartScale, PointScaleOptions, TimeChartScale, TimeScaleOptions, createBandScale, createLinearScale, createPointScale, createTimeScale } from './scales/index.js';
export { C as CategoricalDomain, a as ContinuousDomain, b as ContinuousDomainOptions, c as ContinuousDomainValue, D as DomainPadding, N as NumericDomain, S as ScaleKind, T as TimeDomain, e as ensureNumericDomain, i as includeZero, d as inferCategoricalDomain, f as inferNumericDomain, g as inferTimeDomain, t as toNumber } from './domain-BoYS13aJ.js';
export { C as CartesianPoint, a as CartesianScaleOptions, i as inferCombinedNumericDomain } from './cartesian-EHWXKB2M.js';
export { A as AreaSeries, a as AreaSeriesProps, B as BarSeries, b as BarSeriesProps, L as LineSeries, c as LineSeriesProps, P as PieSeries, d as PieSeriesProps, S as ScatterSeries, e as ScatterSeriesProps, f as StackSeries, g as StackedAreaSeries, h as StackedAreaSeriesProps, i as StackedLineSeries, j as StackedLineSeriesEntry, k as StackedLineSeriesProps, l as StackedValue, m as getStackedValues, n as inferGroupedDomain, o as inferStackedDomain } from './stacked-line-series-Aa4m5Ka2.js';
export { getStackedSeriesValueAt, stackedLayerToCartesianPoints } from './series/index.js';
import * as preact from 'preact';
import { ComponentChildren } from 'preact';
import 'd3-scale';
import 'd3-shape';

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

type ChartFormatContextValue = ChartFormatOptions;
declare const ChartFormatProvider: ({ value, children, }: {
    value: ChartFormatContextValue;
    children: ComponentChildren;
}) => preact.JSX.Element;
declare const useChartFormat: (override?: ChartFormatOptions) => ChartFormatContextValue;
declare const createChartNumberFormatter: (format?: ChartFormatOptions) => Intl.NumberFormat;
declare const createChartDateFormatter: (format?: ChartFormatOptions) => Intl.DateTimeFormat;

export { CartesianActiveSelection, ChartCartesianScaleKind, ChartFormatOptions, ChartFormatProvider, DataAccessor, createChartDateFormatter, createChartNumberFormatter, findNearestDatumIndexByX, useChartFormat, useSynchronizedCartesianSelection };
