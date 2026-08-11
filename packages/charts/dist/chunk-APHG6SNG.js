import { Grid, ReferenceLine } from './chunk-BAOZGZY7.js';
import { XAxis, YAxis } from './chunk-QJ5EXS2X.js';
import { inferStackedDomain, inferGroupedDomain, StackedAreaSeries, AreaSeries } from './chunk-SX5X33U3.js';
import { Chart } from './chunk-B4X27YLI.js';
import { useMemo } from 'preact/hooks';
import { jsxs, jsx } from 'preact/jsx-runtime';

var AreaChart = ({
  data,
  xKey,
  xScale,
  series,
  width,
  height,
  initialWidth,
  responsive,
  title,
  description,
  id,
  showGrid = false,
  stacked = false,
  baseline = 0,
  opacity = 0.2,
  outline = false,
  curve = "linear",
  referenceLines = []
}) => {
  const visibleSeries = series.filter((entry) => !entry.hidden);
  const stackSeries = visibleSeries.map((entry) => ({
    id: entry.id ?? String(entry.key),
    value: entry.key,
    color: entry.color
  }));
  const yDomain = useMemo(
    () => stacked ? inferStackedDomain(data, stackSeries) : inferGroupedDomain(data, stackSeries),
    [data, stacked, stackSeries]
  );
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
        )),
        stacked ? /* @__PURE__ */ jsx(
          StackedAreaSeries,
          {
            series: stackSeries,
            xKey,
            xScale,
            yDomain,
            opacity
          }
        ) : visibleSeries.map((entry, index) => /* @__PURE__ */ jsx(
          AreaSeries,
          {
            id: entry.id ?? String(entry.key),
            dataKey: entry.key,
            yDomain,
            color: entry.color ?? `var(--chart-${index % 4 + 1})`,
            baseline,
            opacity,
            outline,
            curve
          },
          entry.id ?? String(entry.key)
        ))
      ]
    }
  );
};

export { AreaChart };
//# sourceMappingURL=chunk-APHG6SNG.js.map
//# sourceMappingURL=chunk-APHG6SNG.js.map