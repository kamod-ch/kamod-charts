import { useAxisScale, getTicks, getScalePosition } from './chunk-QJ5EXS2X.js';
import { useChartContext } from './chunk-B4X27YLI.js';
import { jsxs, jsx } from 'preact/jsx-runtime';

var Crosshair = ({
  interaction,
  width,
  height,
  color = "var(--chart-axis)"
}) => {
  if (!interaction) {
    return null;
  }
  return /* @__PURE__ */ jsxs("g", { "data-kamod-chart-crosshair": "", "aria-hidden": "true", children: [
    /* @__PURE__ */ jsx(
      "line",
      {
        x1: interaction.x,
        x2: interaction.x,
        y1: 0,
        y2: height,
        stroke: color,
        "stroke-dasharray": "3 3"
      }
    ),
    /* @__PURE__ */ jsx(
      "line",
      {
        x1: 0,
        x2: width,
        y1: interaction.y,
        y2: interaction.y,
        stroke: color,
        "stroke-dasharray": "3 3"
      }
    )
  ] });
};
var Grid = ({
  xKey,
  yKey,
  xScale = "linear",
  yScale = "linear",
  xDomain,
  yDomain,
  xPadding,
  yPadding,
  xTickCount = 5,
  yTickCount = 5,
  vertical = true,
  horizontal = true,
  class: className
}) => {
  const { plotArea } = useChartContext();
  const xAxisScale = useAxisScale({
    dataKey: xKey,
    scale: xScale,
    domain: xDomain,
    padding: xPadding,
    tickCount: xTickCount,
    orientation: "x"
  });
  const yAxisScale = useAxisScale({
    dataKey: yKey,
    scale: yScale,
    domain: yDomain,
    padding: yPadding,
    tickCount: yTickCount,
    orientation: "y"
  });
  return /* @__PURE__ */ jsxs("g", { class: className, "data-kamod-chart-grid": "", "aria-hidden": "true", children: [
    vertical ? getTicks(xAxisScale, xTickCount).map((tick, index) => {
      const position = getScalePosition(xAxisScale, tick);
      return position == null ? null : /* @__PURE__ */ jsx(
        "line",
        {
          x1: position,
          x2: position,
          y1: 0,
          y2: plotArea.height,
          stroke: "var(--chart-grid)"
        },
        `x-${String(tick)}-${index}`
      );
    }) : null,
    horizontal ? getTicks(yAxisScale, yTickCount).map((tick, index) => {
      const position = getScalePosition(yAxisScale, tick);
      return position == null ? null : /* @__PURE__ */ jsx(
        "line",
        {
          x1: 0,
          x2: plotArea.width,
          y1: position,
          y2: position,
          stroke: "var(--chart-grid)"
        },
        `y-${String(tick)}-${index}`
      );
    }) : null
  ] });
};
var Legend = ({ items, onToggle }) => /* @__PURE__ */ jsx(
  "div",
  {
    "data-kamod-chart-legend": "",
    style: { display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" },
    children: items.map((item) => /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        "data-kamod-chart-legend-item": "",
        "aria-pressed": !item.hidden,
        onClick: onToggle ? () => onToggle(item.id) : void 0,
        style: {
          display: "inline-flex",
          alignItems: "center",
          gap: "0.25rem",
          opacity: item.hidden ? 0.45 : 1,
          background: "transparent",
          border: "0",
          color: "inherit",
          cursor: onToggle ? "pointer" : "default"
        },
        children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              "aria-hidden": "true",
              style: {
                width: "0.75rem",
                height: "0.75rem",
                background: item.color ?? "var(--chart-1)",
                borderRadius: "999px"
              }
            }
          ),
          item.label ?? item.id
        ]
      },
      item.id
    ))
  }
);
var LiveRegion = ({ interaction, format }) => /* @__PURE__ */ jsx(
  "div",
  {
    "data-kamod-chart-live-region": "",
    "aria-live": "polite",
    "aria-atomic": "true",
    style: {
      position: "absolute",
      width: "1px",
      height: "1px",
      overflow: "hidden",
      clipPath: "inset(50%)"
    },
    children: interaction ? format ? format(interaction) : `${interaction.seriesId} ${interaction.index + 1}: ${interaction.value ?? "\u2013"}` : ""
  }
);
var ReferenceLine = ({
  x,
  y,
  xKey,
  yKey,
  xScale,
  yScale = "linear",
  xDomain,
  yDomain,
  xPadding,
  yPadding,
  label,
  color = "var(--chart-reference-line)",
  class: className
}) => {
  const { plotArea } = useChartContext();
  const axisScale = useAxisScale({
    dataKey: x == null ? yKey : xKey,
    scale: x == null ? yScale : xScale,
    domain: x == null ? yDomain : xDomain,
    padding: x == null ? yPadding : xPadding,
    orientation: x == null ? "y" : "x"
  });
  const value = x ?? y;
  const position = value == null ? void 0 : getScalePosition(axisScale, value);
  if (position == null) {
    return null;
  }
  const isVertical = x != null;
  return /* @__PURE__ */ jsxs("g", { class: className, "data-kamod-chart-reference-line": "", children: [
    /* @__PURE__ */ jsx(
      "line",
      {
        x1: isVertical ? position : 0,
        x2: isVertical ? position : plotArea.width,
        y1: isVertical ? 0 : position,
        y2: isVertical ? plotArea.height : position,
        stroke: color,
        "stroke-dasharray": "4 4"
      }
    ),
    label ? /* @__PURE__ */ jsx(
      "text",
      {
        x: isVertical ? position + 6 : plotArea.width,
        y: isVertical ? 12 : position - 6,
        "text-anchor": isVertical ? "start" : "end",
        children: label
      }
    ) : null
  ] });
};
var Tooltip = ({
  interaction,
  visible = Boolean(interaction),
  children
}) => {
  if (!interaction || !visible) {
    return null;
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-kamod-chart-tooltip": "",
      role: "status",
      style: {
        position: "absolute",
        left: `${interaction.x}px`,
        top: `${interaction.y}px`,
        transform: "translate(8px, -100%)",
        pointerEvents: "none",
        background: "var(--chart-tooltip-background)",
        color: "var(--chart-tooltip-foreground)",
        border: "1px solid var(--chart-tooltip-border)",
        borderRadius: "0.375rem",
        padding: "0.375rem 0.5rem",
        fontSize: "0.75rem"
      },
      children: children ? children(interaction) : `${interaction.seriesId}: ${interaction.value ?? "\u2013"}`
    }
  );
};

export { Crosshair, Grid, Legend, LiveRegion, ReferenceLine, Tooltip };
//# sourceMappingURL=chunk-BAOZGZY7.js.map
//# sourceMappingURL=chunk-BAOZGZY7.js.map