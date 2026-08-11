import { inferNumericDomain, inferCategoricalDomain, createBandScale, createLinearScale, inferTimeDomain, createTimeScale, createPointScale } from './chunk-F4XUJBQT.js';
import { normalizeAccessor, useChartContext } from './chunk-B4X27YLI.js';
import { area, line, pie, arc, curveLinear, curveMonotoneX, curveBasis } from 'd3-shape';
import { useMemo } from 'preact/hooks';
import { jsx, jsxs } from 'preact/jsx-runtime';

// src/series/cartesian.ts
var indexAccessor = (_datum, index) => index;
var inferCombinedNumericDomain = (data, accessors) => {
  const values = [];
  for (const accessor of accessors) {
    const read = normalizeAccessor(accessor);
    for (const [index, datum] of data.entries()) {
      const value = read(datum, index);
      if (typeof value === "number" && Number.isFinite(value)) {
        values.push(value);
      }
    }
  }
  return inferNumericDomain({ data: values.map((value) => ({ value })), accessor: "value" });
};
var useCartesianScales = ({
  xKey,
  yKey,
  xScale,
  xDomain,
  yDomain,
  nice
}) => {
  const { data, plotArea, xKey: contextXKey, xScale: contextXScale } = useChartContext();
  const resolvedXKey = xKey ?? contextXKey ?? indexAccessor;
  const resolvedXScale = xScale ?? contextXScale ?? "linear";
  const xRange = [0, plotArea.width];
  const yRange = [plotArea.height, 0];
  const nextXScale = (() => {
    if (resolvedXScale === "time") {
      const domain2 = xDomain && xDomain[0] instanceof Date && xDomain[1] instanceof Date ? xDomain : inferTimeDomain({
        data,
        accessor: resolvedXKey
      });
      return createTimeScale({ domain: domain2, range: xRange, nice });
    }
    if (resolvedXScale === "point" || resolvedXScale === "band") {
      const domain2 = inferCategoricalDomain(
        data,
        resolvedXKey,
        Array.isArray(xDomain) && typeof xDomain[0] === "string" ? xDomain : void 0
      );
      return createPointScale({ domain: domain2, range: xRange });
    }
    const domain = xDomain && typeof xDomain[0] === "number" && typeof xDomain[1] === "number" ? xDomain : inferNumericDomain({
      data,
      accessor: resolvedXKey
    });
    return createLinearScale({ domain, range: xRange, nice });
  })();
  const nextYDomain = yDomain ?? inferNumericDomain({ data, accessor: yKey });
  const nextYScale = createLinearScale({ domain: nextYDomain, range: yRange, nice });
  return { xScale: nextXScale, yScale: nextYScale };
};
var getCartesianPoints = (data, xScale, yScale, xKey, yKey) => {
  const readX = normalizeAccessor(xKey ?? indexAccessor);
  const readY = normalizeAccessor(yKey);
  return data.map((datum, index) => {
    const xValue = readX(datum, index);
    const yValue = readY(datum, index);
    const x = xValue == null ? null : xScale(xValue) ?? null;
    const y = typeof yValue === "number" && Number.isFinite(yValue) ? yScale(yValue) ?? null : null;
    return {
      datum,
      index,
      xValue,
      yValue,
      x,
      y,
      defined: typeof x === "number" && typeof y === "number"
    };
  });
};
var resolveCurve = (curve = "linear") => {
  if (typeof curve === "function") {
    return curve;
  }
  return curve === "monotoneX" ? curveMonotoneX : curveLinear;
};
var AreaSeries = ({
  dataKey,
  xKey,
  xScale,
  xDomain,
  yDomain,
  baseline = 0,
  id,
  color = "var(--chart-1)",
  opacity = 0.2,
  curve = "linear",
  outline = false,
  class: className
}) => {
  const { data, xKey: contextXKey } = useChartContext();
  const resolvedXKey = xKey ?? contextXKey;
  const scales = useCartesianScales({
    xKey: resolvedXKey,
    yKey: dataKey,
    xScale,
    xDomain,
    yDomain,
    nice: true
  });
  const baselineY = scales.yScale(baseline) ?? 0;
  const points = useMemo(
    () => getCartesianPoints(data, scales.xScale, scales.yScale, resolvedXKey, dataKey),
    [data, dataKey, resolvedXKey, scales.xScale, scales.yScale]
  );
  const path = useMemo(() => {
    const generator = area().defined((point) => point.defined).x((point) => point.x ?? 0).y0(baselineY).y1((point) => point.y ?? baselineY).curve(resolveCurve(curve));
    return generator(points) ?? "";
  }, [baselineY, curve, points]);
  return /* @__PURE__ */ jsx("g", { class: className, "data-kamod-chart-area-series": "", "data-kamod-chart-series-id": id, children: /* @__PURE__ */ jsx("path", { d: path, fill: color, "fill-opacity": opacity, stroke: outline ? color : "none" }) });
};
var valueToCategory = (value, index) => {
  if (value == null) {
    return String(index);
  }
  return value instanceof Date ? value.toISOString() : String(value);
};
var roundedRectPath = (x, y, width, height, radius) => {
  const safeRadius = Math.max(0, Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2));
  const right = x + width;
  const bottom = y + height;
  if (safeRadius === 0) {
    return `M${x},${y}H${right}V${bottom}H${x}Z`;
  }
  return `M${x + safeRadius},${y}H${right - safeRadius}Q${right},${y} ${right},${y + safeRadius}V${bottom - safeRadius}Q${right},${bottom} ${right - safeRadius},${bottom}H${x + safeRadius}Q${x},${bottom} ${x},${bottom - safeRadius}V${y + safeRadius}Q${x},${y} ${x + safeRadius},${y}Z`;
};
var BarSeries = ({
  dataKey,
  xKey,
  yDomain,
  id,
  color = "var(--chart-1)",
  radius = 0,
  minBarSize = 0,
  horizontal = false,
  class: className,
  onBarClick
}) => {
  const { data, plotArea, xKey: contextXKey } = useChartContext();
  const resolvedXKey = xKey ?? contextXKey;
  const readX = normalizeAccessor(resolvedXKey ?? ((_datum, index) => index));
  const readY = normalizeAccessor(dataKey);
  const domain = useMemo(
    () => inferCategoricalDomain(data, resolvedXKey ?? ((_datum, index) => index)),
    [data, resolvedXKey]
  );
  const valueDomain = yDomain ?? inferNumericDomain({ data, accessor: dataKey });
  const categoryScale = createBandScale({
    domain,
    range: horizontal ? [0, plotArea.height] : [0, plotArea.width],
    paddingInner: 0.2,
    paddingOuter: 0.1
  });
  const valueScale = createLinearScale({
    domain: valueDomain,
    range: horizontal ? [0, plotArea.width] : [plotArea.height, 0],
    nice: true
  });
  const zero = valueScale(0);
  return /* @__PURE__ */ jsx("g", { class: className, "data-kamod-chart-bar-series": "", "data-kamod-chart-series-id": id, children: data.map((datum, index) => {
    const raw = readY(datum, index);
    if (typeof raw !== "number" || !Number.isFinite(raw)) {
      return null;
    }
    const category = valueToCategory(readX(datum, index), index);
    const categoryPosition = categoryScale(category);
    if (categoryPosition == null) {
      return null;
    }
    const scaled = valueScale(raw);
    const bandwidth = categoryScale.bandwidth();
    const x = horizontal ? Math.min(zero, scaled) : categoryPosition;
    const y = horizontal ? categoryPosition : Math.min(zero, scaled);
    const width = horizontal ? Math.max(Math.abs(scaled - zero), minBarSize) : bandwidth;
    const height = horizontal ? bandwidth : Math.max(Math.abs(scaled - zero), minBarSize);
    return /* @__PURE__ */ jsx(
      "path",
      {
        d: roundedRectPath(x, y, width, height, radius),
        fill: color,
        "data-kamod-chart-bar": "",
        onClick: onBarClick ? () => onBarClick(datum, index, raw) : void 0
      },
      index
    );
  }) });
};
var resolveCurve2 = (curve = "linear") => {
  if (typeof curve === "function") {
    return curve;
  }
  if (curve === "monotoneX") {
    return curveMonotoneX;
  }
  if (curve === "basis") {
    return curveBasis;
  }
  return curveLinear;
};
var LineSeries = ({
  dataKey,
  xKey,
  xScale,
  xDomain,
  yDomain,
  id,
  color = "var(--chart-1)",
  strokeWidth = 2,
  curve = "linear",
  connectNulls = false,
  showPoints = "auto",
  activeIndex = null,
  class: className
}) => {
  const { data, xKey: contextXKey } = useChartContext();
  const resolvedXKey = xKey ?? contextXKey;
  const scales = useCartesianScales({
    xKey: resolvedXKey,
    yKey: dataKey,
    xScale,
    xDomain,
    yDomain,
    nice: true
  });
  const points = useMemo(
    () => getCartesianPoints(data, scales.xScale, scales.yScale, resolvedXKey, dataKey),
    [data, dataKey, resolvedXKey, scales.xScale, scales.yScale]
  );
  const path = useMemo(() => {
    const generator = line().defined((point) => connectNulls || point.defined).x((point) => point.x ?? 0).y((point) => point.y ?? 0).curve(resolveCurve2(curve));
    return generator(points) ?? "";
  }, [connectNulls, curve, points]);
  const shouldShowPoints = showPoints === true || showPoints === "auto" && points.length <= 500;
  return /* @__PURE__ */ jsxs("g", { class: className, "data-kamod-chart-line-series": "", "data-kamod-chart-series-id": id, children: [
    /* @__PURE__ */ jsx(
      "path",
      {
        d: path,
        fill: "none",
        stroke: color,
        "stroke-width": strokeWidth,
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
      }
    ),
    shouldShowPoints ? points.map(
      (point) => point.defined ? /* @__PURE__ */ jsx(
        "circle",
        {
          cx: point.x ?? 0,
          cy: point.y ?? 0,
          r: activeIndex === point.index ? 4 : 2.5,
          fill: color,
          stroke: "var(--chart-tooltip-background)",
          "stroke-width": activeIndex === point.index ? 2 : 1,
          "data-kamod-chart-active": activeIndex === point.index ? "true" : void 0
        },
        point.index
      ) : null
    ) : null
  ] });
};
var defaultColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];
var valueToLabel = (value, index) => {
  if (value == null) {
    return `Segment ${index + 1}`;
  }
  return value instanceof Date ? value.toISOString() : String(value);
};
var PieSeries = ({
  valueKey,
  labelKey,
  innerRadius = 0,
  outerRadius,
  padAngle = 0,
  cornerRadius = 0,
  sort = false,
  activeIndex = null,
  activeOffset = 6,
  colors = defaultColors,
  labelPosition = "inside",
  centerContent,
  class: className,
  onSegmentClick
}) => {
  const { data, plotArea } = useChartContext();
  const radius = outerRadius ?? Math.max(0, Math.min(plotArea.width, plotArea.height) / 2);
  const centerX = plotArea.width / 2;
  const centerY = plotArea.height / 2;
  const readValue = normalizeAccessor(valueKey);
  const readLabel = normalizeAccessor(labelKey ?? ((_datum, index) => index));
  const pieData = useMemo(
    () => data.map((datum, index) => {
      const raw = readValue(datum, index);
      const value = typeof raw === "number" && Number.isFinite(raw) ? Math.max(0, raw) : 0;
      return {
        datum,
        index,
        label: valueToLabel(readLabel(datum, index), index),
        value,
        color: colors[index % colors.length] ?? "var(--chart-1)"
      };
    }),
    [colors, data, readLabel, readValue]
  );
  const total = pieData.reduce((sum, datum) => sum + datum.value, 0);
  const arcs = useMemo(() => {
    const generator = pie().value((datum) => datum.value).padAngle(padAngle);
    if (sort === false) {
      generator.sort(null);
    } else if (typeof sort === "function") {
      generator.sort(sort);
    }
    return generator(pieData.filter((datum) => datum.value > 0));
  }, [padAngle, pieData, sort]);
  if (total <= 0) {
    return /* @__PURE__ */ jsxs(
      "g",
      {
        class: className,
        "data-kamod-chart-pie-series": "",
        transform: `translate(${centerX} ${centerY})`,
        children: [
          /* @__PURE__ */ jsx("text", { "text-anchor": "middle", "dominant-baseline": "middle", children: "Keine positiven Werte" }),
          centerContent
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxs(
    "g",
    {
      class: className,
      "data-kamod-chart-pie-series": "",
      transform: `translate(${centerX} ${centerY})`,
      children: [
        arcs.map((segment) => {
          const isActive = activeIndex === segment.data.index;
          const segmentArc = arc().innerRadius(innerRadius).outerRadius(radius + (isActive ? activeOffset : 0)).cornerRadius(cornerRadius);
          const labelArc = arc().innerRadius(labelPosition === "outside" ? radius + 18 : (innerRadius + radius) / 2).outerRadius(labelPosition === "outside" ? radius + 18 : (innerRadius + radius) / 2);
          const [labelX, labelY] = labelArc.centroid(segment);
          return /* @__PURE__ */ jsxs("g", { "data-kamod-chart-pie-segment": "", children: [
            /* @__PURE__ */ jsx(
              "path",
              {
                d: segmentArc(segment) ?? "",
                fill: segment.data.color,
                stroke: "var(--chart-tooltip-background)",
                "stroke-width": "1",
                "data-kamod-chart-active": isActive ? "true" : void 0,
                onClick: onSegmentClick ? () => onSegmentClick(segment.data.datum, segment.data.index, segment.data.value) : void 0
              }
            ),
            labelPosition === "none" ? null : /* @__PURE__ */ jsx("text", { x: labelX, y: labelY, "text-anchor": "middle", "dominant-baseline": "middle", children: segment.data.label })
          ] }, segment.data.index);
        }),
        centerContent
      ]
    }
  );
};
var ScatterSeries = ({
  yKey,
  xKey,
  xScale,
  xDomain,
  yDomain,
  id,
  color = "var(--chart-1)",
  size = 4,
  activeIndex = null,
  class: className
}) => {
  const { data, xKey: contextXKey } = useChartContext();
  const resolvedXKey = xKey ?? contextXKey;
  const scales = useCartesianScales({
    xKey: resolvedXKey,
    yKey,
    xScale,
    xDomain,
    yDomain,
    nice: true
  });
  const points = useMemo(
    () => getCartesianPoints(data, scales.xScale, scales.yScale, resolvedXKey, yKey),
    [data, resolvedXKey, scales.xScale, scales.yScale, yKey]
  );
  return /* @__PURE__ */ jsx("g", { class: className, "data-kamod-chart-scatter-series": "", "data-kamod-chart-series-id": id, children: points.map((point) => {
    if (!point.defined) {
      return null;
    }
    const fill = typeof color === "function" ? color(point.datum, point.index) : color;
    const radius = typeof size === "function" ? size(point.datum, point.index) : size;
    return /* @__PURE__ */ jsx(
      "circle",
      {
        cx: point.x ?? 0,
        cy: point.y ?? 0,
        r: activeIndex === point.index ? radius + 2 : radius,
        fill,
        stroke: "var(--chart-tooltip-background)",
        "stroke-width": activeIndex === point.index ? 2 : 1,
        "data-kamod-chart-active": activeIndex === point.index ? "true" : void 0
      },
      point.index
    );
  }) });
};

// src/series/stack.ts
var getStackedValues = (data, series) => {
  const accessors = series.map((entry) => ({ id: entry.id, read: normalizeAccessor(entry.value) }));
  const layers = series.map(() => []);
  for (const [index, datum] of data.entries()) {
    let positive = 0;
    let negative = 0;
    accessors.forEach((entry, seriesIndex) => {
      const raw = entry.read(datum, index);
      const value = typeof raw === "number" && Number.isFinite(raw) ? raw : 0;
      const y0 = value >= 0 ? positive : negative;
      const y1 = y0 + value;
      if (value >= 0) {
        positive = y1;
      } else {
        negative = y1;
      }
      layers[seriesIndex]?.push({ datum, index, seriesId: entry.id, value, y0, y1 });
    });
  }
  return layers;
};
var inferStackedDomain = (data, series) => {
  let min = 0;
  let max = 0;
  const accessors = series.map((entry) => normalizeAccessor(entry.value));
  for (const [index, datum] of data.entries()) {
    let positive = 0;
    let negative = 0;
    for (const read of accessors) {
      const raw = read(datum, index);
      const value = typeof raw === "number" && Number.isFinite(raw) ? raw : 0;
      if (value >= 0) {
        positive += value;
      } else {
        negative += value;
      }
    }
    min = Math.min(min, negative);
    max = Math.max(max, positive);
  }
  if (min === max) {
    return [min - 1, max + 1];
  }
  return [min, max];
};
var inferGroupedDomain = (data, series) => {
  let min = 0;
  let max = 0;
  for (const entry of series) {
    const read = normalizeAccessor(entry.value);
    for (const [index, datum] of data.entries()) {
      const raw = read(datum, index);
      if (typeof raw === "number" && Number.isFinite(raw)) {
        min = Math.min(min, raw);
        max = Math.max(max, raw);
      }
    }
  }
  if (min === max) {
    return [min - 1, max + 1];
  }
  return [min, max];
};
var StackedAreaSeries = ({
  series,
  xKey,
  xScale,
  yDomain,
  opacity = 0.2
}) => {
  const { data, plotArea, xKey: contextXKey } = useChartContext();
  const resolvedXKey = xKey ?? contextXKey;
  const xScales = useCartesianScales({
    xKey: resolvedXKey,
    yKey: series[0]?.value ?? (() => 0),
    xScale,
    yDomain
  });
  const readX = normalizeAccessor(resolvedXKey ?? ((_datum, index) => index));
  const yScale = createLinearScale({ domain: yDomain, range: [plotArea.height, 0], nice: true });
  const layers = getStackedValues(data, series);
  return /* @__PURE__ */ jsx("g", { "data-kamod-chart-stacked-area-series": "", children: layers.map((layer, layerIndex) => {
    const path = area().x((point) => xScales.xScale(readX(point.datum, point.index)) ?? 0).y0((point) => yScale(point.y0)).y1((point) => yScale(point.y1)).curve(curveLinear)(layer);
    return /* @__PURE__ */ jsx(
      "path",
      {
        d: path ?? "",
        fill: series[layerIndex]?.color ?? `var(--chart-${layerIndex % 4 + 1})`,
        "fill-opacity": opacity,
        stroke: series[layerIndex]?.color ?? `var(--chart-${layerIndex % 4 + 1})`
      },
      series[layerIndex]?.id ?? layerIndex
    );
  }) });
};

export { AreaSeries, BarSeries, LineSeries, PieSeries, ScatterSeries, StackedAreaSeries, getStackedValues, inferCombinedNumericDomain, inferGroupedDomain, inferStackedDomain };
//# sourceMappingURL=chunk-SX5X33U3.js.map
//# sourceMappingURL=chunk-SX5X33U3.js.map