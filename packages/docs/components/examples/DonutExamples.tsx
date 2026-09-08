import { DonutChart } from "@kamod-ch/charts/donut";
import type { DonutCenterContext, PieSliceContext } from "@kamod-ch/charts";
import { chartColors } from "../../data/datasets";
import {
  halfYearProgress,
  revenueSegments,
  storageQuota,
  type RevenueSegment,
  type StorageQuotaRow,
} from "../../data/donut-datasets";
import { formatNumber, formatPercent } from "../../data/formatters";
import { AccessibilityNotes, ResponsivePreview } from "../shared/AccessibilityNotes";
import { ExampleFrame } from "../shared/ExampleFrame";
import type { JSX } from "preact";

const palette = [
  chartColors.primary,
  chartColors.secondary,
  chartColors.tertiary,
  chartColors.quaternary,
];

const wideFrame = {
  height: 300,
  initialWidth: 640,
  responsive: true as const,
};

const compactFrame = {
  height: 280,
  initialWidth: 520,
  responsive: true as const,
};

const halfFrame = {
  height: 260,
  initialWidth: 480,
  responsive: true as const,
};

const revenueFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

function formatRevenueValue(value: number, _context: PieSliceContext<RevenueSegment>): string {
  return revenueFormatter.format(value * 1000);
}

function formatRevenuePercent(percentage: number): string {
  return formatPercent(percentage);
}

function formatHalfTotal(total: number, context: DonutCenterContext<(typeof halfYearProgress)[0]>) {
  return (
    <g>
      <text text-anchor="middle" dominant-baseline="middle" y={-6} font-size="10">
        Visible total
      </text>
      <text text-anchor="middle" dominant-baseline="middle" y={12} font-size="18" font-weight="600">
        {formatNumber(total)}k · {context.visibleCount}/{context.segmentCount}
      </text>
    </g>
  );
}

function renderKpiLabel(context: DonutCenterContext<StorageQuotaRow>): JSX.Element {
  const used = context.data.find((row) => row.label === "Used")?.gigabytes ?? 0;
  const capacity = context.grandTotal;
  const percent = capacity > 0 ? Math.round((used / capacity) * 100) : 0;

  return (
    <g aria-hidden="true">
      <text text-anchor="middle" dominant-baseline="middle" font-size="24" font-weight="600">
        {percent}%
      </text>
      <text text-anchor="middle" dominant-baseline="middle" y={18} font-size="10">
        used
      </text>
    </g>
  );
}

export function DonutHeroDemo(): JSX.Element {
  return (
    <DonutChart
      data={revenueSegments}
      valueKey="revenue"
      labelKey="product"
      height={320}
      initialWidth={760}
      responsive
      colors={palette}
      tooltip
      showLegend
      title="Revenue split"
      description="Full donut with default ring opening, rounded corners, slice gaps, outside labels, and automatic center total."
    />
  );
}

export function DonutExamples(): JSX.Element {
  return (
    <div class="space-y-6">
      <ExampleFrame
        id="revenue-split"
        title="Revenue split"
        description="Full variant with DonutChart defaults: innerRadiusRatio 0.68, cornerRadius 6, padAngle π/90 (~2°), outside labels with leader lines, and showTotal in the center. Tooltip and legend are enabled explicitly because both default to false."
        badges={["variant=full", "tooltip", "showLegend", "labels=outside"]}
        preview={
          <ResponsivePreview label="Resize for mobile — outside labels reflow and the center total stays inside the hole. Long legend labels wrap in the HTML legend.">
            <DonutChart
              {...wideFrame}
              data={revenueSegments}
              valueKey="revenue"
              labelKey="product"
              colors={palette}
              tooltip={{
                formatValue: formatRevenueValue,
                formatPercentage: formatRevenuePercent,
              }}
              showLegend
              title="Revenue split by product line"
              description="Share of quarterly revenue. Tab to the chart, use arrow keys to move between slices, and Enter to activate. Legend toggles update visible totals."
            />
          </ResponsivePreview>
        }
        code={`import { DonutChart } from "@kamod-ch/charts/donut";

const revenueFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
});

<DonutChart
  data={rows}
  valueKey="revenue"
  labelKey="product"
  height={300}
  initialWidth={640}
  responsive
  tooltip={{
    formatValue: (value) => revenueFmt.format(value * 1000),
  }}
  showLegend
  title="Revenue split by product line"
  description="Share of quarterly revenue with keyboard navigation and legend toggles."
/>`}
      />

      <ExampleFrame
        id="filled-donut"
        title="Filled donut (innerRadiusRatio=0)"
        description="Setting innerRadiusRatio to 0 removes the hole entirely. This is clearer than UIpkge thickness={0}, which still implies a ring component. For a permanent filled pie without ratio semantics, prefer PieChart."
        badges={["innerRadiusRatio=0", "filled"]}
        preview={
          <DonutChart
            {...compactFrame}
            data={revenueSegments.slice(0, 4)}
            valueKey="revenue"
            labelKey="product"
            colors={palette}
            innerRadiusRatio={0}
            labels="inside"
            showTotal={false}
            title="Filled revenue disc"
            description="No center hole — innerRadiusRatio is explicitly zero."
          />
        }
        code={`import { DonutChart } from "@kamod-ch/charts/donut";

<DonutChart
  data={rows}
  valueKey="revenue"
  labelKey="product"
  innerRadiusRatio={0}
  labels="inside"
  showTotal={false}
  title="Filled revenue disc"
  description="Prefer PieChart when you never need ratio-based rings."
/>`}
      />

      <ExampleFrame
        id="half-donut"
        title="Half donut progress"
        description='variant="half" renders the upper semicircle. Labels default to outside on full donuts but are set to "none" here so the baseline stays clean. showTotal renders below the arc in the reserved bottom zone. Tooltip, legend, and keyboard navigation mirror PieChart.'
        badges={["variant=half", "labels=none", "keyboard"]}
        preview={
          <DonutChart
            {...halfFrame}
            data={halfYearProgress}
            valueKey="amount"
            labelKey="quarter"
            colors={[chartColors.primary, chartColors.secondary]}
            variant="half"
            labels="none"
            formatTotal={formatHalfTotal}
            tooltip
            showLegend
            title="Half-year attainment"
            description="Semicircle progress with legend toggles, slice tooltips, and arrow-key navigation when the chart is focused."
          />
        }
        code={`import { DonutChart } from "@kamod-ch/charts/donut";

<DonutChart
  data={rows}
  valueKey="amount"
  labelKey="quarter"
  variant="half"
  labels="none"
  formatTotal={(total, ctx) => \`\${total}k (\${ctx.visibleCount}/\${ctx.segmentCount})\`}
  tooltip
  showLegend
  title="Half-year attainment"
  description="Semicircle with total below the arc and keyboard-friendly legend toggles."
/>`}
      />

      <ExampleFrame
        id="kpi-ring"
        title="KPI ring"
        description='Used versus available capacity. centerContent="68%" works for static copy; the render function derives the percentage from DonutCenterContext without misusing progressbar semantics — use title and description for the metric meaning.'
        badges={["centerContent", "title", "description"]}
        preview={
          <DonutChart
            {...compactFrame}
            data={storageQuota}
            valueKey="gigabytes"
            labelKey="label"
            colors={[chartColors.primary, chartColors.quaternary]}
            labels="none"
            showTotal={false}
            centerContent={renderKpiLabel}
            title="Workspace storage utilization"
            description="680 GB used of 1 TB provisioned capacity. This chart summarizes utilization; it is not a live progressbar control."
          />
        }
        code={`import { DonutChart } from "@kamod-ch/charts/donut";
import type { DonutCenterContext } from "@kamod-ch/charts/donut";

<DonutChart
  data={[
    { label: "Used", gigabytes: 680 },
    { label: "Available", gigabytes: 320 },
  ]}
  valueKey="gigabytes"
  labelKey="label"
  labels="none"
  showTotal={false}
  centerContent={(ctx: DonutCenterContext<Row>) => {
    const used = ctx.data.find((row) => row.label === "Used")?.gigabytes ?? 0;
    const pct = ctx.grandTotal > 0 ? Math.round((used / ctx.grandTotal) * 100) : 0;
    return \`\${pct}%\`;
  }}
  title="Workspace storage utilization"
  description="680 GB used of 1 TB provisioned capacity."
/>`}
      />

      <AccessibilityNotes
        items={[
          "Set title and description on every production chart. Pair critical KPIs with a DataTable from @kamod-ch/charts/accessibility.",
          "Tab to the SVG surface and use ArrowLeft/ArrowRight to move between slices; Enter or Space fires onSegmentClick.",
          "Focus rings follow the active slice expansion — verify in light and dark themes.",
          "Long legend labels wrap in the HTML legend without clipping the chart frame.",
          "Responsive + initialWidth keeps SSR markup stable; respect prefers-reduced-motion via Chart animate options or @kamod-ch/charts/motion.",
        ]}
      />
    </div>
  );
}
