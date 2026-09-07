import { createContext } from 'preact';
import { useContext, useRef, useState, useEffect, useId, useMemo } from 'preact/hooks';
import { jsxs, jsx } from 'preact/jsx-runtime';

// src/core/accessors.ts
var normalizeAccessor = (accessor) => {
  if (typeof accessor === "function") {
    return accessor;
  }
  return (datum) => datum[accessor];
};
var readAccessor = (datum, index, accessor) => normalizeAccessor(accessor)(datum, index);

// src/core/chart-layout.ts
var defaultChartMargin = {
  top: 16,
  right: 16,
  bottom: 32,
  left: 40
};
var normalizeMargin = (margin) => ({
  top: margin?.top ?? defaultChartMargin.top,
  right: margin?.right ?? defaultChartMargin.right,
  bottom: margin?.bottom ?? defaultChartMargin.bottom,
  left: margin?.left ?? defaultChartMargin.left
});
var clampDimension = (value) => {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return value;
};
var resolveChartSize = ({
  width,
  height,
  initialWidth,
  responsive
}) => ({
  width: clampDimension(
    responsive ? initialWidth ?? width ?? 640 : width ?? initialWidth ?? 640
  ),
  height: clampDimension(height)
});
var calculatePlotArea = (size, margin) => {
  const width = clampDimension(size.width - margin.left - margin.right);
  const height = clampDimension(size.height - margin.top - margin.bottom);
  return {
    x: margin.left,
    y: margin.top,
    width,
    height
  };
};
var ChartContext = createContext(null);
var ChartProvider = ChartContext.Provider;
var useChartContext = () => {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error("Chart components must be rendered inside <Chart>.");
  }
  return context;
};
var ChartSurface = ({
  id,
  title,
  description,
  labelledBy,
  describedBy,
  role = "img",
  width,
  height,
  class: className,
  style,
  tabIndex,
  onKeyDown,
  onPointerMove,
  onPointerLeave,
  children
}) => {
  const titleId = labelledBy ?? (title && id ? `${id}-title` : void 0);
  const descriptionId = describedBy ?? (description && id ? `${id}-description` : void 0);
  const ariaLabelledBy = [titleId, descriptionId].filter(Boolean).join(" ") || void 0;
  return /* @__PURE__ */ jsxs(
    "svg",
    {
      id,
      role,
      "aria-labelledby": ariaLabelledBy,
      class: className,
      style,
      width,
      height,
      viewBox: `0 0 ${width} ${height}`,
      "data-kamod-chart-surface": "",
      tabIndex,
      onKeyDown,
      onPointerMove,
      onPointerLeave,
      xmlns: "http://www.w3.org/2000/svg",
      children: [
        title ? /* @__PURE__ */ jsx("title", { id: titleId, children: title }) : null,
        description ? /* @__PURE__ */ jsx("desc", { id: descriptionId, children: description }) : null,
        children
      ]
    }
  );
};
var canUseResizeObserver = () => typeof globalThis.ResizeObserver !== "undefined" && typeof globalThis.ResizeObserver === "function";
var requestFrame = (callback) => {
  if (typeof globalThis.requestAnimationFrame === "function") {
    return globalThis.requestAnimationFrame(callback);
  }
  callback();
  return 0;
};
var cancelFrame = (frame) => {
  if (frame !== 0 && typeof globalThis.cancelAnimationFrame === "function") {
    globalThis.cancelAnimationFrame(frame);
  }
};
var ResponsiveContainer = ({
  width,
  initialWidth,
  responsive = false,
  class: className,
  children
}) => {
  const elementRef = useRef(null);
  const frameRef = useRef(0);
  const [measuredWidth, setMeasuredWidth] = useState(
    () => clampDimension(responsive ? initialWidth : width ?? initialWidth)
  );
  const containerRef = (element) => {
    elementRef.current = element;
  };
  useEffect(() => {
    if (!responsive) {
      setMeasuredWidth(clampDimension(width ?? initialWidth));
      return;
    }
    const element = elementRef.current;
    if (!element || !canUseResizeObserver()) {
      return;
    }
    const observer = new globalThis.ResizeObserver((entries) => {
      const nextWidth = entries[0]?.contentRect.width;
      if (typeof nextWidth !== "number") {
        return;
      }
      cancelFrame(frameRef.current);
      frameRef.current = requestFrame(() => {
        setMeasuredWidth(clampDimension(nextWidth));
      });
    });
    observer.observe(element);
    return () => {
      cancelFrame(frameRef.current);
      observer.disconnect();
    };
  }, [initialWidth, responsive, width]);
  return /* @__PURE__ */ jsx(
    "div",
    {
      class: className,
      "data-kamod-chart-container": "",
      ref: containerRef,
      style: { position: "relative" },
      children: children({ width: measuredWidth, containerRef })
    }
  );
};
var defaultEmptyState = /* @__PURE__ */ jsx("text", { x: "50%", y: "50%", "text-anchor": "middle", "dominant-baseline": "middle", children: "Keine Daten verf\xFCgbar" });
var normalizeIdPart = (value) => value.replace(/[^a-zA-Z0-9_-]/g, "-");
var ChartRoot = ({
  data,
  width,
  height,
  initialWidth = 640,
  responsive = false,
  margin,
  xKey,
  xScale,
  id,
  title,
  description,
  labelledBy,
  describedBy,
  role = "img",
  children,
  class: className,
  style,
  tabIndex,
  onKeyDown,
  onPointerMove,
  onPointerLeave,
  overlay,
  emptyState = defaultEmptyState
}) => {
  const generatedId = useId();
  const rootId = id ?? `kamod-chart-${normalizeIdPart(generatedId)}`;
  const normalizedMargin = useMemo(() => normalizeMargin(margin), [margin]);
  return /* @__PURE__ */ jsx(
    ResponsiveContainer,
    {
      width,
      initialWidth,
      responsive,
      class: responsive ? "kamod-chart-responsive" : void 0,
      children: ({ width: resolvedWidth }) => {
        const size = resolveChartSize({
          width: resolvedWidth,
          height,
          initialWidth,
          responsive: false
        });
        const plotArea = calculatePlotArea(size, normalizedMargin);
        const context = {
          data,
          ids: {
            root: rootId,
            title: `${rootId}-title`,
            description: `${rootId}-description`
          },
          margin: normalizedMargin,
          size,
          plotArea,
          isEmpty: data.length === 0,
          xKey,
          xScale
        };
        return /* @__PURE__ */ jsxs(ChartProvider, { value: context, children: [
          /* @__PURE__ */ jsx(
            ChartSurface,
            {
              id: rootId,
              title,
              description,
              labelledBy: labelledBy ?? (title ? context.ids.title : void 0),
              describedBy: describedBy ?? (description ? context.ids.description : void 0),
              role,
              width: size.width,
              height: size.height,
              class: className,
              style,
              tabIndex,
              onKeyDown,
              onPointerMove,
              onPointerLeave,
              children: /* @__PURE__ */ jsx("g", { "data-kamod-chart-plot": "", transform: `translate(${plotArea.x} ${plotArea.y})`, children: context.isEmpty ? emptyState : children })
            }
          ),
          overlay
        ] });
      }
    }
  );
};
var Chart = ChartRoot;
var PlotArea = ({ children, class: className }) => {
  const { plotArea } = useChartContext();
  return /* @__PURE__ */ jsx(
    "g",
    {
      class: className,
      "data-kamod-chart-plot": "",
      transform: `translate(${plotArea.x} ${plotArea.y})`,
      children
    }
  );
};

export { Chart, ChartProvider, ChartRoot, ChartSurface, PlotArea, ResponsiveContainer, calculatePlotArea, clampDimension, defaultChartMargin, defaultEmptyState, normalizeAccessor, normalizeMargin, readAccessor, resolveChartSize, useChartContext };
//# sourceMappingURL=chunk-B4X27YLI.js.map
//# sourceMappingURL=chunk-B4X27YLI.js.map