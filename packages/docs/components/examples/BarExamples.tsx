import { BarChart } from "@kamod-ch/charts/bar";
import { chartColors, weeklyDeployments } from "../../data/datasets";
import { formatNumber } from "../../data/formatters";
import { ExampleFrame } from "../shared/ExampleFrame";
import type { JSX } from "preact";

export function BarHeroDemo(): JSX.Element {
  return (
    <BarChart
      data={weeklyDeployments}
      xKey="day"
      series={[
        { key: "deploys", label: "Deploys", color: chartColors.primary },
        { key: "failures", label: "Failures", color: chartColors.secondary },
      ]}
      height={320}
      initialWidth={760}
      responsive
      showGrid
      showLegend
      tooltip
      radius={4}
      title="Weekly deployments"
      description="Deploy volume and failures by weekday."
    />
  );
}

export function BarExamples(): JSX.Element {
  return (
    <div class="space-y-6">
      <ExampleFrame
        id="basic"
        title="Basic"
        description="Compare categorical values with vertical bars."
        preview={
          <BarChart
            data={weeklyDeployments}
            xKey="day"
            series={[{ key: "deploys", label: "Deploys", color: chartColors.primary }]}
            height={200}
            initialWidth={520}
            responsive
            showGrid
            radius={4}
            title="Weekly deploys"
          />
        }
        code={`import { BarChart } from "@kamod-ch/charts/bar";

<BarChart
  data={data}
  xKey="day"
  series={[{ key: "deploys", label: "Deploys", color: "var(--chart-1)" }]}
  height={200}
  responsive
  showGrid
  radius={4}
/>`}
      />
      <ExampleFrame
        id="grouped"
        title="Grouped"
        description="Place related series side by side."
        preview={
          <BarChart
            data={weeklyDeployments}
            xKey="day"
            series={[
              { key: "deploys", label: "Deploys", color: chartColors.primary },
              { key: "failures", label: "Failures", color: chartColors.secondary },
            ]}
            height={200}
            initialWidth={520}
            responsive
            showGrid
            showLegend
            tooltip
            grouped
            radius={4}
            title="Deploys vs failures"
          />
        }
        code={`<BarChart grouped showLegend tooltip ... />`}
      />
      <ExampleFrame
        id="stacked"
        title="Stacked"
        description="Stack series to emphasize composition. Tooltips use original per-series values, not stacked totals."
        preview={
          <BarChart
            data={weeklyDeployments}
            xKey="day"
            series={[
              { key: "deploys", label: "Deploys", color: chartColors.primary },
              { key: "failures", label: "Failures", color: chartColors.secondary },
            ]}
            height={200}
            initialWidth={520}
            responsive
            showGrid
            showLegend
            stacked
            tooltip
            radius={4}
            title="Stacked deploys"
          />
        }
        code={`<BarChart stacked showLegend tooltip ... />`}
      />
      <ExampleFrame
        id="formatted"
        title="Grouped tooltip"
        description="Nearest mode selects the exact bar. Formatters receive the same tooltip context as Line and Scatter."
        preview={
          <BarChart
            data={weeklyDeployments}
            xKey="day"
            series={[
              { key: "deploys", label: "Deploys", color: chartColors.primary },
              { key: "failures", label: "Failures", color: chartColors.secondary },
            ]}
            height={200}
            initialWidth={520}
            responsive
            showGrid
            showLegend
            grouped
            radius={4}
            tooltip={
              {
                mode: "nearest",
                formatValue: (value: number | null) => (value == null ? null : formatNumber(value)),
              } as never
            }
            title="Formatted bar tooltip"
          />
        }
        code={`<BarChart
  grouped
  showLegend
  tooltip={{ mode: "nearest", formatValue: (value) => formatNumber(value ?? 0) }}
  ...
/>`}
      />
      <ExampleFrame
        id="horizontal"
        title="Horizontal"
        description="Categories map to the Y axis and values to the X axis. Numeric thresholds use referenceLine.x; category markers use referenceLine.y."
        preview={
          <BarChart
            data={weeklyDeployments}
            xKey="day"
            series={[{ key: "deploys", label: "Deploys", color: chartColors.primary }]}
            height={200}
            initialWidth={520}
            responsive
            showGrid
            orientation="horizontal"
            radius={4}
            referenceLines={[{ x: 40, label: "Target" }]}
            title="Horizontal deploys"
          />
        }
        code={`<BarChart
  orientation="horizontal"
  referenceLines={[{ x: 40, label: "Target" }]}
  ...
/>`}
      />
    </div>
  );
}
