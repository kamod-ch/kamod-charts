import { AreaChart } from "@kamod-ch/charts/area";
import { chartColors, halfYearMetrics, monthlyMetrics } from "../../data/datasets";
import { formatCurrency } from "../../data/formatters";
import { ExampleFrame } from "../shared/ExampleFrame";
import type { JSX } from "preact";

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
      showLegend
      tooltip
      title="Revenue area"
      description="Filled area chart for monthly revenue."
    />
  );
}

export function AreaExamples(): JSX.Element {
  return (
    <div class="space-y-6">
      <ExampleFrame
        id="basic"
        title="Basic"
        description="A soft filled area for trend storytelling."
        preview={
          <AreaChart
            data={halfYearMetrics}
            xKey="month"
            xScale="point"
            series={[{ key: "revenue", label: "Revenue", color: chartColors.primary }]}
            height={200}
            initialWidth={520}
            responsive
            showGrid
            outline
            tooltip
            title="Usage area"
          />
        }
        code={`import { AreaChart } from "@kamod-ch/charts/area";

<AreaChart
  data={data}
  xKey="month"
      xScale="point"
  series={[{ key: "revenue", label: "Revenue", color: "var(--chart-1)" }]}
  height={200}
  responsive
  showGrid
  outline
/>`}
      />
      <ExampleFrame
        id="stacked"
        title="Stacked"
        description="Stack multiple series on a shared baseline. Tooltips still report each series' original value, not the cumulative stack."
        preview={
          <AreaChart
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
            stacked
            outline
            showLegend
            tooltip
            title="Stacked revenue and costs"
          />
        }
        code={`<AreaChart stacked showLegend tooltip series={[...]} outline ... />`}
      />
      <ExampleFrame
        id="formatted"
        title="Formatted tooltip"
        description="Pass tooltip options to format labels and values. Area defaults to axis mode, matching LineChart."
        preview={
          <AreaChart
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
            tooltip={
              {
                mode: "axis",
                formatLabel: (value: string | number | Date | null) => String(value ?? ""),
                formatValue: (value: number | null) =>
                  value == null ? null : formatCurrency(value),
              } as never
            }
            outline
            title="Formatted area tooltip"
          />
        }
        code={`<AreaChart
  tooltip={{
    mode: "axis",
    formatValue: (value) => formatCurrency(value ?? 0),
  }}
  showLegend
  ...
/>`}
      />
    </div>
  );
}
