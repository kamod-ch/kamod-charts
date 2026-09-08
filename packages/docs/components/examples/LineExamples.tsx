import { LineChart } from "@kamod-ch/charts/line";
import { chartColors, halfYearMetrics } from "../../data/datasets";
import {
  actualVsForecast,
  channelStackMetrics,
  launchWindow,
  releaseTimeline,
  throughputMetrics,
} from "../../data/line-datasets";
import { ExampleFrame } from "../shared/ExampleFrame";
import type { JSX } from "preact";

const sharedFrame = {
  height: 220,
  initialWidth: 640,
  responsive: true as const,
  showGrid: true,
};

export function LineHeroDemo(): JSX.Element {
  return (
    <LineChart
      data={halfYearMetrics}
      xKey="month"
      xScale="point"
      series={[
        { key: "revenue", label: "Revenue", color: chartColors.primary },
        { key: "costs", label: "Costs", color: chartColors.secondary },
      ]}
      height={320}
      initialWidth={760}
      responsive
      showGrid
      showLegend
      tooltip
      curve="monotoneX"
      title="Revenue vs costs"
      description="First-half revenue and operating costs for 2024."
    />
  );
}

export function LineExamples(): JSX.Element {
  return (
    <div class="space-y-6">
      <ExampleFrame
        id="basic-line"
        title="Basic line"
        description="A single responsive series with grid, tooltip, and accessible title. This is the starting point for most dashboards."
        badges={["Responsive", "Tooltip"]}
        preview={
          <LineChart
            {...sharedFrame}
            data={halfYearMetrics}
            xKey="month"
            xScale="point"
            series={[{ key: "revenue", label: "Revenue", color: chartColors.primary }]}
            tooltip
            title="Monthly revenue"
            description="First-half revenue trend with keyboard-accessible tooltips."
          />
        }
        code={`import { LineChart } from "@kamod-ch/charts/line";

<LineChart
  data={data}
  xKey="month"
  xScale="point"
  series={[{ key: "revenue", label: "Revenue", color: "var(--chart-1)" }]}
  height={220}
  initialWidth={640}
  responsive
  showGrid
  tooltip
  title="Monthly revenue"
  description="First-half revenue trend with keyboard-accessible tooltips."
/>`}
      />

      <ExampleFrame
        id="multi-legend"
        title="Multiple series with legend"
        description="Compare related metrics and let readers toggle series from the HTML legend without losing keyboard focus on the chart surface."
        badges={["showLegend", "monotoneX"]}
        preview={
          <LineChart
            {...sharedFrame}
            data={halfYearMetrics}
            xKey="month"
            xScale="point"
            series={[
              { key: "revenue", label: "Revenue", color: chartColors.primary },
              { key: "costs", label: "Costs", color: chartColors.secondary },
            ]}
            showLegend
            tooltip
            curve="monotoneX"
            title="Revenue vs costs"
            description="Two series with legend toggles and a smooth monotone curve."
          />
        }
        code={`import { LineChart } from "@kamod-ch/charts/line";

<LineChart
  data={data}
  xKey="month"
  xScale="point"
  series={[
    { key: "revenue", label: "Revenue", color: "var(--chart-1)" },
    { key: "costs", label: "Costs", color: "var(--chart-2)" },
  ]}
  showLegend
  tooltip
  curve="monotoneX"
  title="Revenue vs costs"
  description="Two series with legend toggles and a smooth monotone curve."
/>`}
      />

      <ExampleFrame
        id="smooth-no-points"
        title="Smooth line without points"
        description='Use curve="monotoneX" for a smooth trend and showPoints={false} when markers would clutter dense data.'
        badges={["monotoneX", "showPoints={false}"]}
        preview={
          <LineChart
            {...sharedFrame}
            data={halfYearMetrics}
            xKey="month"
            xScale="point"
            series={[{ key: "revenue", label: "Revenue", color: chartColors.primary }]}
            curve="monotoneX"
            showPoints={false}
            tooltip
            title="Smooth revenue curve"
            description="Monotone interpolation with markers disabled."
          />
        }
        code={`import { LineChart } from "@kamod-ch/charts/line";

<LineChart
  data={data}
  xKey="month"
  xScale="point"
  series={[{ key: "revenue", label: "Revenue", color: "var(--chart-1)" }]}
  curve="monotoneX"
  showPoints={false}
  tooltip
  title="Smooth revenue curve"
  description="Monotone interpolation with markers disabled."
/>`}
      />

      <ExampleFrame
        id="actual-forecast-mixed"
        title="Actual solid, forecast dashed"
        description="Style each series through LineSeriesConfig. Per-series strokeDasharray overrides the chart default so actuals stay solid while projections read as provisional."
        badges={["LineSeriesConfig", "strokeDasharray"]}
        preview={
          <LineChart
            {...sharedFrame}
            data={actualVsForecast}
            xKey="month"
            xScale="point"
            series={[
              { key: "actual", label: "Actual", color: chartColors.primary, strokeWidth: 2 },
              {
                key: "forecast",
                label: "Forecast",
                color: chartColors.secondary,
                strokeDasharray: "6 4",
              },
            ]}
            tooltip
            title="Actual vs forecast pipeline"
            description="Solid actuals hand off to a dashed forecast line."
          />
        }
        code={`import { LineChart } from "@kamod-ch/charts/line";

<LineChart
  data={data}
  xKey="month"
  xScale="point"
  series={[
    { key: "actual", label: "Actual", color: "var(--chart-1)", strokeWidth: 2 },
    {
      key: "forecast",
      label: "Forecast",
      color: "var(--chart-2)",
      strokeDasharray: "6 4",
    },
  ]}
  tooltip
  title="Actual vs forecast pipeline"
  description="Solid actuals hand off to a dashed forecast line."
/>`}
      />

      <ExampleFrame
        id="step-line"
        title="Step line"
        description='Use curve="step" for centered step transitions between discrete periods.'
        badges={["step"]}
        preview={
          <LineChart
            {...sharedFrame}
            data={halfYearMetrics}
            xKey="month"
            xScale="point"
            series={[{ key: "customers", label: "Customers", color: chartColors.tertiary }]}
            curve="step"
            showPoints
            tooltip
            title="Stepped customer count"
            description="Customer totals with centered step interpolation."
          />
        }
        code={`import { LineChart } from "@kamod-ch/charts/line";

<LineChart
  data={data}
  xKey="month"
  xScale="point"
  series={[{ key: "customers", label: "Customers", color: "var(--chart-3)" }]}
  curve="step"
  showPoints
  tooltip
  title="Stepped customer count"
  description="Customer totals with centered step interpolation."
/>`}
      />

      <ExampleFrame
        id="peak-and-target"
        title="Peak marker and horizontal target"
        description="Combine referencePoints for explicit events with referenceLines for thresholds. Kamod does not auto-detect peaks — pass coordinates from your analytics layer."
        badges={["referencePoints", "referenceLines"]}
        preview={
          <LineChart
            {...sharedFrame}
            data={halfYearMetrics}
            xKey="month"
            xScale="point"
            series={[{ key: "revenue", label: "Revenue", color: chartColors.primary }]}
            tooltip
            showPoints={false}
            referencePoints={[
              {
                id: "peak",
                x: "May",
                y: 41_600,
                label: "Peak",
                labelPosition: "top",
                size: 5,
              },
            ]}
            referenceLines={[{ y: 38_000, label: "Target", strokeDasharray: "4 4" }]}
            title="Revenue peak with target"
            description="May peak marker and a dashed revenue target line."
          />
        }
        code={`import { LineChart } from "@kamod-ch/charts/line";

<LineChart
  data={data}
  xKey="month"
  xScale="point"
  series={[{ key: "revenue", label: "Revenue", color: "var(--chart-1)" }]}
  referencePoints={[
    { id: "peak", x: "May", y: 41600, label: "Peak", labelPosition: "top", size: 5 },
  ]}
  referenceLines={[{ y: 38000, label: "Target", strokeDasharray: "4 4" }]}
  tooltip
  title="Revenue peak with target"
  description="May peak marker and a dashed revenue target line."
/>`}
      />

      <ExampleFrame
        id="linear-segments"
        title="Linear segments"
        description="linear is the Kamod default — straight segments between points without smoothing or steps."
        badges={["linear"]}
        preview={
          <LineChart
            {...sharedFrame}
            data={halfYearMetrics}
            xKey="month"
            xScale="point"
            series={[
              { key: "revenue", label: "Revenue", color: chartColors.primary },
              { key: "costs", label: "Costs", color: chartColors.secondary },
            ]}
            curve="linear"
            tooltip
            title="Linear segment comparison"
            description="Two series rendered with the default linear curve."
          />
        }
        code={`import { LineChart } from "@kamod-ch/charts/line";

<LineChart
  data={data}
  xKey="month"
  xScale="point"
  series={[
    { key: "revenue", label: "Revenue", color: "var(--chart-1)" },
    { key: "costs", label: "Costs", color: "var(--chart-2)" },
  ]}
  curve="linear"
  tooltip
  title="Linear segment comparison"
  description="Two series rendered with the default linear curve."
/>`}
      />

      <ExampleFrame
        id="step-before"
        title="Step before"
        description='curve="stepBefore" holds the previous value until the next category boundary — useful for inventory or quota resets.'
        badges={["stepBefore"]}
        preview={
          <LineChart
            {...sharedFrame}
            data={halfYearMetrics}
            xKey="month"
            xScale="point"
            series={[{ key: "customers", label: "Customers", color: chartColors.quaternary }]}
            curve="stepBefore"
            showPoints
            tooltip
            title="Step-before customer growth"
            description="Customer totals with stepBefore interpolation."
          />
        }
        code={`import { LineChart } from "@kamod-ch/charts/line";

<LineChart
  data={data}
  xKey="month"
  xScale="point"
  series={[{ key: "customers", label: "Customers", color: "var(--chart-4)" }]}
  curve="stepBefore"
  showPoints
  tooltip
  title="Step-before customer growth"
  description="Customer totals with stepBefore interpolation."
/>`}
      />

      <ExampleFrame
        id="stacked-lines"
        title="Stacked lines"
        description="Set stacked to draw each series on cumulative y1. Tooltips still report raw channel values while markers follow the stacked geometry."
        badges={["stacked", "Raw tooltip values"]}
        preview={
          <LineChart
            {...sharedFrame}
            data={channelStackMetrics}
            xKey="month"
            xScale="point"
            series={[
              { key: "direct", label: "Direct", color: chartColors.primary },
              { key: "partner", label: "Partner", color: chartColors.secondary },
              { key: "marketplace", label: "Marketplace", color: chartColors.tertiary },
            ]}
            stacked
            showLegend
            tooltip
            title="Stacked channel volume"
            description="Three stacked line series; tooltips show each channel's original value."
          />
        }
        code={`import { LineChart } from "@kamod-ch/charts/line";

<LineChart
  data={data}
  xKey="month"
  xScale="point"
  series={[
    { key: "direct", label: "Direct", color: "var(--chart-1)" },
    { key: "partner", label: "Partner", color: "var(--chart-2)" },
    { key: "marketplace", label: "Marketplace", color: "var(--chart-3)" },
  ]}
  stacked
  showLegend
  tooltip
  title="Stacked channel volume"
  description="Three stacked line series; tooltips show each channel's original value."
/>`}
      />

      <ExampleFrame
        id="dashed-forecast-series"
        title="Dashed forecast series"
        description="Apply strokeDasharray on a single forecast series or at chart level. Prefer explicit dash strings over boolean flags."
        badges={["strokeDasharray", "Forecast"]}
        preview={
          <LineChart
            {...sharedFrame}
            data={actualVsForecast.filter((row) => row.forecast != null)}
            xKey="month"
            xScale="point"
            series={[
              {
                key: "forecast",
                label: "Forecast",
                color: chartColors.secondary,
                strokeDasharray: "8 5",
                strokeWidth: 2,
              },
            ]}
            curve="monotoneX"
            showPoints
            tooltip
            title="Forecast-only outlook"
            description="Projected months rendered as a dashed monotone line."
          />
        }
        code={`import { LineChart } from "@kamod-ch/charts/line";

<LineChart
  data={forecastRows}
  xKey="month"
  xScale="point"
  series={[
    {
      key: "forecast",
      label: "Forecast",
      color: "var(--chart-2)",
      strokeDasharray: "8 5",
      strokeWidth: 2,
    },
  ]}
  curve="monotoneX"
  tooltip
  title="Forecast-only outlook"
  description="Projected months rendered as a dashed monotone line."
/>`}
      />

      <ExampleFrame
        id="forecast-peak-window"
        title="Actual vs forecast with peak window"
        description="Highlight a peak interval with referenceAreas while keeping actual and forecast lines on the same chart."
        badges={["referenceAreas", "Actual + forecast"]}
        preview={
          <LineChart
            {...sharedFrame}
            data={actualVsForecast}
            xKey="month"
            xScale="point"
            series={[
              { key: "actual", label: "Actual", color: chartColors.primary },
              {
                key: "forecast",
                label: "Forecast",
                color: chartColors.secondary,
                strokeDasharray: "6 4",
              },
            ]}
            referenceAreas={[
              {
                id: "peak-window",
                x1: "Apr",
                x2: "May",
                label: "Peak interval",
                fillOpacity: 0.25,
              },
            ]}
            tooltip
            title="Pipeline peak window"
            description="Shaded peak period with solid actuals and dashed forecast."
          />
        }
        code={`import { LineChart } from "@kamod-ch/charts/line";

<LineChart
  data={data}
  xKey="month"
  xScale="point"
  series={[
    { key: "actual", label: "Actual", color: "var(--chart-1)" },
    { key: "forecast", label: "Forecast", color: "var(--chart-2)", strokeDasharray: "6 4" },
  ]}
  referenceAreas={[
    { id: "peak-window", x1: "Apr", x2: "May", label: "Peak interval", fillOpacity: 0.25 },
  ]}
  tooltip
  title="Pipeline peak window"
  description="Shaded peak period with solid actuals and dashed forecast."
/>`}
      />

      <ExampleFrame
        id="event-window"
        title="Calendar event window"
        description='Use xScale="time" with Date x values and a vertical reference area to mark launch or maintenance windows on a daily axis.'
        badges={["time scale", "referenceAreas", "Responsive"]}
        preview={
          <LineChart
            {...sharedFrame}
            data={releaseTimeline}
            xKey="date"
            xScale="time"
            series={[{ key: "adoption", label: "Adoption", color: chartColors.primary }]}
            referenceAreas={[
              {
                id: "launch-window",
                x1: launchWindow.start,
                x2: launchWindow.end,
                label: "Launch window",
              },
            ]}
            curve="monotoneX"
            tooltip
            title="Adoption around launch"
            description="Daily adoption with a time-scaled launch highlight band."
          />
        }
        code={`import { LineChart } from "@kamod-ch/charts/line";

<LineChart
  data={dailyAdoption}
  xKey="date"
  xScale="time"
  series={[{ key: "adoption", label: "Adoption", color: "var(--chart-1)" }]}
  referenceAreas={[
    {
      id: "launch-window",
      x1: launchStart,
      x2: launchEnd,
      label: "Launch window",
    },
  ]}
  curve="monotoneX"
  tooltip
  title="Adoption around launch"
  description="Daily adoption with a time-scaled launch highlight band."
/>`}
      />

      <ExampleFrame
        id="capacity-diamonds"
        title="Capacity changes as diamonds"
        description='Mark infrastructure step changes with referencePoints using shape="diamond". Pass explicit x/y coordinates when capacity shifts.'
        badges={["referencePoints", "diamond"]}
        preview={
          <LineChart
            {...sharedFrame}
            data={throughputMetrics}
            xKey="date"
            xScale="time"
            series={[{ key: "throughput", label: "Throughput", color: chartColors.primary }]}
            referencePoints={[
              {
                id: "cap-900",
                x: throughputMetrics[2]!.date,
                y: 900,
                label: "900 cap",
                shape: "diamond",
                labelPosition: "top",
                size: 5,
              },
              {
                id: "cap-1000",
                x: throughputMetrics[5]!.date,
                y: 1_000,
                label: "1k cap",
                shape: "diamond",
                labelPosition: "right",
                size: 5,
              },
            ]}
            referenceLines={[{ y: 900, strokeDasharray: "2 6", strokeWidth: 1 }]}
            tooltip
            title="Throughput vs capacity steps"
            description="Diamond markers annotate discrete capacity increases."
          />
        }
        code={`import { LineChart } from "@kamod-ch/charts/line";

<LineChart
  data={weeklyThroughput}
  xKey="date"
  xScale="time"
  series={[{ key: "throughput", label: "Throughput", color: "var(--chart-1)" }]}
  referencePoints={[
    {
      id: "cap-900",
      x: capacityChangeDate,
      y: 900,
      label: "900 cap",
      shape: "diamond",
      labelPosition: "top",
      size: 5,
    },
  ]}
  referenceLines={[{ y: 900, strokeDasharray: "2 6", strokeWidth: 1 }]}
  tooltip
  title="Throughput vs capacity steps"
  description="Diamond markers annotate discrete capacity increases."
/>`}
      />
    </div>
  );
}
