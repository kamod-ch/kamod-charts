import { PieChart } from "@kamod-ch/charts/pie";
import type { PieSliceContext } from "@kamod-ch/charts";
import { chartColors, trafficSources } from "../../data/datasets";
import { formatNumber, formatPercent } from "../../data/formatters";
import {
  carrierCapacityMix,
  carrierCapacityTotal,
  denseChannelMix,
  regionalParcelVolumes,
} from "../../data/pie-datasets";
import { AccessibilityNotes, ResponsivePreview } from "../shared/AccessibilityNotes";
import { ExampleFrame } from "../shared/ExampleFrame";
import type { JSX } from "preact";

const palette = [
  chartColors.primary,
  chartColors.secondary,
  chartColors.tertiary,
  chartColors.quaternary,
];

const sharedFrame = {
  height: 260,
  initialWidth: 560,
  responsive: true as const,
};

const compactFrame = {
  height: 240,
  initialWidth: 520,
  responsive: true as const,
};

const parcelFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatSliceValue(
  value: number,
  _context: PieSliceContext<{ name: string; value: number }>,
) {
  return `${parcelFormatter.format(value)} parcels`;
}

function formatSlicePercent(percentage: number) {
  return formatPercent(percentage);
}

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
      showLegend
      tooltip
      title="Traffic sources"
      description="Share of visits by acquisition channel with legend toggles and slice tooltips."
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
        title="Basic pie with legend and tooltip"
        description="Inside labels, an interactive legend, and tooltips that show raw value plus share of visible slices. Percentages update when legend items hide segments."
        badges={["showLegend", "tooltip", "Intl"]}
        preview={
          <PieChart
            {...compactFrame}
            data={trafficSources}
            valueKey="value"
            labelKey="name"
            colors={palette}
            showLegend
            tooltip={{
              formatValue: formatSliceValue,
              formatPercentage: formatSlicePercent,
            }}
            title="Regional parcel share"
            description="Legend toggles and tooltips use Intl.NumberFormat for values and percents."
          />
        }
        code={`import { PieChart } from "@kamod-ch/charts/pie";

const valueFmt = new Intl.NumberFormat("en-US", { notation: "compact" });
const pctFmt = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 });

<PieChart
  data={rows}
  valueKey="value"
  labelKey="name"
  showLegend
  tooltip={{
    formatValue: (value) => \`\${valueFmt.format(value)} parcels\`,
    formatPercentage: (pct) => pctFmt.format(pct / 100),
  }}
  title="Regional parcel share"
  description="Legend toggles and tooltips use Intl.NumberFormat."
/>`}
      />

      <ExampleFrame
        id="donut"
        title="Donut via innerRadius"
        description="Set innerRadius to open the hole — there is no separate donut prop. Outside labels leave gutter space automatically."
        badges={["innerRadius", "labels"]}
        preview={
          <PieChart
            {...compactFrame}
            data={trafficSources}
            valueKey="value"
            labelKey="name"
            colors={palette}
            innerRadius={56}
            labels="outside"
            title="Acquisition mix"
            description="Donut layout using innerRadius with outside category labels."
          />
        }
        code={`import { PieChart } from "@kamod-ch/charts/pie";

<PieChart
  data={rows}
  valueKey="value"
  labelKey="name"
  innerRadius={56}
  labels="outside"
  title="Acquisition mix"
  description="Donut layout using innerRadius."
/>`}
      />

      <ExampleFrame
        id="center-kpi"
        title="Donut with center KPI"
        description="centerContent renders Preact children in the hole — useful for totals, units, or status text without extra SVG markup."
        badges={["centerContent", "innerRadius"]}
        preview={
          <PieChart
            {...compactFrame}
            data={trafficSources}
            valueKey="value"
            labelKey="name"
            colors={palette}
            innerRadius={68}
            labels="none"
            showLegend
            tooltip
            title="Visit mix with total"
            description="Center KPI summarizes the whole while legend and tooltip carry per-channel detail."
            centerContent={
              <div class="text-center">
                <div class="text-xs text-muted-foreground">Total visits</div>
                <div class="text-xl font-semibold text-foreground">
                  {formatNumber(trafficSources.reduce((s, r) => s + r.value, 0))}k
                </div>
              </div>
            }
          />
        }
        code={`import { PieChart } from "@kamod-ch/charts/pie";

<PieChart
  data={rows}
  valueKey="value"
  labelKey="name"
  innerRadius={68}
  labels="none"
  showLegend
  tooltip
  centerContent={
    <div class="text-center">
      <div>Total visits</div>
      <div>{totalLabel}</div>
    </div>
  }
  title="Visit mix with total"
  description="Center KPI summarizes the whole."
/>`}
      />

      <ExampleFrame
        id="rose"
        title="Rose (Nightingale) chart"
        description="Equal slice angles with value mapped to radius. Default sqrt scaling keeps small regions visible; angle no longer encodes magnitude."
        badges={["rose", "sqrt"]}
        preview={
          <PieChart
            {...sharedFrame}
            data={regionalParcelVolumes}
            valueKey="value"
            labelKey="name"
            colors={palette}
            rose
            labels="outside"
            tooltip
            title="Regional parcel volumes"
            description="Rose layout: equal angles, sqrt-scaled radii. Compare category size by radius, not arc width."
          />
        }
        code={`import { PieChart } from "@kamod-ch/charts/pie";

<PieChart
  data={regions}
  valueKey="value"
  labelKey="name"
  rose
  labels="outside"
  tooltip
  title="Regional parcel volumes"
  description="Equal angles; sqrt maps value to radius."
/>

// Explicit options:
// rose={{ scale: "sqrt", minRadius: 48 }}`}
      />

      <ExampleFrame
        id="outside-labels"
        title="Outside labels with leader lines"
        description="Leader lines connect slices to gutter labels. collision: shift nudges overlapping labels vertically; narrow slices respect minAngle."
        badges={["labels", "collision", "leader lines"]}
        preview={
          <ResponsivePreview label="Resize horizontally — gutter labels shift to avoid overlap.">
            <PieChart
              {...sharedFrame}
              data={denseChannelMix}
              valueKey="value"
              labelKey="name"
              colors={[...palette, chartColors.primary, chartColors.secondary]}
              labels={{
                position: "outside",
                collision: "shift",
                line: { length: 14, horizontalLength: 18 },
              }}
              title="Dense channel mix"
              description="Outside labels with collision shift and configurable leader lines."
            />
          </ResponsivePreview>
        }
        code={`import { PieChart } from "@kamod-ch/charts/pie";

<PieChart
  data={channels}
  valueKey="value"
  labelKey="name"
  labels={{
    position: "outside",
    collision: "shift",
    line: { length: 14, horizontalLength: 18 },
  }}
  title="Dense channel mix"
  description="Leader lines and collision shift for readable gutters."
/>`}
      />

      <ExampleFrame
        id="carrier-capacity"
        title="Carrier capacity donut"
        description="Operational snapshot: allocated lanes versus remaining headroom. Pair color with labels and a center KPI so utilization is readable without hue alone."
        badges={["centerContent", "tooltip", "domain"]}
        preview={
          <PieChart
            height={280}
            initialWidth={560}
            responsive
            data={carrierCapacityMix}
            valueKey="parcels"
            labelKey="lane"
            colors={[chartColors.primary, chartColors.tertiary, chartColors.secondary]}
            innerRadius={72}
            labels="outside"
            showLegend
            tooltip={{
              formatValue: (value) => `${formatNumber(value)} parcels`,
              formatPercentage: formatSlicePercent,
            }}
            title="Hub capacity this week"
            description="Allocated, available, and maintenance hold parcels across the network hub."
            centerContent={
              <div class="text-center">
                <div class="text-xs text-muted-foreground">Utilized</div>
                <div class="text-xl font-semibold text-foreground">
                  {formatPercent(
                    Math.round((carrierCapacityMix[0].parcels / carrierCapacityTotal) * 1000) / 10,
                  )}
                </div>
                <div class="text-xs text-muted-foreground">
                  of {formatNumber(carrierCapacityTotal)}
                </div>
              </div>
            }
          />
        }
        code={`import { PieChart } from "@kamod-ch/charts/pie";

<PieChart
  data={capacityRows}
  valueKey="parcels"
  labelKey="lane"
  innerRadius={72}
  labels="outside"
  showLegend
  tooltip
  centerContent={<CapacityKpi utilized={0.79} total={9820} />}
  title="Hub capacity this week"
  description="Allocated, available, and maintenance hold parcels."
/>`}
      />

      <AccessibilityNotes
        title="Keyboard and screen reader behavior"
        items={[
          "Focus the chart SVG and use Arrow keys to move between visible slices; Home and End jump to the first and last slice.",
          "Enter or Space activates the focused slice; Escape clears the active slice without moving focus.",
          "Tooltips follow pointer hover; keyboard selection announces value and percentage through a live region.",
          "Legend buttons toggle visibility without adding extra tab stops inside the SVG.",
          "Prefer title and description text that states the metric and unit — do not rely on slice color alone.",
        ]}
      />
    </div>
  );
}
