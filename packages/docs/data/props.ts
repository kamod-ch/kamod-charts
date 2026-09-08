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
    type: "readonly CartesianSeriesConfig<TDatum>[]",
    description: "One or more numeric series configurations.",
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
    name: "curve",
    type: '"linear" | "monotoneX" | "basis" | CurveFactory',
    defaultValue: '"linear"',
    description: "Interpolation used for the path.",
  },
  {
    name: "connectNulls",
    type: "boolean",
    defaultValue: "false",
    description: "Draw across null / undefined values.",
  },
  {
    name: "showPoints",
    type: 'boolean | "auto"',
    defaultValue: '"auto"',
    description: "Render markers on each datum.",
  },
  {
    name: "referenceLines",
    type: "readonly CartesianReferenceLine<TDatum>[]",
    description: "Optional x/y reference markers.",
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
    name: "orientation",
    type: '"vertical" | "horizontal"',
    defaultValue: '"vertical"',
    description: "Bar direction.",
  },
  {
    name: "stacked",
    type: "boolean",
    defaultValue: "false",
    description: "Stack bars instead of grouping.",
  },
  {
    name: "grouped",
    type: "boolean",
    defaultValue: "true",
    description: "Place series side-by-side when not stacked.",
  },
  {
    name: "radius",
    type: "number",
    defaultValue: "0",
    description: "Corner radius for bars.",
  },
  {
    name: "valueLabels",
    type: "boolean",
    defaultValue: "false",
    description: "Render numeric labels on bars.",
  },
  {
    name: "onBarClick",
    type: "(datum, seriesId, index, value) => void",
    description: "Pointer click handler for a bar.",
  },
];

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
