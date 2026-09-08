import { AreaChart } from "@kamod-ch/charts/area";
import {
  chartColors,
  halfYearMetrics,
  monthlyMetrics,
  projectedRevenueMetrics,
} from "../../data/datasets";
import { ExampleFrame } from "../shared/ExampleFrame";
import type { JSX } from "preact";

const sharedFrame = {
  height: 220,
  initialWidth: 640,
  responsive: true as const,
  showGrid: true,
};

export function AreaHeroDemo(): JSX.Element {
  return (
    <AreaChart
      data={monthlyMetrics}
      xKey="month"
      xScale="point"
      series={[{ key: "revenue", label: "Revenue", color: chartColors.primary }]}
      height={320}
      initialWidth={760}
      responsive
      showGrid
      outline
      opacity={0.25}
      curve="monotoneX"
      tooltip
      title="Revenue area"
      description="Smooth filled area chart for monthly revenue using curve monotoneX."
    />
  );
}

export function AreaExamples(): JSX.Element {
  return (
    <div class="space-y-6">
      <ExampleFrame
        id="basic-smooth"
        title="Basic smooth"
        description='Use curve="monotoneX" for a smooth trend line. Kamod keeps linear as the default curve so dashboards stay predictable unless you opt into smoothing.'
        badges={["monotoneX", "Responsive"]}
        preview={
          <AreaChart
            {...sharedFrame}
            data={halfYearMetrics}
            xKey="month"
            xScale="point"
            series={[{ key: "revenue", label: "Revenue", color: chartColors.primary }]}
            curve="monotoneX"
            opacity={0.28}
            outline
            tooltip
            title="Smooth revenue trend"
            description="Monthly revenue with a monotoneX area curve."
          />
        }
        code={`import { AreaChart } from "@kamod-ch/charts/area";

<AreaChart
  data={data}
  xKey="month"
  xScale="point"
  series={[{ key: "revenue", label: "Revenue", color: "var(--chart-1)" }]}
  height={220}
  initialWidth={640}
  responsive
  showGrid
  curve="monotoneX"
  opacity={0.28}
  outline
  tooltip
  title="Smooth revenue trend"
  description="Monthly revenue with a monotoneX area curve."
/>`}
      />

      <ExampleFrame
        id="multi-series"
        title="Multi-series"
        description="Compare related metrics side by side. Enable showLegend so readers can toggle series without a separate markers API."
        badges={["Legend", "Axis tooltip"]}
        preview={
          <AreaChart
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
            opacity={0.22}
            outline
            title="Revenue vs costs"
            description="Two overlapping area series with legend toggles."
          />
        }
        code={`import { AreaChart } from "@kamod-ch/charts/area";

<AreaChart
  data={data}
  xKey="month"
  xScale="point"
  series={[
    { key: "revenue", label: "Revenue", color: "var(--chart-1)" },
    { key: "costs", label: "Costs", color: "var(--chart-2)" },
  ]}
  height={220}
  initialWidth={640}
  responsive
  showGrid
  showLegend
  tooltip
  outline
  title="Revenue vs costs"
  description="Two overlapping area series with legend toggles."
/>`}
      />

      <ExampleFrame
        id="stacked"
        title="Stacked"
        description="Stack series on a shared baseline. Axis tooltips report each series' raw value, not cumulative y0/y1 stack coordinates."
        badges={["Stacked", "Raw tooltip values"]}
        preview={
          <AreaChart
            {...sharedFrame}
            data={halfYearMetrics}
            xKey="month"
            xScale="point"
            series={[
              { key: "revenue", label: "Revenue", color: chartColors.primary },
              { key: "costs", label: "Costs", color: chartColors.secondary },
            ]}
            stacked
            showLegend
            tooltip
            outline
            title="Stacked revenue and costs"
            description="Stacked areas; tooltips show original series values."
          />
        }
        code={`import { AreaChart } from "@kamod-ch/charts/area";

<AreaChart
  data={data}
  xKey="month"
  xScale="point"
  series={[
    { key: "revenue", label: "Revenue", color: "var(--chart-1)" },
    { key: "costs", label: "Costs", color: "var(--chart-2)" },
  ]}
  stacked
  showLegend
  tooltip
  outline
  title="Stacked revenue and costs"
  description="Stacked areas; tooltips show original series values."
/>`}
      />

      <ExampleFrame
        id="gradient-fill"
        title="Gradient fill"
        description="Gradients use CSS chart tokens as stop-color, so they adapt to light and dark themes without canvas color conversion."
        badges={["Gradient", "Theme tokens"]}
        preview={
          <AreaChart
            {...sharedFrame}
            data={monthlyMetrics.slice(0, 8)}
            xKey="month"
            xScale="point"
            series={[{ key: "revenue", label: "Revenue", color: chartColors.primary }]}
            fill={{ type: "gradient", direction: "top-to-bottom", fromOpacity: 0.45, toOpacity: 0 }}
            tooltip
            title="Gradient revenue area"
            description="Vertical gradient fade using theme chart colors."
          />
        }
        code={`import { AreaChart } from "@kamod-ch/charts/area";

<AreaChart
  data={data}
  xKey="month"
  xScale="point"
  series={[{ key: "revenue", label: "Revenue", color: "var(--chart-1)" }]}
  fill={{
    type: "gradient",
    direction: "top-to-bottom",
    fromOpacity: 0.45,
    toOpacity: 0,
  }}
  tooltip
  title="Gradient revenue area"
  description="Vertical gradient fade using theme chart colors."
/>`}
      />

      <ExampleFrame
        id="stepped"
        title="Stepped"
        description='Use curve="stepAfter" for step-end transitions. Kamod stepBefore and stepAfter map to step-start and step-end conventions in other chart libraries.'
        badges={["stepAfter"]}
        preview={
          <AreaChart
            {...sharedFrame}
            data={halfYearMetrics}
            xKey="month"
            xScale="point"
            series={[{ key: "customers", label: "Customers", color: chartColors.tertiary }]}
            curve="stepAfter"
            opacity={0.3}
            outline
            tooltip
            title="Stepped customer growth"
            description="Area with stepAfter interpolation."
          />
        }
        code={`import { AreaChart } from "@kamod-ch/charts/area";

<AreaChart
  data={data}
  xKey="month"
  xScale="point"
  series={[{ key: "customers", label: "Customers", color: "var(--chart-3)" }]}
  curve="stepAfter"
  outline
  tooltip
  title="Stepped customer growth"
  description="Area with stepAfter interpolation."
/>`}
      />

      <ExampleFrame
        id="linear-multi"
        title="Linear multi"
        description="Multiple series with the default linear curve—useful when you want straight segments between points without opting into smoothing."
        preview={
          <AreaChart
            {...sharedFrame}
            data={halfYearMetrics}
            xKey="month"
            xScale="point"
            series={[
              { key: "revenue", label: "Revenue", color: chartColors.primary },
              { key: "costs", label: "Costs", color: chartColors.secondary },
            ]}
            curve="linear"
            opacity={0.18}
            outline
            tooltip
            title="Linear multi-series area"
            description="Two series rendered with the default linear curve."
          />
        }
        code={`import { AreaChart } from "@kamod-ch/charts/area";

<AreaChart
  data={data}
  xKey="month"
  xScale="point"
  series={[
    { key: "revenue", label: "Revenue", color: "var(--chart-1)" },
    { key: "costs", label: "Costs", color: "var(--chart-2)" },
  ]}
  curve="linear"
  outline
  tooltip
  title="Linear multi-series area"
  description="Two series rendered with the default linear curve."
/>`}
      />

      <ExampleFrame
        id="markers-on"
        title="Markers on"
        description="Set showPoints to render markers on finite values. Markers highlight data points visually; keyboard focus stays on the chart surface, not each dot."
        badges={["showPoints", "Keyboard"]}
        preview={
          <AreaChart
            {...sharedFrame}
            data={halfYearMetrics}
            xKey="month"
            xScale="point"
            series={[{ key: "revenue", label: "Revenue", color: chartColors.primary }]}
            showPoints
            pointRadius={3.5}
            opacity={0.2}
            outline
            tooltip
            title="Revenue with markers"
            description="Area series with visible point markers."
          />
        }
        code={`import { AreaChart } from "@kamod-ch/charts/area";

<AreaChart
  data={data}
  xKey="month"
  xScale="point"
  series={[{ key: "revenue", label: "Revenue", color: "var(--chart-1)" }]}
  showPoints
  pointRadius={3.5}
  outline
  tooltip
  title="Revenue with markers"
  description="Area series with visible point markers."
/>`}
      />

      <ExampleFrame
        id="dashed-forecast"
        title="Dashed forecast"
        description="Combine outline with strokeDasharray for projected periods. Kamod exposes typed props—no option:any configuration objects."
        badges={["Forecast", "strokeDasharray"]}
        preview={
          <AreaChart
            {...sharedFrame}
            data={projectedRevenueMetrics}
            xKey="month"
            xScale="point"
            series={[{ key: "revenue", label: "Projected revenue", color: chartColors.secondary }]}
            curve="monotoneX"
            opacity={0.15}
            outline
            strokeWidth={2}
            strokeDasharray="8 5"
            tooltip
            title="Forecast revenue"
            description="Projected revenue with a dashed outline."
          />
        }
        code={`import { AreaChart } from "@kamod-ch/charts/area";

<AreaChart
  data={data}
  xKey="month"
  xScale="point"
  series={[{ key: "revenue", label: "Projected revenue", color: "var(--chart-2)" }]}
  curve="monotoneX"
  outline
  strokeWidth={2}
  strokeDasharray="8 5"
  tooltip
  title="Forecast revenue"
  description="Projected revenue with a dashed outline."
/>`}
      />
    </div>
  );
}
