import { Grid, ReferenceLine } from './chunk-BAOZGZY7.js';
import { XAxis, YAxis } from './chunk-QJ5EXS2X.js';
import { inferStackedDomain, inferGroupedDomain, getStackedValues } from './chunk-SX5X33U3.js';
import { inferCategoricalDomain, createBandScale, createLinearScale } from './chunk-F4XUJBQT.js';
import { Chart, useChartContext, normalizeAccessor } from './chunk-B4X27YLI.js';
import { useMemo } from 'preact/hooks';
import { jsxs, jsx } from 'preact/jsx-runtime';

var categoryOf = (value, index) => {
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
var BarChart = ({
  data,
  xKey,
  xScale = "band",
  series,
  width,
  height,
  initialWidth,
  responsive,
  title,
  description,
  id,
  showGrid = false,
  orientation = "vertical",
  stacked = false,
  grouped = true,
  radius = 0,
  minBarSize = 0,
  valueLabels = false,
  referenceLines = [],
  onBarClick
}) => {
  const visibleSeries = series.filter((entry) => !entry.hidden);
  const stackSeries = visibleSeries.map((entry) => ({
    id: entry.id ?? String(entry.key),
    value: entry.key
  }));
  const yDomain = useMemo(
    () => stacked ? inferStackedDomain(data, stackSeries) : inferGroupedDomain(data, stackSeries),
    [data, stacked, stackSeries]
  );
  const isHorizontal = orientation === "horizontal";
  return /* @__PURE__ */ jsxs(
    Chart,
    {
      data,
      xKey,
      xScale,
      width,
      height,
      initialWidth,
      responsive,
      title,
      description,
      id,
      children: [
        showGrid ? /* @__PURE__ */ jsx(Grid, { xKey, xScale, yDomain }) : null,
        /* @__PURE__ */ jsx(XAxis, { dataKey: xKey, scale: xScale }),
        /* @__PURE__ */ jsx(YAxis, { domain: yDomain }),
        /* @__PURE__ */ jsx(
          Bars,
          {
            data,
            xKey,
            series: visibleSeries,
            yDomain,
            stacked,
            grouped,
            horizontal: isHorizontal,
            radius,
            minBarSize,
            valueLabels,
            onBarClick
          }
        ),
        referenceLines.map((line, index) => /* @__PURE__ */ jsx(
          ReferenceLine,
          {
            x: line.x,
            y: line.y,
            yDomain,
            label: line.label,
            color: line.color,
            yKey: line.yKey,
            xKey,
            xScale
          },
          index
        ))
      ]
    }
  );
};
var Bars = ({
  data,
  xKey,
  series,
  yDomain,
  stacked,
  grouped,
  horizontal,
  radius,
  minBarSize,
  valueLabels,
  onBarClick
}) => {
  const { plotArea } = useChartContext();
  const readX = normalizeAccessor(xKey ?? ((_datum, index) => index));
  const domain = inferCategoricalDomain(data, xKey ?? ((_datum, index) => index));
  const categoryScale = createBandScale({
    domain,
    range: horizontal ? [0, plotArea.height] : [0, plotArea.width],
    paddingInner: 0.2
  });
  const innerScale = createBandScale({
    domain: series.map((entry) => entry.id ?? String(entry.key)),
    range: [0, categoryScale.bandwidth()],
    paddingInner: grouped ? 0.1 : 0,
    paddingOuter: 0
  });
  const valueScale = createLinearScale({
    domain: yDomain,
    range: horizontal ? [0, plotArea.width] : [plotArea.height, 0],
    nice: true
  });
  const stackedLayers = stacked ? getStackedValues(
    data,
    series.map((entry) => ({ id: entry.id ?? String(entry.key), value: entry.key }))
  ) : [];
  return /* @__PURE__ */ jsx("g", { "data-kamod-chart-bars": "", children: series.map((entry, seriesIndex) => {
    const readY = normalizeAccessor(entry.key);
    const seriesId = entry.id ?? String(entry.key);
    return data.map((datum, index) => {
      const category = categoryOf(readX(datum, index), index);
      const categoryPosition = categoryScale(category);
      if (categoryPosition == null) {
        return null;
      }
      const raw = readY(datum, index);
      const value = typeof raw === "number" && Number.isFinite(raw) ? raw : 0;
      const stackValue = stackedLayers[seriesIndex]?.[index];
      const valueStart = stacked ? stackValue?.y0 ?? 0 : 0;
      const valueEnd = stacked ? stackValue?.y1 ?? value : value;
      const scaledStart = valueScale(valueStart);
      const scaledEnd = valueScale(valueEnd);
      const groupOffset = stacked ? 0 : innerScale(seriesId) ?? 0;
      const bandSize = stacked ? categoryScale.bandwidth() : innerScale.bandwidth();
      const x = horizontal ? Math.min(scaledStart, scaledEnd) : categoryPosition + groupOffset;
      const y = horizontal ? categoryPosition + groupOffset : Math.min(scaledStart, scaledEnd);
      const barWidth = horizontal ? Math.max(Math.abs(scaledEnd - scaledStart), minBarSize) : bandSize;
      const barHeight = horizontal ? bandSize : Math.max(Math.abs(scaledEnd - scaledStart), minBarSize);
      const labelX = horizontal ? x + barWidth + 4 : x + barWidth / 2;
      const labelY = horizontal ? y + barHeight / 2 : y - 4;
      return /* @__PURE__ */ jsxs("g", { children: [
        /* @__PURE__ */ jsx(
          "path",
          {
            d: roundedRectPath(x, y, barWidth, barHeight, radius),
            fill: entry.color ?? `var(--chart-${seriesIndex % 4 + 1})`,
            "data-kamod-chart-bar": "",
            onClick: onBarClick ? () => onBarClick(datum, seriesId, index, value) : void 0
          }
        ),
        valueLabels ? /* @__PURE__ */ jsx(
          "text",
          {
            x: labelX,
            y: labelY,
            "text-anchor": horizontal ? "start" : "middle",
            "dominant-baseline": "middle",
            children: value
          }
        ) : null
      ] }, `${seriesId}-${index}`);
    });
  }) });
};

export { BarChart };
//# sourceMappingURL=chunk-TVCUL27Q.js.map
//# sourceMappingURL=chunk-TVCUL27Q.js.map