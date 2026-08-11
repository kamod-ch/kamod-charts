import { createChartKeyboardHandler, getPointerPosition, getNearestIndexByX } from './chunk-DEOCEA5K.js';
import { Grid, Crosshair, ReferenceLine, Legend, Tooltip, LiveRegion } from './chunk-BAOZGZY7.js';
import { XAxis, YAxis } from './chunk-QJ5EXS2X.js';
import { inferCombinedNumericDomain, ScatterSeries } from './chunk-SX5X33U3.js';
import { normalizeAccessor, Chart } from './chunk-B4X27YLI.js';
import { useState, useMemo } from 'preact/hooks';
import { jsxs, jsx, Fragment } from 'preact/jsx-runtime';

var ScatterChart = ({
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
  showLegend = false,
  tooltip = false,
  pointSize = 4,
  referenceLines = []
}) => {
  const [hiddenSeries, setHiddenSeries] = useState([]);
  const visibleSeries = series.filter(
    (entry) => !entry.hidden && !hiddenSeries.includes(entry.id ?? String(entry.key))
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeSeriesIndex, setActiveSeriesIndex] = useState(0);
  const yDomain = useMemo(
    () => inferCombinedNumericDomain(
      data,
      visibleSeries.map((entry) => entry.key)
    ),
    [data, visibleSeries]
  );
  const activeSeries = visibleSeries[activeSeriesIndex];
  const activeDatum = data[activeIndex];
  const activeValue = activeDatum && activeSeries ? normalizeAccessor(activeSeries.key)(activeDatum, activeIndex) : null;
  const interaction = activeDatum && activeSeries ? {
    datum: activeDatum,
    seriesId: activeSeries.id ?? String(activeSeries.key),
    index: activeIndex,
    value: typeof activeValue === "number" ? activeValue : null,
    x: 40 + activeIndex * 24,
    y: 24
  } : null;
  const plotWidth = Math.max((width ?? initialWidth ?? 640) - 56, 1);
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
      tabIndex: 0,
      onPointerMove: (event) => {
        const position = getPointerPosition(event, {
          x: 40,
          y: 16,
          width: plotWidth,
          height: Math.max(height - 48, 1)
        });
        setActiveIndex(getNearestIndexByX(position.plotX, plotWidth, data.length));
      },
      onPointerLeave: () => setActiveIndex(0),
      onKeyDown: createChartKeyboardHandler({
        pointCount: data.length,
        seriesCount: visibleSeries.length,
        activeIndex,
        activeSeriesIndex,
        onChange: (state) => {
          setActiveIndex(state.activeIndex);
          setActiveSeriesIndex(state.activeSeriesIndex);
        },
        onEscape: () => setActiveIndex(0)
      }),
      overlay: /* @__PURE__ */ jsxs(Fragment, { children: [
        showLegend ? /* @__PURE__ */ jsx(
          Legend,
          {
            items: series.map((entry, index) => ({
              id: entry.id ?? String(entry.key),
              label: entry.label,
              color: entry.color ?? `var(--chart-${index % 4 + 1})`,
              hidden: hiddenSeries.includes(entry.id ?? String(entry.key))
            })),
            onToggle: (seriesId) => setHiddenSeries(
              (current) => current.includes(seriesId) ? current.filter((entry) => entry !== seriesId) : [...current, seriesId]
            )
          }
        ) : null,
        tooltip ? /* @__PURE__ */ jsx(Tooltip, { interaction }) : null,
        /* @__PURE__ */ jsx(LiveRegion, { interaction })
      ] }),
      children: [
        showGrid ? /* @__PURE__ */ jsx(Grid, { xKey, xScale, yDomain }) : null,
        tooltip ? /* @__PURE__ */ jsx(Crosshair, { interaction, width: plotWidth, height: Math.max(height - 48, 1) }) : null,
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
        visibleSeries.map((entry, index) => /* @__PURE__ */ jsx(
          ScatterSeries,
          {
            id: entry.id ?? String(entry.key),
            yKey: entry.key,
            yDomain,
            color: entry.color ?? `var(--chart-${index % 4 + 1})`,
            size: pointSize,
            activeIndex: entry === activeSeries ? activeIndex : null
          },
          entry.id ?? String(entry.key)
        ))
      ]
    }
  );
};

export { ScatterChart };
//# sourceMappingURL=chunk-ZESBIOPH.js.map
//# sourceMappingURL=chunk-ZESBIOPH.js.map