export type PropRow = {
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
};

export const commonCartesianProps: PropRow[] = [
  {
    name: "data",
    type: "readonly TDatum[]",
    description: "Array of row objects rendered by the chart.",
  },
  {
    name: "xKey",
    type: "DataAccessor<TDatum, string | number | Date | null | undefined>",
    description: "Field or accessor for the x axis.",
  },
  {
    name: "xScale",
    type: '"linear" | "time" | "band" | "point"',
    description: "Scale kind for the x axis.",
  },
  {
    name: "height",
    type: "number",
    description: "Chart height in pixels.",
  },
  {
    name: "width",
    type: "number",
    description: "Fixed width. Prefer responsive + initialWidth for fluid layouts.",
  },
  {
    name: "initialWidth",
    type: "number",
    description: "SSR / first-paint width before ResizeObserver measures the container.",
  },
  {
    name: "responsive",
    type: "boolean",
    defaultValue: "false",
    description: "Stretch to the parent container width.",
  },
  {
    name: "title",
    type: "string",
    description: "Accessible chart title rendered into SVG title.",
  },
  {
    name: "description",
    type: "string",
    description: "Accessible description rendered into SVG desc.",
  },
  {
    name: "showGrid",
    type: "boolean",
    description: "Show cartesian grid lines.",
  },
  {
    name: "showLegend",
    type: "boolean",
    description:
      "Show an HTML legend with series toggles. Supported on Line, Scatter, Area, and Bar charts.",
  },
  {
    name: "tooltip",
    type: "boolean | CartesianTooltipOptions<TDatum>",
    description:
      "Enable pointer and keyboard tooltips. `true` uses chart defaults: axis mode for Line and Area, nearest mode for Scatter and Bar. Options may set mode, placement, offset, render, formatValue, and formatLabel. PieChart does not support this prop.",
  },
  {
    name: "series",
    type: "readonly LineSeriesConfig<TDatum>[]",
    description:
      "One or more line series. LineSeriesConfig extends the cartesian config with strokeWidth, strokeDasharray, showPoints, and pointRadius.",
  },
  {
    name: "animate",
    type: "boolean | ChartAnimateOptions",
    description:
      "Optional data animation. No-op on static entries unless a MotionConfig from @kamod-ch/charts/motion is present. Defaults to on for charts imported from that subpath. Options: enabled, duration (seconds), easing, preset, reducedMotion.",
  },
];

export const lineSpecificProps: PropRow[] = [
  {
    name: "stacked",
    type: "boolean",
    defaultValue: "false",
    description: "Stack series on cumulative y1 geometry. Tooltips still report raw series values.",
  },
  {
    name: "curve",
    type: '"linear" | "monotoneX" | "basis" | "step" | "stepBefore" | "stepAfter" | CurveFactory',
    defaultValue: '"linear"',
    description: "Path interpolation for every visible series.",
  },
  {
    name: "connectNulls",
    type: "boolean",
    defaultValue: "false",
    description: "Draw across null / undefined values.",
  },
  {
    name: "strokeWidth",
    type: "number",
    description: "Default line stroke width. Overridden by per-series strokeWidth.",
  },
  {
    name: "strokeDasharray",
    type: "string",
    description:
      'Default SVG dash pattern, e.g. "6 4". Overridden by per-series strokeDasharray. Use explicit patterns instead of a dashed boolean.',
  },
  {
    name: "showPoints",
    type: 'boolean | "auto"',
    defaultValue: '"auto"',
    description: "Render markers on each defined datum (auto hides markers above 500 points).",
  },
  {
    name: "pointRadius",
    type: "number",
    defaultValue: "2.5",
    description: "Default marker radius when showPoints is enabled.",
  },
  {
    name: "referenceLines",
    type: "readonly CartesianReferenceLine<TDatum>[]",
    description:
      "Optional x/y reference markers with label, color, strokeWidth, and strokeDasharray.",
  },
  {
    name: "referenceAreas",
    type: "readonly CartesianReferenceArea<TDatum>[]",
    description: "Vertical x1/x2 or horizontal y1/y2 highlight bands clipped to the plot area.",
  },
  {
    name: "referencePoints",
    type: "readonly CartesianReferencePoint<TDatum>[]",
    description:
      "Explicit x/y event markers with shape, label, and labelPosition. Kamod does not infer peaks.",
  },
];

export const areaSpecificProps: PropRow[] = [
  {
    name: "stacked",
    type: "boolean",
    defaultValue: "false",
    description: "Stack series on a shared baseline.",
  },
  {
    name: "baseline",
    type: "number",
    defaultValue: "0",
    description: "Baseline value for the area fill.",
  },
  {
    name: "opacity",
    type: "number",
    defaultValue: "0.2",
    description: "Fill opacity for solid fills and the default gradient fromOpacity.",
  },
  {
    name: "fill",
    type: '"solid" | AreaGradientFill',
    defaultValue: '"solid"',
    description:
      'Fill style. Use `{ type: "gradient", direction?, fromOpacity?, toOpacity? }` for SVG linear gradients that follow CSS chart tokens in light and dark themes.',
  },
  {
    name: "outline",
    type: "boolean",
    defaultValue: "false",
    description: "Draw a stroke along the area edge. Required for strokeWidth and strokeDasharray.",
  },
  {
    name: "strokeWidth",
    type: "number",
    description: "Outline stroke width in pixels. Only applies when outline is true.",
  },
  {
    name: "strokeDasharray",
    type: "string",
    description:
      'SVG dash pattern for the outline, e.g. "6 4". Kamod uses strokeDasharray instead of a dashed boolean.',
  },
  {
    name: "curve",
    type: '"linear" | "monotoneX" | "basis" | "step" | "stepBefore" | "stepAfter" | CurveFactory',
    defaultValue: '"linear"',
    description:
      "Path interpolation. linear remains the default for predictable dashboards; monotoneX is the smooth curve. stepBefore and stepAfter correspond to step-start and step-end style charts elsewhere.",
  },
  {
    name: "showPoints",
    type: 'boolean | "auto"',
    defaultValue: "false",
    description:
      "Render point markers on defined values. Kamod uses showPoints instead of a separate markers prop. Markers are visual accents, not individual tab stops.",
  },
  {
    name: "pointRadius",
    type: "number",
    defaultValue: "2.5",
    description: "Marker radius in pixels when showPoints is enabled.",
  },
];

export const barSpecificProps: PropRow[] = [
  {
    name: "series",
    type: "readonly BarSeriesConfig<TDatum>[]",
    description:
      "One or more bar series. BarSeriesConfig extends the cartesian config with fill and per-series valueLabels.",
  },
  {
    name: "orientation",
    type: '"vertical" | "horizontal"',
    defaultValue: '"vertical"',
    description:
      "Bar direction. Vertical maps categories to X and values to Y; horizontal swaps those axes.",
  },
  {
    name: "stacked",
    type: "boolean",
    defaultValue: "false",
    description:
      "Stack series into cumulative segments per category. Tooltips and value labels still report raw series values.",
  },
  {
    name: "grouped",
    type: "boolean",
    defaultValue: "true",
    description:
      "Place series side-by-side within each category band when stacked is false. Ignored when stacked is true.",
  },
  {
    name: "radius",
    type: "number",
    defaultValue: "0",
    description: "Corner radius in pixels for bar rectangles.",
  },
  {
    name: "minBarSize",
    type: "number",
    description:
      "Minimum bar thickness along the value axis (width on vertical charts, height on horizontal).",
  },
  {
    name: "maxBarSize",
    type: "number",
    description:
      "Maximum bar thickness along the value axis. Bars stay centered inside the category band; hit-testing and motion share the same capped geometry.",
  },
  {
    name: "valueLabels",
    type: "boolean | BarValueLabelOptions<TDatum>",
    defaultValue: "false",
    description:
      "Chart-level value label defaults. true enables auto placement. Series may override with BarSeriesConfig.valueLabels.",
  },
  {
    name: "referenceLines",
    type: "readonly CartesianReferenceLine<TDatum>[]",
    description:
      "Optional x/y threshold lines. On vertical charts, y is a numeric value and x may be a category string for horizontal orientation.",
  },
  {
    name: "referenceAreas",
    type: "readonly CartesianReferenceArea<TDatum>[]",
    description:
      "Category or value highlight bands rendered behind grid and bars. x1/x2 always refer to categories; y1/y2 refer to values regardless of orientation.",
  },
  {
    name: "onBarClick",
    type: "(datum, seriesId, index, value) => void",
    description:
      "Pointer click handler for a bar. Keyboard users activate the focused bar with Enter on the chart surface.",
  },
];

export const barSeriesConfigProps: PropRow[] = [
  {
    name: "key",
    type: "DataAccessor<TDatum, number | null | undefined>",
    description: "Numeric field or accessor for bar length.",
  },
  {
    name: "id",
    type: "string",
    description:
      "Stable series identifier for legend toggles and onBarClick. Defaults from key when omitted.",
  },
  {
    name: "label",
    type: "string",
    description: "Human-readable name for legend and tooltip rows.",
  },
  {
    name: "color",
    type: "string",
    description:
      "Stable series color for legend swatches and tooltip accents. Does not change when fill varies per datum.",
  },
  {
    name: "hidden",
    type: "boolean",
    defaultValue: "false",
    description: "Hide the series without removing it from the config (legend can re-enable).",
  },
  {
    name: "fill",
    type: "BarFill<TDatum>",
    description:
      "Per-bar fill: a CSS color string or accessor (context) => string | undefined. Falls back to color when omitted.",
  },
  {
    name: "valueLabels",
    type: "boolean | BarValueLabelOptions<TDatum>",
    description: "Per-series value label override. Merged over chart-level valueLabels.",
  },
];

export const barFillTypeProps: PropRow[] = [
  {
    name: "BarFill",
    type: "string | ((context: BarDatumContext<TDatum>) => string | undefined)",
    description:
      "Static token such as var(--chart-1) or a function that receives BarDatumContext and returns a fill color.",
  },
];

export const barDatumContextProps: PropRow[] = [
  {
    name: "datum",
    type: "TDatum",
    description: "The data row for this bar.",
  },
  {
    name: "index",
    type: "number",
    description: "Row index in the data array.",
  },
  {
    name: "value",
    type: "number",
    description: "Resolved numeric value for this bar.",
  },
  {
    name: "valueStart",
    type: "number",
    description: "Stack baseline along the value axis (0 for grouped charts).",
  },
  {
    name: "valueEnd",
    type: "number",
    description: "Stack top along the value axis (value when not stacked).",
  },
  {
    name: "seriesId",
    type: "string",
    description: "Resolved series id passed to fill and label accessors.",
  },
  {
    name: "seriesIndex",
    type: "number",
    description: "Index of the series in the series array.",
  },
  {
    name: "orientation",
    type: '"vertical" | "horizontal"',
    description: "Chart orientation at render time.",
  },
  {
    name: "stacked",
    type: "boolean",
    description: "Whether the chart is in stacked mode.",
  },
  {
    name: "active",
    type: "boolean",
    description: "True when the bar is pointer- or keyboard-selected.",
  },
];

export const barValueLabelOptionsProps: PropRow[] = [
  {
    name: "position",
    type: '"auto" | "inside" | "outside" | "center"',
    defaultValue: '"auto"',
    description:
      "Label placement. auto centers inner stack segments and places the outer segment outside. outside sits beyond the bar along the value axis; inside tucks into the bar end; center uses the bar midpoint.",
  },
  {
    name: "format",
    type: "(value, context: BarValueLabelContext<TDatum>) => ComponentChildren",
    description:
      "Custom label content. Return null to suppress a label for that bar. BarValueLabelContext extends BarDatumContext with defaultLabel.",
  },
  {
    name: "color",
    type: "string",
    description: "SVG fill color for label text.",
  },
  {
    name: "class",
    type: "string",
    description: "Optional class applied to the label text element.",
  },
  {
    name: "offset",
    type: "number",
    defaultValue: "4",
    description: "Pixel gap between the bar edge and an outside or inside label.",
  },
];

export const barReferenceAreaProps: PropRow[] = [
  {
    name: "id",
    type: "string",
    description: "Optional stable id for the area element.",
  },
  {
    name: "x1",
    type: "string | number | Date",
    description: "Start category (band scale) for a vertical category band.",
  },
  {
    name: "x2",
    type: "string | number | Date",
    description: "End category for the band. Same category as x1 highlights one band.",
  },
  {
    name: "y1",
    type: "number | Date | string",
    description: "Lower value bound when highlighting a value range.",
  },
  {
    name: "y2",
    type: "number | Date | string",
    description: "Upper value bound for value-range highlights.",
  },
  {
    name: "label",
    type: "string",
    description: "Decorative label (aria-hidden). Not a tab stop.",
  },
  {
    name: "fill",
    type: "string",
    description: "Fill color. Prefer var(--chart-reference-area) for theme-aware bands.",
  },
  {
    name: "fillOpacity",
    type: "number",
    description: "Opacity multiplier for the fill color.",
  },
];

export const barCartesianProps: PropRow[] = commonCartesianProps.filter(
  (row) => row.name !== "series",
);

export const pieSpecificProps: PropRow[] = [
  {
    name: "valueKey",
    type: "DataAccessor<TDatum, number | null | undefined>",
    description: "Numeric value for each slice.",
  },
  {
    name: "labelKey",
    type: "DataAccessor<TDatum, string | number | null | undefined>",
    description: "Label accessor for slices.",
  },
  {
    name: "innerRadius",
    type: "number",
    defaultValue: "0",
    description: "Inner radius for donut charts.",
  },
  {
    name: "outerRadius",
    type: "number",
    description: "Outer radius. Defaults to available plot size.",
  },
  {
    name: "labels",
    type: '"none" | "inside" | "outside"',
    defaultValue: '"inside"',
    description: "Slice label placement.",
  },
  {
    name: "colors",
    type: "readonly string[]",
    description: "Explicit palette for slices.",
  },
  {
    name: "centerContent",
    type: "ComponentChildren",
    description: "Content rendered in the donut hole.",
  },
  {
    name: "animate",
    type: "boolean | ChartAnimateOptions",
    description:
      "Optional data animation. No-op on the static pie entry unless MotionConfig is present.",
  },
];

export const scatterSpecificProps: PropRow[] = [
  {
    name: "pointSize",
    type: "number | ((datum, index) => number)",
    defaultValue: "4",
    description: "Marker radius in pixels.",
  },
  {
    name: "referenceLines",
    type: "readonly CartesianReferenceLine<TDatum>[]",
    description: "Optional x/y reference markers.",
  },
];
