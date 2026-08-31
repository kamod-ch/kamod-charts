import { PieChart } from "@kamod-ch/charts/pie";
import { chartColors, longLabelTraffic, trafficSources } from "../../data/datasets";
import { formatNumber } from "../../data/formatters";
import { ExampleFrame } from "../shared/ExampleFrame";
import type { JSX } from "preact";

const palette = [
  chartColors.primary,
  chartColors.secondary,
  chartColors.tertiary,
  chartColors.quaternary,
];

export function PieHeroDemo(): JSX.Element {
  const total = trafficSources.reduce((sum, row) => sum + row.value, 0);
  return (
    <PieChart
      data={trafficSources}
      valueKey="value"
      labelKey="name"
      height={320}
      initialWidth={760}
      responsive
      colors={palette}
      innerRadius={64}
      labels="outside"
      title="Traffic sources"
      description="Share of visits by acquisition channel."
      centerContent={
        <div class="text-center">
          <div class="text-xs text-muted-foreground">Visits</div>
          <div class="text-lg font-semibold text-foreground">{formatNumber(total)}k</div>
        </div>
      }
    />
  );
}

export function PieExamples(): JSX.Element {
  return (
    <div class="space-y-6">
      <ExampleFrame
        id="basic"
        title="Basic"
        description="Parts of a whole with inside labels."
        preview={
          <PieChart
            data={trafficSources}
            valueKey="value"
            labelKey="name"
            height={240}
            initialWidth={520}
            responsive
            colors={palette}
            title="Traffic sources"
          />
        }
        code={`import { PieChart } from "@kamod-ch/charts/pie";

<PieChart
  data={data}
  valueKey="value"
  labelKey="name"
  height={240}
  responsive
  colors={["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"]}
/>`}
      />
      <ExampleFrame
        id="donut"
        title="Donut"
        description="Use innerRadius and centerContent for summaries."
        preview={
          <PieChart
            data={trafficSources}
            valueKey="value"
            labelKey="name"
            height={240}
            initialWidth={520}
            responsive
            colors={palette}
            innerRadius={56}
            labels="outside"
            title="Donut traffic mix"
            centerContent={<span class="text-sm font-semibold">Mix</span>}
          />
        }
        code={`<PieChart innerRadius={56} centerContent={<span>Mix</span>} ... />`}
      />
      <ExampleFrame
        id="long-labels"
        title="Long labels"
        description="Outside labels keep longer category names readable."
        preview={
          <PieChart
            data={longLabelTraffic}
            valueKey="value"
            labelKey="name"
            height={260}
            initialWidth={520}
            responsive
            colors={palette}
            labels="outside"
            title="Channels with long labels"
          />
        }
        code={`<PieChart labels="outside" ... />`}
      />
    </div>
  );
}
