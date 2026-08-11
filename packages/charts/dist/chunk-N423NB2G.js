import { PieSeries } from './chunk-SX5X33U3.js';
import { normalizeAccessor, Chart } from './chunk-B4X27YLI.js';
import { useState } from 'preact/hooks';
import { jsx } from 'preact/jsx-runtime';

var PieChart = ({
  data,
  valueKey,
  labelKey,
  width,
  height,
  initialWidth,
  responsive,
  title,
  description,
  id,
  innerRadius = 0,
  outerRadius,
  padAngle = 0,
  cornerRadius = 0,
  sort = false,
  labels = "inside",
  colors,
  centerContent,
  onSegmentClick
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const pointCount = data.length;
  const readValue = normalizeAccessor(valueKey);
  return /* @__PURE__ */ jsx(
    Chart,
    {
      data,
      width,
      height,
      initialWidth,
      responsive,
      title,
      description,
      id,
      tabIndex: 0,
      onKeyDown: (event) => {
        if (pointCount === 0) {
          return;
        }
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          event.preventDefault();
          setActiveIndex((index) => Math.min(index + 1, pointCount - 1));
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          event.preventDefault();
          setActiveIndex((index) => Math.max(index - 1, 0));
        } else if (event.key === "Home") {
          event.preventDefault();
          setActiveIndex(0);
        } else if (event.key === "End") {
          event.preventDefault();
          setActiveIndex(pointCount - 1);
        } else if (event.key === "Escape") {
          event.preventDefault();
          setActiveIndex(0);
        } else if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          const datum = data[activeIndex];
          if (datum) {
            const raw = readValue(datum, activeIndex);
            const value = typeof raw === "number" && Number.isFinite(raw) ? Math.max(0, raw) : 0;
            onSegmentClick?.(datum, activeIndex, value);
          }
        }
      },
      children: /* @__PURE__ */ jsx(
        PieSeries,
        {
          valueKey,
          labelKey,
          innerRadius,
          outerRadius,
          padAngle,
          cornerRadius,
          sort,
          activeIndex,
          colors,
          labelPosition: labels,
          centerContent,
          onSegmentClick
        }
      )
    }
  );
};

export { PieChart };
//# sourceMappingURL=chunk-N423NB2G.js.map
//# sourceMappingURL=chunk-N423NB2G.js.map