import { BarChart } from "@kamod-ch/charts/bar";
import type { BarDatumContext } from "@kamod-ch/charts";
import { useState } from "preact/hooks";
import {
  acquisitionChannels,
  cashflowLedger,
  productMix,
  shipmentWeeks,
} from "../../data/bar-datasets";
import { chartColors, weeklyDeployments } from "../../data/datasets";
import { formatNumber } from "../../data/formatters";
import { AccessibilityNotes, ResponsivePreview } from "../shared/AccessibilityNotes";
import { ExampleFrame } from "../shared/ExampleFrame";
import type { JSX } from "preact";

const sharedFrame = {
  height: 220,
  initialWidth: 640,
  responsive: true as const,
  showGrid: true,
};

const compactFrame = {
  height: 168,
  initialWidth: 480,
  responsive: true as const,
  showGrid: true,
};

function signedFill(context: BarDatumContext<{ period: string; balance: number }>): string {
  return context.value >= 0 ? "var(--chart-1)" : "var(--chart-3)";
}

function BarSelectionDemo(): JSX.Element {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div class="space-y-3">
      <BarChart
        {...sharedFrame}
        data={productMix}
        xKey="segment"
        series={[
          { key: "units", id: "units", label: "Units shipped", color: chartColors.primary },
          { key: "returns", id: "returns", label: "Returns", color: chartColors.secondary },
        ]}
        grouped
        showLegend
        tooltip
        radius={4}
        title="Product mix by segment"
        description="Grouped bars with legend toggles. Click a bar or focus the chart and press Enter."
        onBarClick={(datum, seriesId, _index, value) => {
          setMessage(`${seriesId} · ${datum.segment}: ${formatNumber(value)} units`);
        }}
      />
      <p class="text-sm text-muted-foreground" aria-live="polite">
        {message ?? "Select a bar with pointer or keyboard (Enter)."}
      </p>
    </div>
  );
}

export function BarHeroDemo(): JSX.Element {
  return (
    <BarChart
      data={shipmentWeeks}
      xKey="week"
      series={[
        { key: "onTime", label: "On time", color: chartColors.primary },
        { key: "late", label: "Late", color: chartColors.secondary },
      ]}
      height={320}
      initialWidth={760}
      responsive
      showGrid
      showLegend
      tooltip
      grouped
      radius={4}
      referenceAreas={[{ x1: "W01", x2: "W02", label: "Peak review", fillOpacity: 0.28 }]}
      title="Carrier performance by week"
      description="Grouped shipment outcomes with an highlighted review window."
    />
  );
}

export function BarExamples(): JSX.Element {
  return (
    <div class="space-y-6">
      <ExampleFrame
        id="sized-vertical"
        title="Sized vertical bars"
        description="Cap bar width with maxBarSize and soften corners with radius. Bars stay centered inside each category band."
        badges={["maxBarSize", "radius", "responsive"]}
        preview={
          <ResponsivePreview label="Drag the container edge — the chart reflows while keeping the 32px bar cap.">
            <BarChart
              {...sharedFrame}
              data={weeklyDeployments}
              xKey="day"
              series={[{ key: "deploys", label: "Deploys", color: chartColors.primary }]}
              maxBarSize={32}
              radius={6}
              title="Daily deploy volume"
              description="Vertical bars limited to 32px width with rounded corners."
            />
          </ResponsivePreview>
        }
        code={`import { BarChart } from "@kamod-ch/charts/bar";

<BarChart
  data={data}
  xKey="day"
  series={[{ key: "deploys", label: "Deploys", color: "var(--chart-1)" }]}
  maxBarSize={32}
  radius={6}
  responsive
  showGrid
  title="Daily deploy volume"
  description="Vertical bars limited to 32px width with rounded corners."
/>`}
      />

      <ExampleFrame
        id="horizontal-long-labels"
        title="Horizontal bars with long labels"
        description="Categories map to the Y axis on horizontal charts — useful when labels need more room than a vertical band allows."
        badges={["orientation", "horizontal"]}
        preview={
          <BarChart
            {...sharedFrame}
            data={acquisitionChannels}
            xKey="channel"
            series={[{ key: "signups", label: "Signups", color: chartColors.primary }]}
            orientation="horizontal"
            radius={4}
            title="Acquisition channels"
            description="Horizontal layout keeps lengthy category names readable."
          />
        }
        code={`import { BarChart } from "@kamod-ch/charts/bar";

<BarChart
  data={channels}
  xKey="channel"
  series={[{ key: "signups", label: "Signups", color: "var(--chart-1)" }]}
  orientation="horizontal"
  showGrid
  radius={4}
  title="Acquisition channels"
  description="Horizontal layout keeps lengthy category names readable."
/>`}
      />

      <ExampleFrame
        id="grouped-legend"
        title="Grouped series with legend"
        description="Related metrics sit side-by-side. The HTML legend toggles visibility without moving keyboard focus off the chart surface."
        badges={["grouped", "showLegend", "onBarClick"]}
        preview={<BarSelectionDemo />}
        code={`import { BarChart } from "@kamod-ch/charts/bar";

<BarChart
  data={data}
  xKey="segment"
  series={[
    { key: "units", id: "units", label: "Units shipped", color: "var(--chart-1)" },
    { key: "returns", id: "returns", label: "Returns", color: "var(--chart-2)" },
  ]}
  grouped
  showLegend
  tooltip
  onBarClick={(datum, seriesId, index, value) => {
    console.log(seriesId, datum, index, value);
  }}
  title="Product mix by segment"
  description="Grouped bars with legend toggles and pointer or Enter selection."
/>`}
      />

      <ExampleFrame
        id="stacked-series"
        title="Stacked composition"
        description="Stack series to show part-to-whole relationships. Tooltip rows still expose each series’ raw value."
        badges={["stacked", "tooltip"]}
        preview={
          <BarChart
            {...sharedFrame}
            data={shipmentWeeks}
            xKey="week"
            series={[
              { key: "onTime", label: "On time", color: chartColors.primary },
              { key: "late", label: "Late", color: chartColors.secondary },
              { key: "damaged", label: "Damaged", color: chartColors.tertiary },
            ]}
            stacked
            tooltip
            radius={4}
            title="Shipment outcome mix"
            description="Stacked segments per carrier week with raw values in tooltips."
          />
        }
        code={`import { BarChart } from "@kamod-ch/charts/bar";

<BarChart
  data={weeks}
  xKey="week"
  series={[
    { key: "onTime", label: "On time", color: "var(--chart-1)" },
    { key: "late", label: "Late", color: "var(--chart-2)" },
    { key: "damaged", label: "Damaged", color: "var(--chart-3)" },
  ]}
  stacked
  tooltip
  title="Shipment outcome mix"
  description="Stacked segments per carrier week with raw values in tooltips."
/>`}
      />

      <ExampleFrame
        id="signed-fill"
        title="Signed values with typed fill"
        description="Use a BarFill accessor for datum-driven color, but pair it with labels or tooltips so sign is not conveyed by hue alone."
        badges={["fill", "valueLabels", "a11y"]}
        preview={
          <BarChart
            {...sharedFrame}
            data={cashflowLedger}
            xKey="period"
            series={[
              {
                key: "balance",
                label: "Net cashflow",
                color: chartColors.primary,
                fill: signedFill,
              },
            ]}
            valueLabels={{
              position: "outside",
              format: (value) => (value >= 0 ? `+${value}` : String(value)),
            }}
            tooltip
            radius={4}
            title="Monthly net cashflow"
            description="Bars show explicit plus or minus prefixes; color reinforces but does not replace the sign."
          />
        }
        code={`import { BarChart } from "@kamod-ch/charts/bar";
import type { BarDatumContext } from "@kamod-ch/charts";

const signedFill = (context: BarDatumContext<Row>) =>
  context.value >= 0 ? "var(--chart-1)" : "var(--chart-3)";

<BarChart
  data={ledger}
  xKey="period"
  series={[
    {
      key: "balance",
      label: "Net cashflow",
      color: "var(--chart-1)",
      fill: signedFill,
    },
  ]}
  valueLabels={{
    position: "outside",
    format: (value) => (value >= 0 ? \`+\${value}\` : String(value)),
  }}
  tooltip
  title="Monthly net cashflow"
  description="Explicit sign in labels; color is supplemental."
/>`}
      />

      <ExampleFrame
        id="value-labels"
        title="Formatted value labels"
        description="Pass BarValueLabelOptions for placement, formatting, and styling. Returning null from format suppresses a label."
        badges={["valueLabels", "format"]}
        preview={
          <BarChart
            {...sharedFrame}
            data={weeklyDeployments}
            xKey="day"
            series={[{ key: "deploys", label: "Deploys", color: chartColors.primary }]}
            valueLabels={{
              position: "outside",
              offset: 8,
              color: "currentColor",
              format: (value) => (value == null ? null : `${formatNumber(value)} deploys`),
            }}
            radius={4}
            title="Deploy count labels"
            description="Outside labels with compact number formatting."
          />
        }
        code={`import { BarChart } from "@kamod-ch/charts/bar";

<BarChart
  data={data}
  xKey="day"
  series={[{ key: "deploys", label: "Deploys", color: "var(--chart-1)" }]}
  valueLabels={{
    position: "outside",
    offset: 8,
    format: (value) => (value == null ? null : \`\${value} deploys\`),
  }}
  title="Deploy count labels"
/>`}
      />

      <ExampleFrame
        id="stacked-compact"
        title="Compact stacked chart"
        description="A shorter frame with stacked bars, nearest tooltips, and legend toggles — suited to dense dashboard tiles."
        badges={["stacked", "tooltip", "showLegend"]}
        preview={
          <BarChart
            {...compactFrame}
            data={productMix}
            xKey="segment"
            series={[
              { key: "units", label: "Units", color: chartColors.primary },
              { key: "returns", label: "Returns", color: chartColors.secondary },
            ]}
            stacked
            showLegend
            tooltip={{ mode: "nearest" }}
            radius={3}
            title="Units and returns"
            description="Compact stacked tile with legend and nearest tooltips."
          />
        }
        code={`import { BarChart } from "@kamod-ch/charts/bar";

<BarChart
  data={mix}
  xKey="segment"
  series={[
    { key: "units", label: "Units", color: "var(--chart-1)" },
    { key: "returns", label: "Returns", color: "var(--chart-2)" },
  ]}
  stacked
  showLegend
  tooltip={{ mode: "nearest" }}
  height={168}
  responsive
  title="Units and returns"
/>`}
      />

      <ExampleFrame
        id="carrier-mtd"
        title="Carrier week with MTD band"
        description="Highlight a category interval with referenceAreas. x1/x2 always refer to categories even when the chart is horizontal."
        badges={["referenceAreas", "grouped"]}
        preview={
          <BarChart
            {...sharedFrame}
            data={shipmentWeeks}
            xKey="week"
            series={[
              { key: "onTime", label: "On time", color: chartColors.primary },
              { key: "late", label: "Late", color: chartColors.secondary },
            ]}
            grouped
            showLegend
            tooltip
            radius={4}
            referenceAreas={[
              {
                id: "mtd-window",
                x1: "W01",
                x2: "W03",
                label: "MTD window",
                fill: "var(--chart-reference-area)",
                fillOpacity: 0.4,
              },
            ]}
            title="Carrier SLA review"
            description="Month-to-date category band behind grouped shipment bars."
          />
        }
        code={`import { BarChart } from "@kamod-ch/charts/bar";

<BarChart
  data={weeks}
  xKey="week"
  series={[
    { key: "onTime", label: "On time", color: "var(--chart-1)" },
    { key: "late", label: "Late", color: "var(--chart-2)" },
  ]}
  grouped
  showLegend
  tooltip
  referenceAreas={[
    {
      id: "mtd-window",
      x1: "W01",
      x2: "W03",
      label: "MTD window",
      fill: "var(--chart-reference-area)",
      fillOpacity: 0.4,
    },
  ]}
  title="Carrier SLA review"
  description="Month-to-date category band behind grouped shipment bars."
/>`}
      />

      <AccessibilityNotes
        title="Bar chart accessibility"
        items={[
          "Set title and description on every production chart — they render into SVG title and desc elements.",
          "Tooltips expose a polite live region for pointer and keyboard updates; bar charts default to nearest mode.",
          "Legend buttons toggle series visibility while the chart surface keeps focus for arrow-key navigation.",
          "For signed or thresholded data, expose the sign or status in labels or tooltips — not color alone.",
          "Reference area labels are decorative (aria-hidden) and never receive tab stops.",
        ]}
      />
    </div>
  );
}
