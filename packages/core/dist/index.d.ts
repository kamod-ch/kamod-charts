export { ChartDescriptionInput, DataTable, DataTableColumn, DataTableProps, buildChartDescription } from './accessibility/index.js';
export { TransitionOptions, barKey, defaultChartAnimate, domainKey, interpolateValue, pointKey, prefersReducedMotion, resolveChartAnimate, shouldAnimate, sliceKey, uniquifyKeys, useReducedMotion } from './animation/index.js';
export { C as ChartAnimate, a as ChartAnimateOptions, b as ChartMotionEasing, c as ChartMotionPreset, d as ChartReducedMotionPolicy, R as ResolvedChartAnimate } from './types-vhy5Wa3f.js';
export { AxisScaleOptions, TickFormatOptions, TickFormatter, TickValue, XAxis, XAxisProps, YAxis, YAxisProps, formatTick, inferNumericTickFormatSpecifier, useAxisScale } from './axes/index.js';
export { A as AxisScale, a as AxisTick, b as AxisTickValue, g as getScalePosition, c as getTicks } from './ticks-CmQrA2Ry.js';
export { P as PreparedAxisTick, T as TickCollisionOptions, a as TickCollisionStrategy, e as estimateTickLabelWidth, p as prepareAxisTicks, t as truncateTickLabel } from './tick-collision-BZO-dBiF.js';
export { AreaChart } from './charts/area-chart.js';
export { BarChart } from './charts/bar-chart.js';
export { LineChart } from './charts/line-chart.js';
export { PieChart } from './charts/pie-chart.js';
export { DonutChart } from './charts/donut-chart.js';
export { ScatterChart } from './charts/scatter-chart.js';
import { D as DataAccessor, C as ChartCartesianScaleKind } from './types-DSaae0gq.js';
export { a as ChartAccessibilityOptions, b as ChartClippingOptions, c as ChartContextValue, d as ChartDefsSlotOptions, e as ChartDimensionsInput, f as ChartInteraction, g as ChartMargin, h as ChartNullableValue, i as ChartOrientation, j as ChartPlotLayers, k as ChartPrimitiveValue, l as ChartRect, m as ChartRootProps, n as ChartSeries, o as ChartSize, p as ChartSurfaceSvgOptions, q as ChartSvgProps, r as DomainDataAccessor, N as NumericDataAccessor } from './types-DSaae0gq.js';
import { C as CartesianActiveSelection, f as ChartFormatOptions } from './types-CzW3cgSZ.js';
export { A as AreaChartProps, g as AreaFill, h as AreaGradientDirection, i as AreaGradientFill, B as BarChartProps, j as BarDatumContext, k as BarFill, l as BarRenderContext, m as BarSeriesConfig, n as BarValueLabelContext, o as BarValueLabelOptions, p as CartesianReferenceArea, q as CartesianReferenceLine, r as CartesianReferencePoint, s as CartesianReferenceSegment, t as CartesianReferenceSegmentPoint, u as CartesianSeriesConfig, v as CartesianTooltipContext, w as CartesianTooltipMode, x as CartesianTooltipOptions, y as CartesianTooltipSeriesValue, z as CircularVariant, E as DEFAULT_INNER_RADIUS_RATIO, F as DEFAULT_PIE_ACTIVE_OFFSET, b as DonutCenterContent, c as DonutCenterContext, D as DonutChartProps, d as DonutFormatTotal, a as DonutVariant, G as FULL_PIE_END_ANGLE, H as FULL_PIE_START_ANGLE, I as HALF_PIE_CENTER_Y_RATIO, J as HALF_PIE_END_ANGLE, K as HALF_PIE_START_ANGLE, L as LineChartProps, M as LineCurve, N as LineSeriesConfig, O as MAX_INNER_RADIUS_RATIO, e as PieChartProps, Q as PieDatum, R as PieLabelCollision, T as PieLabelLineOptions, U as PieLabelOptions, P as PieLabels, V as PieLayoutLabelOptions, W as PieLayoutPlotArea, X as PieLegendOptions, Y as PieRose, Z as PieRoseOptions, _ as PieSliceContext, $ as PieSortComparator, a0 as PieTooltipOptions, a1 as PointRenderContext, a2 as RenderBar, a3 as RenderPoint, a4 as ResolvePieLayoutOptions, a5 as ResolvedPieLayout, a6 as ScatterCategoryConfig, a7 as ScatterCategoryValue, S as ScatterChartProps, a8 as ScatterPointContext, a9 as ScatterSeriesConfig, aa as ScatterSizeScale, ab as computeOutsideLabelGeometry, ac as computeOutsideLabelGutter, ad as computeRoseOuterRadius, ae as layoutPieLabels, af as normalizePieData, ag as normalizePieValue, ah as normalizeRoseScale, ai as resolveNextActiveIndexAfterHide, aj as resolvePieLabelOptions, ak as resolvePieLayout, al as resolvePieOuterRadius, am as resolvePieRoseOptions, an as resolveRoseMinRadius } from './types-CzW3cgSZ.js';
export { Chart, ChartProvider, ChartRoot, ChartSurface, ChartSurfaceProps, NormalizedAccessor, PlotArea, PlotAreaProps, ResponsiveContainer, ResponsiveContainerProps, ResponsiveContainerRenderState, calculatePlotArea, clampDimension, createPlotClipPathId, defaultChartMargin, defaultEmptyState, normalizeAccessor, normalizeMargin, readAccessor, resolveChartSize, useChartContext } from './core/index.js';
export { CartesianHitResult, ChartPointerPosition, KeyboardNavigationOptions, KeyboardNavigationState, createChartKeyboardHandler, findNearestPoint, findNearestProjectedPoint, findNearestProjectedX, getNearestIndexByX, getPointerPosition } from './interaction/index.js';
export { DownsampleOptions, MinMaxDownsampleOptions, MinMaxDownsamplePoint, bisectDate, downsampleByStride, downsampleMinMax, getLargeDatasetWarning, shouldReduceMarkers } from './performance/index.js';
export { Crosshair, CrosshairProps, Grid, GridProps, Legend, LegendItem, LegendProps, LiveRegion, LiveRegionProps, ReferenceArea, ReferenceAreaProps, ReferenceLine, ReferenceLineProps, ReferencePoint, ReferencePointLabelPosition, ReferencePointProps, ReferencePointShape, ReferenceSegment, ReferenceSegmentEndpoint, ReferenceSegmentLabelPosition, ReferenceSegmentProps, Tooltip, TooltipProps } from './primitives/index.js';
export { R as ResolvedTooltipPlacement, T as TooltipPlacement, a as TooltipPlacementInput, b as TooltipPlacementResult, c as calculateTooltipPlacement, d as clampTooltipPosition, v as viewBoxToContainerPixels } from './tooltip-placement-DZrqa8Zt.js';
export { BandChartScale, BandScaleOptions, LinearChartScale, LinearScaleOptions, PointChartScale, PointScaleOptions, TimeChartScale, TimeScaleOptions, createBandScale, createLinearScale, createPointScale, createTimeScale } from './scales/index.js';
export { C as CategoricalDomain, a as ContinuousDomain, b as ContinuousDomainOptions, c as ContinuousDomainValue, D as DomainPadding, N as NumericDomain, S as ScaleKind, T as TimeDomain, e as ensureNumericDomain, i as includeZero, d as inferCategoricalDomain, f as inferNumericDomain, g as inferTimeDomain, t as toNumber } from './domain-DBVhrZ1K.js';
export { C as CartesianPoint, a as CartesianScaleOptions, i as inferCombinedNumericDomain } from './cartesian-Ct2oQUzO.js';
export { A as AreaSeries, a as AreaSeriesProps, B as BarSeries, b as BarSeriesProps, L as LineSeries, c as LineSeriesProps, P as PieSeries, d as PieSeriesProps, S as ScatterSeries, e as ScatterSeriesProps, f as StackSeries, g as StackedAreaSeries, h as StackedAreaSeriesProps, i as StackedLineSeries, j as StackedLineSeriesEntry, k as StackedLineSeriesProps, l as StackedValue, m as getStackedValues, n as inferGroupedDomain, o as inferStackedDomain } from './stacked-line-series-DQmbaAWy.js';
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
