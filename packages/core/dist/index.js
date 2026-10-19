export { DonutChart } from './chunk-HAWBBIYK.js';
export { ScatterChart } from './chunk-CFJI2FCN.js';
export { bisectDate, downsampleByStride, downsampleMinMax, getLargeDatasetWarning, shouldReduceMarkers } from './chunk-ORCD56E4.js';
export { DataTable, buildChartDescription } from './chunk-T74M5R3A.js';
export { defaultChartAnimate, interpolateValue, prefersReducedMotion, resolveChartAnimate, shouldAnimate, useReducedMotion } from './chunk-TWTY7ZW5.js';
export { AreaChart } from './chunk-VW6TREFR.js';
export { BarChart } from './chunk-HWZO2WEE.js';
export { LineChart } from './chunk-MRY6DAE2.js';
import './chunk-3JJJCWLV.js';
import './chunk-EDWP6PZ2.js';
export { ChartFormatProvider, createChartDateFormatter, createChartNumberFormatter, useChartFormat } from './chunk-NRCKSTGT.js';
export { createChartKeyboardHandler, findNearestPoint, findNearestProjectedPoint, findNearestProjectedX, getNearestIndexByX, getPointerPosition } from './chunk-ZVNGN5ZG.js';
export { PieChart } from './chunk-3SJV5D3T.js';
import './chunk-ROV4S6AH.js';
import './chunk-3PNPI7XX.js';
export { Crosshair, Grid, Legend, LiveRegion, ReferenceArea, ReferenceLine, ReferencePoint, ReferenceSegment, Tooltip, calculateTooltipPlacement, clampTooltipPosition, viewBoxToContainerPixels } from './chunk-DBYG6MPO.js';
export { AreaSeries, BarSeries, DEFAULT_INNER_RADIUS_RATIO, DEFAULT_PIE_ACTIVE_OFFSET, FULL_PIE_END_ANGLE, FULL_PIE_START_ANGLE, HALF_PIE_CENTER_Y_RATIO, HALF_PIE_END_ANGLE, HALF_PIE_START_ANGLE, LineSeries, MAX_INNER_RADIUS_RATIO, PieSeries, ScatterSeries, StackedAreaSeries, StackedLineSeries, computeOutsideLabelGeometry, computeOutsideLabelGutter, computeRoseOuterRadius, getStackedSeriesValueAt, getStackedValues, inferCombinedNumericDomain, inferGroupedDomain, inferStackedDomain, layoutPieLabels, normalizePieData, normalizePieValue, normalizeRoseScale, resolveNextActiveIndexAfterHide, resolvePieLabelOptions, resolvePieLayout, resolvePieOuterRadius, resolvePieRoseOptions, resolveRoseMinRadius, stackedLayerToCartesianPoints } from './chunk-PINJXSFZ.js';
export { barKey, domainKey, pointKey, sliceKey, uniquifyKeys } from './chunk-YLMQXC4X.js';
export { XAxis, YAxis, formatTick, getScalePosition, getTicks, inferNumericTickFormatSpecifier, useAxisScale } from './chunk-CVDHIQU7.js';
export { createBandScale, createLinearScale, createPointScale, createTimeScale, ensureNumericDomain, includeZero, inferCategoricalDomain, inferNumericDomain, inferTimeDomain, toNumber } from './chunk-Q6JNEXFB.js';
import { normalizeAccessor } from './chunk-JDH6VYL7.js';
export { Chart, ChartProvider, ChartRoot, ChartSurface, PlotArea, ResponsiveContainer, calculatePlotArea, clampDimension, defaultChartMargin, defaultEmptyState, normalizeAccessor, normalizeMargin, readAccessor, resolveChartSize, useChartContext } from './chunk-JDH6VYL7.js';
import { useState, useRef, useCallback } from 'preact/hooks';

// src/charts/cartesian-sync.ts
var toTimestamp = (value) => {
  if (value == null) {
    return null;
  }
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isNaN(time) ? null : time;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};
var findNearestDatumIndexByX = (data, xKey, targetX, options) => {
  if (targetX == null || data.length === 0) {
    return null;
  }
  const targetTime = toTimestamp(targetX);
  const readX = normalizeAccessor(xKey);
  let bestIndex = null;
  let bestDistance = Infinity;
  for (const [index, datum] of data.entries()) {
    const xValue = readX(datum, index);
    const candidateTime = options?.xScale === "time" || targetTime != null ? toTimestamp(xValue) : null;
    const distance = candidateTime != null && targetTime != null ? Math.abs(candidateTime - targetTime) : xValue === targetX ? 0 : Infinity;
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  }
  if (bestIndex == null || !Number.isFinite(bestDistance)) {
    return null;
  }
  if (options?.maxDeltaMs != null && targetTime != null && bestDistance > options.maxDeltaMs) {
    return null;
  }
  return bestIndex;
};
var useSynchronizedCartesianSelection = ({
  initialXValue = null,
  maxDeltaMs
} = {}) => {
  const [xValue, setXValue] = useState(initialXValue);
  const suppressEmitRef = useRef(false);
  const setXValueFromParent = useCallback((next) => {
    suppressEmitRef.current = true;
    setXValue(next);
    queueMicrotask(() => {
      suppressEmitRef.current = false;
    });
  }, []);
  const createChartHandlers = useCallback(
    ({
      data,
      xKey,
      xScale,
      onActiveChange
    }) => {
      const resolvedXKey = xKey ?? ((_datum, index) => index);
      const readX = normalizeAccessor(resolvedXKey);
      const activeIndex = findNearestDatumIndexByX(data, resolvedXKey, xValue, {
        maxDeltaMs,
        xScale
      });
      const handleActiveChange = (selection) => {
        if (!suppressEmitRef.current) {
          if (selection.activeIndex == null) {
            setXValue(null);
          } else {
            const datum = data[selection.activeIndex];
            if (datum != null) {
              setXValue(readX(datum, selection.activeIndex) ?? null);
            }
          }
        }
        onActiveChange?.(selection);
      };
      return { activeIndex, onActiveChange: handleActiveChange };
    },
    [maxDeltaMs, xValue]
  );
  return {
    xValue,
    setXValue: setXValueFromParent,
    createChartHandlers
  };
};

export { findNearestDatumIndexByX, useSynchronizedCartesianSelection };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map