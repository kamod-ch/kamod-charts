export { DonutChart } from './chunk-W3MGV2AP.js';
export { ScatterChart } from './chunk-H63KBFOG.js';
import { downsampleMinMaxSegmented } from './chunk-D72UBQ3Y.js';
export { bisectDate, downsampleByStride, downsampleMinMax, downsampleMinMaxSegmented, getLargeDatasetWarning, shouldReduceMarkers } from './chunk-D72UBQ3Y.js';
export { DataTable, buildChartDescription } from './chunk-4GVHXIZD.js';
export { defaultChartAnimate, interpolateValue, prefersReducedMotion, resolveChartAnimate, shouldAnimate, useReducedMotion } from './chunk-TWTY7ZW5.js';
export { AreaChart } from './chunk-GJE4T5PS.js';
export { BarChart } from './chunk-WBBP2GXD.js';
import { LineChart } from './chunk-RKIKTSNQ.js';
export { LineChart } from './chunk-RKIKTSNQ.js';
import './chunk-F4CKKYFJ.js';
export { ChartFormatProvider, createChartDateFormatter, createChartNumberFormatter, useChartFormat } from './chunk-YK4WUV2W.js';
export { PieChart } from './chunk-5B3P6SG7.js';
import './chunk-WBWMUNP7.js';
import './chunk-3PNPI7XX.js';
export { AreaSeries, BarSeries, DEFAULT_INNER_RADIUS_RATIO, DEFAULT_PIE_ACTIVE_OFFSET, FULL_PIE_END_ANGLE, FULL_PIE_START_ANGLE, HALF_PIE_CENTER_Y_RATIO, HALF_PIE_END_ANGLE, HALF_PIE_START_ANGLE, LineSeries, MAX_INNER_RADIUS_RATIO, PieSeries, ScatterSeries, StackedAreaSeries, StackedLineSeries, computeOutsideLabelGeometry, computeOutsideLabelGutter, computeRoseOuterRadius, layoutPieLabels, normalizePieData, normalizePieValue, normalizeRoseScale, resolveNextActiveIndexAfterHide, resolvePieLabelOptions, resolvePieLayout, resolvePieOuterRadius, resolvePieRoseOptions, resolveRoseMinRadius } from './chunk-GXLSXGCG.js';
import { inferContinuousXDomainFromData, createTrailingTimeWindowDomain, clampXViewportDomain, isContinuousCartesianXScale, CartesianXBrush, resolveSynchronizedXExtents, resolveControlledChartXDomain } from './chunk-ACJDGSTJ.js';
export { CartesianXBrush, Crosshair, Grid, Legend, LiveRegion, ReferenceArea, ReferenceLine, ReferencePoint, ReferenceSegment, Tooltip, calculateTooltipPlacement, clampTooltipPosition, clampXViewportDomain, createTrailingTimeWindowDomain, inferContinuousXDomainFromData, intersectContinuousXDomains, isContinuousCartesianXScale, normalizeChartXDomain, panXViewportDomain, resolveControlledChartXDomain, resolveSynchronizedXExtents, unionContinuousXDomains, viewBoxToContainerPixels, zoomXViewportDomain } from './chunk-ACJDGSTJ.js';
export { getStackedSeriesValueAt, getStackedValues, inferCombinedNumericDomain, inferGroupedDomain, inferStackedDomain, stackedLayerToCartesianPoints } from './chunk-FKM2GUSV.js';
export { createChartKeyboardHandler, findNearestPoint, findNearestProjectedPoint, findNearestProjectedX, getNearestIndexByX, getPointerPosition } from './chunk-R6OLQ7JF.js';
export { barKey, domainKey, pointKey, sliceKey, uniquifyKeys } from './chunk-YLMQXC4X.js';
export { XAxis, YAxis, estimateTickLabelWidth, formatTick, getScalePosition, getTicks, inferNumericTickFormatSpecifier, prepareAxisTicks, truncateTickLabel, useAxisScale } from './chunk-TRV7RS5D.js';
export { createBandScale, createLinearScale, createPointScale, createTimeScale, ensureNumericDomain, includeZero, inferCategoricalDomain, inferNumericDomain, inferTimeDomain, toNumber } from './chunk-R654GXB2.js';
import { normalizeAccessor } from './chunk-44DG7DOE.js';
export { Chart, ChartProvider, ChartRoot, ChartSurface, PlotArea, ResponsiveContainer, calculatePlotArea, clampDimension, createPlotClipPathId, defaultChartMargin, defaultEmptyState, normalizeAccessor, normalizeMargin, readAccessor, resolveChartSize, useChartContext } from './chunk-44DG7DOE.js';
import { useMemo, useState, useCallback, useRef, useEffect } from 'preact/hooks';
import { jsx, jsxs } from 'preact/jsx-runtime';

var resolveBrushOptions = (value) => value === true || value == null || value === false ? {} : value;
var defaultOverviewHeight = 72;
var defaultOverviewBudget = 320;
var buildOverviewData = (data, xKey, yKey, xScale, budget) => {
  if (data.length <= budget || yKey == null) {
    return data;
  }
  const readX = normalizeAccessor(xKey ?? ((_datum, index) => index));
  const readY = normalizeAccessor(yKey);
  const result = downsampleMinMaxSegmented(
    data,
    (datum, index) => {
      const value = readX(datum, index);
      if (value instanceof Date) {
        return value.getTime();
      }
      return typeof value === "number" ? value : index;
    },
    (datum, index) => {
      const value = readY(datum, index);
      return typeof value === "number" && Number.isFinite(value) ? value : null;
    },
    { budget }
  );
  const keep = new Set(result.points.map((point) => point.index));
  return data.filter((_, index) => keep.has(index));
};
var LineChartWithXBrush = ({
  xBrush,
  xDomain: xDomainProp,
  onXViewportChange,
  data,
  xKey,
  xScale,
  series,
  width,
  initialWidth,
  responsive,
  ...rest
}) => {
  const brush = resolveBrushOptions(xBrush);
  const overviewHeight = brush.overviewHeight ?? defaultOverviewHeight;
  const overviewBudget = brush.overviewPointBudget ?? defaultOverviewBudget;
  const extents = useMemo(
    () => inferContinuousXDomainFromData(data, xKey, xScale),
    [data, xKey, xScale]
  );
  const [internalDomain, setInternalDomain] = useState(void 0);
  const isControlled = xDomainProp != null;
  const primaryYKey = series[0]?.key;
  const defaultWindow = useMemo(() => {
    if (!extents) {
      return void 0;
    }
    if (xScale === "time" && extents[1] instanceof Date) {
      const span2 = extents[1].getTime() - extents[0].getTime();
      return createTrailingTimeWindowDomain(
        extents[1],
        Math.max(span2 * 0.35, 6e4),
        extents
      );
    }
    const span = extents[1] - extents[0];
    const end = extents[1];
    return clampXViewportDomain([end - span * 0.35, end], extents, xScale);
  }, [extents, xScale]);
  const windowDomain = useMemo(() => {
    if (!extents || !isContinuousCartesianXScale(xScale)) {
      return void 0;
    }
    const candidate = xDomainProp ?? internalDomain ?? defaultWindow;
    return candidate ? clampXViewportDomain(candidate, extents, xScale, brush.minSpan) : void 0;
  }, [brush.minSpan, defaultWindow, extents, internalDomain, xDomainProp, xScale]);
  const emitViewport = useCallback(
    (domain, reason) => {
      if (!extents) {
        return;
      }
      const clamped = clampXViewportDomain(domain, extents, xScale, brush.minSpan);
      if (!isControlled) {
        setInternalDomain(clamped);
      }
      onXViewportChange?.(clamped, reason);
    },
    [brush.minSpan, extents, isControlled, onXViewportChange, xScale]
  );
  const overviewData = useMemo(
    () => buildOverviewData(data, xKey, primaryYKey, xScale, overviewBudget),
    [data, overviewBudget, primaryYKey, xKey, xScale]
  );
  const brushOverlay = extents && windowDomain ? /* @__PURE__ */ jsx(
    CartesianXBrush,
    {
      selection: windowDomain,
      extents,
      xKey,
      xScale,
      minSpan: brush.minSpan,
      onSelectionChange: (domain, reason) => emitViewport(domain, reason === "keyboard" ? "keyboard" : "pan")
    }
  ) : null;
  if (!isContinuousCartesianXScale(xScale) || !extents || !windowDomain) {
    return /* @__PURE__ */ jsx(
      LineChart,
      {
        data,
        xKey,
        xScale,
        series,
        width,
        initialWidth,
        responsive,
        xDomain: xDomainProp,
        onXViewportChange,
        ...rest
      }
    );
  }
  return /* @__PURE__ */ jsxs("div", { "data-kamod-line-chart-with-x-brush": "", children: [
    /* @__PURE__ */ jsx(
      LineChart,
      {
        data,
        xKey,
        xScale,
        series,
        width,
        initialWidth,
        responsive,
        xDomain: windowDomain,
        onXViewportChange: emitViewport,
        ...rest
      }
    ),
    /* @__PURE__ */ jsx(
      LineChart,
      {
        data: overviewData,
        xKey,
        xScale,
        series,
        width,
        initialWidth,
        responsive,
        height: overviewHeight,
        showGrid: false,
        showLegend: false,
        tooltip: false,
        title: void 0,
        description: "Overview range selector",
        xViewportInteraction: false,
        plotForeground: brushOverlay,
        margin: rest.margin,
        format: rest.format
      }
    )
  ] });
};
var Sparkline = ({
  data,
  valueKey,
  xKey,
  xScale = "time",
  xDomain,
  width = 160,
  height = 36,
  label,
  trendSummary,
  connectNulls = true,
  curve = "linear",
  color = "var(--chart-1)",
  class: className
}) => {
  return /* @__PURE__ */ jsx("div", { class: className, "data-kamod-sparkline": "", children: /* @__PURE__ */ jsx(
    LineChart,
    {
      data,
      xKey,
      xScale,
      xDomain,
      width,
      height,
      margin: { top: 2, right: 2, bottom: 2, left: 2 },
      showGrid: false,
      showLegend: false,
      tooltip: false,
      connectNulls,
      curve,
      title: label,
      description: trendSummary,
      series: [{ key: valueKey, id: "spark", color, label }]
    }
  ) });
};

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
var useSynchronizedCartesianXDomain = ({
  initialXDomain = void 0
} = {}) => {
  const [xDomain, setXDomainState] = useState(initialXDomain);
  const suppressEmitRef = useRef(false);
  const setXDomain = useCallback((next) => {
    suppressEmitRef.current = true;
    setXDomainState(next);
    queueMicrotask(() => {
      suppressEmitRef.current = false;
    });
  }, []);
  const createChartViewportHandlers = useCallback(
    ({
      data,
      xKey,
      xScale,
      onXViewportChange,
      peerExtents = []
    }) => {
      const chartExtents = inferContinuousXDomainFromData(data, xKey, xScale);
      const syncExtents = resolveSynchronizedXExtents([chartExtents, ...peerExtents], xScale);
      const resolvedDomain = resolveControlledChartXDomain(xDomain, xScale);
      const effectiveXDomain = resolvedDomain && syncExtents ? clampXViewportDomain(resolvedDomain, syncExtents, xScale) : resolvedDomain;
      const handleXViewportChange = (domain, reason) => {
        if (!suppressEmitRef.current && syncExtents) {
          const clamped = clampXViewportDomain(domain, syncExtents, xScale);
          setXDomainState(clamped);
        }
        onXViewportChange?.(domain, reason);
      };
      return {
        xDomain: effectiveXDomain,
        onXViewportChange: handleXViewportChange,
        chartExtents,
        syncExtents
      };
    },
    [xDomain]
  );
  const sharedExtents = useMemo(
    () => (chartExtentsList, xScale) => resolveSynchronizedXExtents(chartExtentsList, xScale),
    []
  );
  return {
    xDomain,
    setXDomain,
    createChartViewportHandlers,
    resolveSharedExtents: sharedExtents
  };
};

// src/streaming/time-series-buffer.ts
var bisectLeft = (times, value) => {
  let low = 0;
  let high = times.length;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (times[mid] < value) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  return low;
};
var TimeSeriesBuffer = class {
  options;
  items = [];
  times = [];
  constructor(options) {
    this.options = {
      duplicatePolicy: "reject",
      outOfOrderPolicy: "reject",
      reorderWindowMs: 6e4,
      ...options
    };
    if (!Number.isFinite(this.options.capacity) || this.options.capacity <= 0) {
      throw new Error("TimeSeriesBuffer capacity must be a positive number");
    }
  }
  get size() {
    return this.items.length;
  }
  get newestTime() {
    return this.times.length > 0 ? this.times[this.times.length - 1] : null;
  }
  get oldestTime() {
    return this.times.length > 0 ? this.times[0] : null;
  }
  /** Returns the internal ordered snapshot (new array reference). */
  toArray() {
    return [...this.items];
  }
  clear() {
    this.items = [];
    this.times = [];
  }
  append(batch) {
    const stats = {
      accepted: 0,
      rejected: 0,
      dropped: 0,
      replaced: 0
    };
    for (const item of batch) {
      const outcome = this.appendOne(item);
      stats[outcome] += 1;
    }
    this.trim();
    return stats;
  }
  appendOne(item) {
    const time = this.options.readTime(item);
    if (!Number.isFinite(time)) {
      return "rejected";
    }
    const duplicateIndex = this.findDuplicateIndex(time);
    if (duplicateIndex >= 0) {
      if (this.options.duplicatePolicy === "allow") {
        this.insertAt(duplicateIndex, item, time);
        return "accepted";
      }
      if (this.options.duplicatePolicy === "replace") {
        this.items[duplicateIndex] = item;
        return "replaced";
      }
      return "rejected";
    }
    const newest = this.newestTime;
    if (newest == null) {
      this.items.push(item);
      this.times.push(time);
      return "accepted";
    }
    if (time > newest) {
      this.items.push(item);
      this.times.push(time);
      return "accepted";
    }
    const policy = this.options.outOfOrderPolicy ?? "reject";
    if (policy === "reject") {
      return "rejected";
    }
    if (policy === "drop") {
      return "dropped";
    }
    const windowMs = this.options.reorderWindowMs ?? 6e4;
    if (time < newest - windowMs) {
      return "dropped";
    }
    const index = bisectLeft(this.times, time);
    this.insertAt(index, item, time);
    return "accepted";
  }
  viewTrailing(windowMs, endMs) {
    const end = endMs ?? this.newestTime;
    if (end == null || this.items.length === 0) {
      const anchor = endMs ?? Date.now();
      return {
        items: [],
        domain: [new Date(anchor - windowMs), new Date(anchor)],
        clippedStart: false
      };
    }
    const start = end - Math.max(1, windowMs);
    const startIndex = bisectLeft(this.times, start);
    const clippedStart = startIndex > 0 || this.oldestTime != null && this.oldestTime < start;
    return {
      items: this.items.slice(startIndex),
      domain: [new Date(start), new Date(end)],
      clippedStart
    };
  }
  findDuplicateIndex(time) {
    const index = bisectLeft(this.times, time);
    if (index < this.times.length && this.times[index] === time) {
      return index;
    }
    if (index > 0 && this.times[index - 1] === time) {
      return index - 1;
    }
    return -1;
  }
  insertAt(index, item, time) {
    this.items.splice(index, 0, item);
    this.times.splice(index, 0, time);
  }
  trim() {
    const { capacity, retentionMs } = this.options;
    while (this.items.length > capacity) {
      this.items.shift();
      this.times.shift();
    }
    if (retentionMs != null && this.newestTime != null) {
      const minTime = this.newestTime - retentionMs;
      while (this.oldestTime != null && this.oldestTime < minTime) {
        this.items.shift();
        this.times.shift();
      }
    }
  }
};
var defaultWindowMs = 5 * 6e4;
var useTimeSeriesBuffer = ({
  windowMs = defaultWindowMs,
  maxUpdateFps = 30,
  now = () => Date.now(),
  ...bufferOptions
}) => {
  const bufferRef = useRef(null);
  if (bufferRef.current == null) {
    bufferRef.current = new TimeSeriesBuffer(bufferOptions);
  }
  const [mode, setMode] = useState("live");
  const [view, setView] = useState({
    data: [],
    xDomain: [new Date(now() - windowMs), new Date(now())],
    clippedStart: false
  });
  const [historyTruncated, setHistoryTruncated] = useState(false);
  const pauseAnchorRef = useRef(null);
  const rafRef = useRef(null);
  const lastFlushRef = useRef(0);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const applyView = useCallback((trailing) => {
    setView({
      data: trailing.items,
      xDomain: trailing.domain,
      clippedStart: trailing.clippedStart
    });
  }, []);
  const flushVisual = useCallback(() => {
    rafRef.current = null;
    const buffer = bufferRef.current;
    const endMs = modeRef.current === "paused" && pauseAnchorRef.current != null ? pauseAnchorRef.current : buffer.newestTime ?? now();
    const trailing = buffer.viewTrailing(windowMs, endMs);
    applyView(trailing);
    if (modeRef.current === "paused" && pauseAnchorRef.current != null) {
      const oldest = buffer.oldestTime;
      setHistoryTruncated(oldest != null && pauseAnchorRef.current - windowMs < oldest);
    } else {
      setHistoryTruncated(false);
    }
    lastFlushRef.current = performance.now();
  }, [applyView, now, windowMs]);
  const scheduleFlush = useCallback(() => {
    if (modeRef.current !== "live") {
      return;
    }
    if (rafRef.current != null) {
      return;
    }
    const minInterval = 1e3 / Math.max(1, maxUpdateFps);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const elapsed = performance.now() - lastFlushRef.current;
      if (lastFlushRef.current > 0 && elapsed < minInterval) {
        return;
      }
      flushVisual();
    });
  }, [flushVisual, maxUpdateFps]);
  useEffect(
    () => () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
    },
    []
  );
  const append = useCallback(
    (batch) => {
      const stats = bufferRef.current.append(batch);
      if (modeRef.current === "live") {
        const inVitest = typeof process !== "undefined" && process.env.VITEST || typeof import.meta !== "undefined" && import.meta.env?.VITEST;
        if (inVitest) {
          flushVisual();
        } else {
          scheduleFlush();
        }
      }
      return stats;
    },
    [flushVisual, scheduleFlush]
  );
  const pause = useCallback(() => {
    pauseAnchorRef.current = bufferRef.current?.newestTime ?? now();
    setMode("paused");
    flushVisual();
  }, [flushVisual, now]);
  const resumeLive = useCallback(() => {
    pauseAnchorRef.current = null;
    setMode("live");
    setHistoryTruncated(false);
    flushVisual();
  }, [flushVisual]);
  const clear = useCallback(() => {
    bufferRef.current.clear();
    pauseAnchorRef.current = null;
    setHistoryTruncated(false);
    applyView({
      items: [],
      domain: [new Date(now() - windowMs), new Date(now())],
      clippedStart: false
    });
  }, [applyView, now, windowMs]);
  return {
    view,
    mode,
    pause,
    resumeLive,
    append,
    clear,
    historyTruncated
  };
};

// src/data/histogram-bins.ts
var DEFAULT_BIN_COUNT = 10;
var isValidSample = (value) => typeof value === "number" && Number.isFinite(value);
var assertStrictlyIncreasingEdges = (edges) => {
  for (let index = 1; index < edges.length; index += 1) {
    if (!(edges[index] > edges[index - 1])) {
      throw new Error("[kamod-charts] histogram edges must be strictly increasing.");
    }
  }
};
var buildEqualWidthEdges = (min, max, binCount) => {
  if (binCount < 1) {
    throw new Error("[kamod-charts] histogram binCount must be at least 1.");
  }
  if (min === max) {
    return [min, min + 1];
  }
  const step = (max - min) / binCount;
  const edges = [];
  for (let index = 0; index <= binCount; index += 1) {
    edges.push(index === binCount ? max : min + step * index);
  }
  return edges;
};
var findBinIndex = (value, edges) => {
  const lastIndex = edges.length - 2;
  for (let index = 0; index <= lastIndex; index += 1) {
    const left = edges[index];
    const right = edges[index + 1];
    const isLast = index === lastIndex;
    if (value < left) {
      return -1;
    }
    if (isLast) {
      if (value <= right) {
        return index;
      }
      return -1;
    }
    if (value >= left && value < right) {
      return index;
    }
  }
  return -1;
};
var emptyBins = (edges) => {
  const bins = [];
  for (let index = 0; index < edges.length - 1; index += 1) {
    bins.push({
      index,
      left: edges[index],
      right: edges[index + 1],
      count: 0
    });
  }
  return bins;
};
var computeHistogramBins = (values, options = {}) => {
  const samples = [];
  let skippedCount = 0;
  for (const value of values) {
    if (!isValidSample(value)) {
      skippedCount += 1;
      continue;
    }
    samples.push(value);
  }
  let edges;
  if (options.edges && options.edges.length >= 2) {
    edges = [...options.edges];
    assertStrictlyIncreasingEdges(edges);
  } else {
    const binCount = options.binCount ?? DEFAULT_BIN_COUNT;
    if (samples.length === 0) {
      edges = buildEqualWidthEdges(0, 1, binCount);
    } else {
      let min = samples[0];
      let max = samples[0];
      for (const sample of samples) {
        if (sample < min) {
          min = sample;
        }
        if (sample > max) {
          max = sample;
        }
      }
      edges = buildEqualWidthEdges(min, max, binCount);
    }
  }
  const bins = emptyBins(edges);
  let assignedCount = 0;
  for (const sample of samples) {
    const binIndex = findBinIndex(sample, edges);
    if (binIndex < 0) {
      skippedCount += 1;
      continue;
    }
    bins[binIndex].count += 1;
    assignedCount += 1;
  }
  return {
    bins,
    assignedCount,
    skippedCount,
    edges
  };
};
var formatHistogramBinInterval = (bin, isLast) => {
  const rightBracket = isLast ? "]" : ")";
  return `[${bin.left}, ${bin.right}${rightBracket}`;
};
var histogramBinsToBarData = (result) => {
  const lastIndex = result.bins.length - 1;
  return result.bins.map((bin) => ({
    bin: formatHistogramBinInterval(bin, bin.index === lastIndex),
    count: bin.count,
    left: bin.left,
    right: bin.right
  }));
};

export { LineChartWithXBrush, Sparkline, TimeSeriesBuffer, computeHistogramBins, findNearestDatumIndexByX, formatHistogramBinInterval, histogramBinsToBarData, useSynchronizedCartesianSelection, useSynchronizedCartesianXDomain, useTimeSeriesBuffer };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map