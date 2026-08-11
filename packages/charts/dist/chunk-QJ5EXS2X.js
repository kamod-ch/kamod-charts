import { inferCategoricalDomain, createBandScale, createPointScale, inferTimeDomain, createTimeScale, inferNumericDomain, createLinearScale } from './chunk-F4XUJBQT.js';
import { useChartContext } from './chunk-B4X27YLI.js';
import { format } from 'd3-format';
import { timeFormat } from 'd3-time-format';
import { jsxs, jsx } from 'preact/jsx-runtime';

// src/axes/axis-scale.ts
var defaultNumericDomain = [0, 1];
var defaultTimeDomain = [/* @__PURE__ */ new Date(0), /* @__PURE__ */ new Date(1)];
var useAxisScale = ({
  dataKey,
  scale,
  domain,
  padding,
  nice,
  orientation
}) => {
  const { data, plotArea, xKey, xScale } = useChartContext();
  const resolvedDataKey = dataKey ?? (orientation === "x" ? xKey : void 0);
  const resolvedScale = scale ?? (orientation === "x" ? xScale : void 0) ?? "linear";
  const range = orientation === "x" ? [0, plotArea.width] : [plotArea.height, 0];
  if (resolvedScale === "band") {
    const categoricalDomain = inferCategoricalDomain(
      data,
      resolvedDataKey ?? (() => void 0),
      Array.isArray(domain) && typeof domain[0] === "string" ? domain : void 0
    );
    return createBandScale({ domain: categoricalDomain, range });
  }
  if (resolvedScale === "point") {
    const categoricalDomain = inferCategoricalDomain(
      data,
      resolvedDataKey ?? (() => void 0),
      Array.isArray(domain) && typeof domain[0] === "string" ? domain : void 0
    );
    return createPointScale({ domain: categoricalDomain, range });
  }
  if (resolvedScale === "time") {
    const timeDomain = domain && domain[0] instanceof Date && domain[1] instanceof Date ? domain : resolvedDataKey ? inferTimeDomain({
      data,
      accessor: resolvedDataKey,
      padding
    }) : defaultTimeDomain;
    return createTimeScale({ domain: timeDomain, range, nice });
  }
  const numericDomain = domain && typeof domain[0] === "number" && typeof domain[1] === "number" ? domain : resolvedDataKey ? inferNumericDomain({
    data,
    accessor: resolvedDataKey,
    padding
  }) : defaultNumericDomain;
  return createLinearScale({ domain: numericDomain, range, nice });
};
var formatTick = (value, index, options = {}) => {
  if (options.formatter) {
    return options.formatter(value, index);
  }
  if (value instanceof Date) {
    return timeFormat(options.formatSpecifier ?? "%b %d")(value);
  }
  if (typeof value === "number") {
    return format(options.formatSpecifier ?? "~g")(value);
  }
  return value;
};

// src/axes/ticks.ts
var isBandScale = (scale) => "bandwidth" in scale;
var isCategoricalScale = (scale) => "domain" in scale && typeof scale.domain()[0] === "string";
var getScalePosition = (scale, value) => {
  if (value instanceof Date) {
    return scale(value);
  }
  if (typeof value === "number") {
    return scale(value);
  }
  const position = scale(value);
  if (position == null) {
    return void 0;
  }
  return isBandScale(scale) ? position + scale.bandwidth() / 2 : position;
};
var getTicks = (scale, tickCount = 5) => {
  if (isCategoricalScale(scale)) {
    return scale.domain();
  }
  if ("ticks" in scale) {
    return scale.ticks(tickCount);
  }
  return [];
};
var XAxis = ({
  dataKey,
  scale,
  domain,
  padding,
  nice,
  tickCount = 5,
  tickFormatter,
  formatSpecifier,
  label,
  tickRotation = 0,
  class: className
}) => {
  const { plotArea } = useChartContext();
  const axisScale = useAxisScale({
    dataKey,
    scale,
    domain,
    padding,
    nice,
    orientation: "x"
  });
  const ticks = getTicks(axisScale, tickCount);
  const domainLineY = 0;
  return /* @__PURE__ */ jsxs("g", { class: className, "data-kamod-chart-x-axis": "", transform: `translate(0 ${plotArea.height})`, children: [
    /* @__PURE__ */ jsx("line", { x1: 0, x2: "100%", y1: domainLineY, y2: domainLineY, stroke: "var(--chart-axis)" }),
    ticks.map((tick, index) => {
      const position = getScalePosition(axisScale, tick);
      if (position == null) {
        return null;
      }
      const labelText = formatTick(tick, index, {
        formatter: tickFormatter,
        formatSpecifier
      });
      const textAnchor = tickRotation === 0 ? "middle" : tickRotation > 0 ? "start" : "end";
      return /* @__PURE__ */ jsxs("g", { transform: `translate(${position} 0)`, children: [
        /* @__PURE__ */ jsx("line", { y2: 6, stroke: "var(--chart-axis)" }),
        /* @__PURE__ */ jsx(
          "text",
          {
            y: 12,
            dy: "0.71em",
            "text-anchor": textAnchor,
            transform: tickRotation ? `rotate(${tickRotation})` : void 0,
            children: labelText
          }
        )
      ] }, `${String(tick)}-${index}`);
    }),
    label ? /* @__PURE__ */ jsx("text", { x: "50%", y: 36, "text-anchor": "middle", "data-kamod-chart-axis-label": "", children: label }) : null
  ] });
};
var YAxis = ({
  dataKey,
  scale = "linear",
  domain,
  padding,
  nice,
  tickCount = 5,
  tickFormatter,
  formatSpecifier,
  label,
  class: className
}) => {
  const { plotArea } = useChartContext();
  const axisScale = useAxisScale({
    dataKey,
    scale,
    domain,
    padding,
    nice,
    orientation: "y"
  });
  const ticks = getTicks(axisScale, tickCount);
  return /* @__PURE__ */ jsxs("g", { class: className, "data-kamod-chart-y-axis": "", children: [
    /* @__PURE__ */ jsx("line", { y1: 0, y2: plotArea.height, stroke: "var(--chart-axis)" }),
    ticks.map((tick, index) => {
      const position = getScalePosition(axisScale, tick);
      if (position == null) {
        return null;
      }
      const labelText = formatTick(tick, index, {
        formatter: tickFormatter,
        formatSpecifier
      });
      return /* @__PURE__ */ jsxs("g", { transform: `translate(0 ${position})`, children: [
        /* @__PURE__ */ jsx("line", { x2: -6, stroke: "var(--chart-axis)" }),
        /* @__PURE__ */ jsx("text", { x: -9, dy: "0.32em", "text-anchor": "end", children: labelText })
      ] }, `${String(tick)}-${index}`);
    }),
    label ? /* @__PURE__ */ jsx(
      "text",
      {
        x: -plotArea.height / 2,
        y: -34,
        "text-anchor": "middle",
        transform: "rotate(-90)",
        "data-kamod-chart-axis-label": "",
        children: label
      }
    ) : null
  ] });
};

export { XAxis, YAxis, formatTick, getScalePosition, getTicks, useAxisScale };
//# sourceMappingURL=chunk-QJ5EXS2X.js.map
//# sourceMappingURL=chunk-QJ5EXS2X.js.map