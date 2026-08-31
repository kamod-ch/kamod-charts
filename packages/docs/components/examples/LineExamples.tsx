import { LineChart } from "@kamod-ch/charts/line";
import {
  chartColors,
  emptyMetrics,
  halfYearMetrics,
  monthlyMetrics,
  sparseMetrics,
} from "../../data/datasets";
import { ExampleFrame } from "../shared/ExampleFrame";
import type { JSX } from "preact";

const basicCode = `import { LineChart } from "@kamod-ch/charts/line";

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
/>`;

const multiCode = `import { LineChart } from "@kamod-ch/charts/line";

<LineChart
  data={data}
  xKey="month"
      xScale="point"
  series={[
    { key: "revenue", label: "Revenue", color: "var(--chart-1)" },
    { key: "costs", label: "Costs", color: "var(--chart-2)" },
  ]}
  height={280}
  initialWidth={720}
  responsive
  showGrid
  showLegend
  tooltip
  curve="monotoneX"
  title="Revenue vs costs"
/>`;

export function LineHeroDemo(): JSX.Element {
  return (
    <LineChart
      data={monthlyMetrics}
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
      description="Monthly revenue and customer counts for 2024."
    />
  );
}

export function LineExamples(): JSX.Element {
  return (
    <div class="space-y-6">
      <ExampleFrame
        id="basic"
        title="Basic"
        description="A single series with grid and tooltip."
        badges={["Preact native", "Responsive", "Keyboard accessible"]}
        preview={
          <LineChart
            data={halfYearMetrics}
            xKey="month"
            xScale="point"
            series={[{ key: "revenue", label: "Revenue", color: chartColors.primary }]}
            height={200}
            initialWidth={520}
            responsive
            showGrid
            tooltip
            title="Monthly revenue"
          />
        }
        code={basicCode}
      />
      <ExampleFrame
        id="multiple-series"
        title="Multiple series"
        description="Compare related metrics with legend and monotone curve."
        preview={
          <LineChart
            data={halfYearMetrics}
            xKey="month"
            xScale="point"
            series={[
              { key: "revenue", label: "Revenue", color: chartColors.primary },
              { key: "costs", label: "Costs", color: chartColors.secondary },
            ]}
            height={200}
            initialWidth={520}
            responsive
            showGrid
            showLegend
            tooltip
            curve="monotoneX"
            title="Revenue vs costs"
          />
        }
        code={multiCode}
      />
      <ExampleFrame
        id="curves"
        title="Curves"
        description="Use monotoneX for smoother trend lines."
        preview={
          <LineChart
            data={halfYearMetrics}
            xKey="month"
            xScale="point"
            series={[{ key: "revenue", label: "Revenue", color: chartColors.primary }]}
            height={200}
            initialWidth={520}
            responsive
            showGrid
            tooltip
            curve="monotoneX"
            showPoints
            title="Monotone revenue"
          />
        }
        code={`<LineChart curve="monotoneX" showPoints ... />`}
      />
      <ExampleFrame
        id="reference-lines"
        title="Reference lines"
        description="Mark targets with cartesian reference lines."
        preview={
          <LineChart
            data={halfYearMetrics}
            xKey="month"
            xScale="point"
            series={[{ key: "revenue", label: "Revenue", color: chartColors.primary }]}
            height={200}
            initialWidth={520}
            responsive
            showGrid
            tooltip
            referenceLines={[{ y: 40_000, label: "Target" }]}
            title="Revenue with target"
          />
        }
        code={`<LineChart referenceLines={[{ y: 40000, label: "Target" }]} ... />`}
      />
      <ExampleFrame
        id="empty-state"
        title="Empty state"
        description="Missing data renders the default empty surface."
        preview={
          <LineChart
            data={emptyMetrics}
            xKey="month"
            xScale="point"
            series={[{ key: "revenue", label: "Revenue" }]}
            height={200}
            initialWidth={520}
            responsive
            title="No data"
            description="Empty dataset demonstration."
          />
        }
        code={`<LineChart data={[]} ... />`}
      />
      <ExampleFrame
        id="connect-nulls"
        title="Null handling"
        description="Sparse series can keep gaps or connect across nulls."
        preview={
          <LineChart
            data={sparseMetrics}
            xKey="month"
            xScale="point"
            series={[{ key: "costs", label: "Costs", color: chartColors.secondary }]}
            height={200}
            initialWidth={520}
            responsive
            showGrid
            tooltip
            connectNulls
            title="Costs with nulls connected"
          />
        }
        code={`<LineChart connectNulls series={[{ key: "costs" }]} ... />`}
      />
    </div>
  );
}
