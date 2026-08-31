import { ScatterChart } from "@kamod-ch/charts/scatter";
import { chartColors, conversionPoints } from "../../data/datasets";
import { ExampleFrame } from "../shared/ExampleFrame";
import type { JSX } from "preact";

export function ScatterHeroDemo(): JSX.Element {
  return (
    <ScatterChart
      data={conversionPoints}
      xKey="visitors"
      xScale="linear"
      series={[{ key: "conversion", label: "Conversion %", color: chartColors.primary }]}
      height={320}
      initialWidth={760}
      responsive
      showGrid
      tooltip
      pointSize={5}
      referenceLines={[{ y: 8.7, label: "Avg 8.7%" }]}
      title="Plan conversion"
      description="Conversion rate against visitor volume."
    />
  );
}

export function ScatterExamples(): JSX.Element {
  return (
    <div class="space-y-6">
      <ExampleFrame
        id="basic"
        title="Basic"
        description="Discover relationships between two numeric fields."
        preview={
          <ScatterChart
            data={conversionPoints}
            xKey="visitors"
            xScale="linear"
            series={[{ key: "conversion", label: "Conversion %", color: chartColors.primary }]}
            height={220}
            initialWidth={520}
            responsive
            showGrid
            tooltip
            title="Conversion scatter"
          />
        }
        code={`import { ScatterChart } from "@kamod-ch/charts/scatter";

<ScatterChart
  data={data}
  xKey="visitors"
  xScale="linear"
  series={[{ key: "conversion", label: "Conversion %", color: "var(--chart-1)" }]}
  height={220}
  responsive
  showGrid
  tooltip
/>`}
      />
      <ExampleFrame
        id="reference"
        title="Reference line"
        description="Annotate an average or threshold."
        preview={
          <ScatterChart
            data={conversionPoints}
            xKey="visitors"
            xScale="linear"
            series={[{ key: "conversion", label: "Conversion %", color: chartColors.primary }]}
            height={220}
            initialWidth={520}
            responsive
            showGrid
            tooltip
            referenceLines={[{ y: 8.7, label: "Avg" }]}
            title="Conversion with average"
          />
        }
        code={`<ScatterChart referenceLines={[{ y: 8.7, label: "Avg" }]} ... />`}
      />
    </div>
  );
}
