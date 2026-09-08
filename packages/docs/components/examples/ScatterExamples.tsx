import { ScatterChart } from "@kamod-ch/charts/scatter";
import type { CartesianTooltipContext } from "@kamod-ch/charts";
import { chartColors, conversionPoints } from "../../data/datasets";
import {
  airCargoLanes,
  airCargoRegions,
  conversionGuideSegment,
} from "../../data/scatter-datasets";
import { AccessibilityNotes } from "../shared/AccessibilityNotes";
import { ExampleFrame } from "../shared/ExampleFrame";
import type { JSX } from "preact";

const sharedFrame = {
  height: 240,
  initialWidth: 640,
  responsive: true as const,
};

const compactFrame = {
  height: 220,
  initialWidth: 520,
  responsive: true as const,
};

const bubbleTooltip = ({
  scatterPoint,
  xLabel,
}: CartesianTooltipContext<(typeof conversionPoints)[number]>) => {
  if (!scatterPoint) {
    return null;
  }

  return (
    <div data-kamod-chart-tooltip-content="">
      <div data-kamod-chart-tooltip-label="">{xLabel ?? scatterPoint.xValue}</div>
      <div data-kamod-chart-tooltip-row="">
        <span>{scatterPoint.categoryLabel ?? "Point"}</span>
        <span>
          {" "}
          — y: {scatterPoint.yValue ?? "–"}, size: {scatterPoint.sizeValue ?? "–"}
        </span>
      </div>
    </div>
  );
};

export function ScatterHeroDemo(): JSX.Element {
  return (
    <ScatterChart
      data={airCargoLanes}
      xKey="transitDays"
      xScale="linear"
      series={[{ key: "rateUsdPerKg", label: "Rate (USD/kg)", color: chartColors.primary }]}
      sizeKey="tonnage"
      categoryKey="region"
      categories={[...airCargoRegions]}
      height={320}
      initialWidth={760}
      responsive
      showGrid
      showLegend
      tooltip
      title="Air cargo rate vs transit time"
      description="Bubble area shows tonnage; color encodes region. Keyboard-focus the chart surface for marker navigation."
    />
  );
}

export function ScatterExamples(): JSX.Element {
  return (
    <div class="space-y-6">
      <ExampleFrame
        id="basic"
        title="Basic scatter"
        description="One Y series with default marker radius (4px), grid, and nearest tooltip."
        badges={["single series", "showGrid", "tooltip"]}
        preview={
          <ScatterChart
            {...compactFrame}
            data={conversionPoints}
            xKey="visitors"
            xScale="linear"
            series={[{ key: "conversion", label: "Conversion %", color: chartColors.primary }]}
            showGrid
            tooltip
            title="Conversion scatter"
            description="Visitor volume vs conversion rate."
          />
        }
        code={`import { ScatterChart } from "@kamod-ch/charts/scatter";

<ScatterChart
  data={data}
  xKey="visitors"
  xScale="linear"
  series={[{ key: "conversion", label: "Conversion %", color: "var(--chart-1)" }]}
  height={220}
  initialWidth={520}
  responsive
  showGrid
  tooltip
  title="Conversion scatter"
/>`}
      />

      <ExampleFrame
        id="bubble-sized"
        title="Bubble / sized markers"
        description="Map a third numeric field to radius with sizeKey. Defaults to sqrt scaling so bubble area tracks the value; pointRadiusRange caps pixel size."
        badges={["sizeKey", "sizeScale", "pointRadiusRange"]}
        preview={
          <ScatterChart
            {...compactFrame}
            data={conversionPoints}
            xKey="visitors"
            xScale="linear"
            series={[{ key: "conversion", label: "Conversion %", color: chartColors.primary }]}
            sizeKey="visitors"
            sizeScale="sqrt"
            pointRadiusRange={[4, 16]}
            showGrid
            tooltip
            title="Visitor volume as bubble size"
          />
        }
        code={`import { ScatterChart } from "@kamod-ch/charts/scatter";

<ScatterChart
  data={data}
  xKey="visitors"
  xScale="linear"
  series={[{ key: "conversion", label: "Conversion %", color: "var(--chart-1)" }]}
  sizeKey="visitors"
  sizeScale="sqrt"
  pointRadiusRange={[4, 16]}
  showGrid
  tooltip
/>`}
      />

      <ExampleFrame
        id="categorical-color"
        title="Categorical color"
        description="Color markers by plan tier. Legend buttons toggle category visibility — use one Y series when categoryKey drives color."
        badges={["categoryKey", "categories", "showLegend"]}
        preview={
          <ScatterChart
            {...compactFrame}
            data={conversionPoints}
            xKey="visitors"
            xScale="linear"
            series={[{ key: "conversion", label: "Conversion %" }]}
            categoryKey="plan"
            categories={[
              { value: "Free", label: "Free", color: chartColors.quaternary },
              { value: "Starter", label: "Starter", color: chartColors.secondary },
              { value: "Pro", label: "Pro", color: chartColors.primary },
              { value: "Business", label: "Business", color: chartColors.tertiary },
            ]}
            showLegend
            showGrid
            tooltip
            title="Conversion by plan tier"
            description="Click legend items to hide or show categories."
          />
        }
        code={`import { ScatterChart } from "@kamod-ch/charts/scatter";

<ScatterChart
  data={data}
  xKey="visitors"
  xScale="linear"
  series={[{ key: "conversion", label: "Conversion %" }]}
  categoryKey="plan"
  categories={[
    { value: "Free", label: "Free", color: "var(--chart-4)" },
    { value: "Starter", label: "Starter", color: "var(--chart-2)" },
    { value: "Pro", label: "Pro", color: "var(--chart-1)" },
    { value: "Business", label: "Business", color: "var(--chart-3)" },
  ]}
  showLegend
  tooltip
/>`}
      />

      <ExampleFrame
        id="bubble-categorical"
        title="Bubble + categorical"
        description="Combine x, y, size, and category. Custom tooltip.render reads scatterPoint for raw field values."
        badges={["sizeKey", "categoryKey", "tooltip.render"]}
        preview={
          <ScatterChart
            {...compactFrame}
            data={conversionPoints}
            xKey="visitors"
            xScale="linear"
            series={[{ key: "conversion", label: "Conversion %" }]}
            sizeKey="visitors"
            pointRadiusRange={[4, 14]}
            categoryKey="plan"
            categories={[
              { value: "Free", label: "Free", color: chartColors.quaternary },
              { value: "Starter", label: "Starter", color: chartColors.secondary },
              { value: "Pro", label: "Pro", color: chartColors.primary },
              { value: "Business", label: "Business", color: chartColors.tertiary },
            ]}
            showLegend
            showGrid
            tooltip={{ render: bubbleTooltip }}
            title="Sized markers by plan"
          />
        }
        code={`import { ScatterChart } from "@kamod-ch/charts/scatter";
import type { CartesianTooltipContext } from "@kamod-ch/charts";

const tooltip = ({ scatterPoint, xLabel }: CartesianTooltipContext<Datum>) =>
  scatterPoint ? (
    <div>
      <div>{xLabel}</div>
      <div>
        {scatterPoint.categoryLabel}: y={scatterPoint.yValue}, size={scatterPoint.sizeValue}
      </div>
    </div>
  ) : null;

<ScatterChart
  data={data}
  sizeKey="visitors"
  categoryKey="plan"
  categories={[/* … */]}
  tooltip={{ render: tooltip }}
  /* … */
/>`}
      />

      <ExampleFrame
        id="trend-segment"
        title="Guide segment (not regression)"
        description="referenceSegments draw a diagonal line between explicit start/end coordinates. Kamod renders your precomputed endpoints — it does not fit regression or compute statistics."
        badges={["referenceSegments"]}
        preview={
          <ScatterChart
            {...compactFrame}
            data={conversionPoints}
            xKey="visitors"
            xScale="linear"
            series={[{ key: "conversion", label: "Conversion %", color: chartColors.primary }]}
            referenceSegments={[
              {
                id: "guide-trend",
                start: conversionGuideSegment.start,
                end: conversionGuideSegment.end,
                label: "Planning guide",
                labelPosition: "middle",
                strokeDasharray: "6 4",
                strokeWidth: 2,
                color: "var(--chart-reference-line)",
              },
            ]}
            showGrid
            tooltip
            title="Conversion with guide segment"
          />
        }
        code={`import { ScatterChart } from "@kamod-ch/charts/scatter";

// Endpoints come from your analytics layer — not computed by the chart.
<ScatterChart
  data={data}
  referenceSegments={[
    {
      id: "guide-trend",
      start: { x: 420, y: 4.2 },
      end: { x: 3640, y: 14.1 },
      label: "Planning guide",
      labelPosition: "middle",
      strokeDasharray: "6 4",
    },
  ]}
  /* … */
/>`}
      />

      <ExampleFrame
        id="air-cargo-rate"
        title="Rate vs transit time"
        description="Operational air-cargo lanes: transit days on X, USD/kg rate on Y, tonnage as bubble size, region as color. Includes a target band and an outlier marker."
        badges={["sizeKey", "categoryKey", "referenceAreas", "referencePoints"]}
        preview={
          <ScatterChart
            {...sharedFrame}
            data={airCargoLanes}
            xKey="transitDays"
            xScale="linear"
            series={[{ key: "rateUsdPerKg", label: "Rate (USD/kg)" }]}
            sizeKey="tonnage"
            pointRadiusRange={[5, 18]}
            categoryKey="region"
            categories={[...airCargoRegions]}
            referenceAreas={[
              {
                id: "target-band",
                y1: 2.2,
                y2: 3.4,
                label: "Target band",
                fill: "var(--chart-reference-area)",
                fillOpacity: 0.35,
              },
            ]}
            referencePoints={[
              {
                id: "premium-outlier",
                x: 2,
                y: 5.15,
                label: "Premium outlier",
                shape: "diamond",
                labelPosition: "top",
                color: "var(--chart-reference-point)",
              },
            ]}
            showGrid
            showLegend
            tooltip
            title="Air cargo rate vs transit time"
            description="Each marker is an active lane. Bubble area reflects monthly tonnage; color shows trade region. Tab to the chart and use arrow keys to inspect lanes."
          />
        }
        code={`import { ScatterChart } from "@kamod-ch/charts/scatter";

<ScatterChart
  data={lanes}
  xKey="transitDays"
  xScale="linear"
  series={[{ key: "rateUsdPerKg", label: "Rate (USD/kg)" }]}
  sizeKey="tonnage"
  pointRadiusRange={[5, 18]}
  categoryKey="region"
  categories={[
    { value: "Transatlantic", label: "Transatlantic", color: "var(--chart-1)" },
    { value: "Asia-Pacific", label: "Asia-Pacific", color: "var(--chart-2)" },
    /* … */
  ]}
  referenceAreas={[{ id: "target-band", y1: 2.2, y2: 3.4, label: "Target band" }]}
  referencePoints={[
    { id: "premium-outlier", x: 2, y: 5.15, label: "Premium outlier", shape: "diamond" },
  ]}
  showLegend
  showGrid
  tooltip
  title="Air cargo rate vs transit time"
  description="Each marker is an active lane."
/>`}
      />

      <AccessibilityNotes
        title="Scatter chart accessibility"
        items={[
          "Set title and description on every production chart — they render into SVG title and desc elements.",
          "Scatter uses nearest tooltip mode with bubble-aware hit-testing; keyboard navigation walks valid markers only.",
          "In category mode the legend toggles categories — category label and Y value appear in the default tooltip and live region.",
          "Do not rely on color or bubble area alone: tooltips and keyboard focus expose Y, size, and category text.",
          "Reference segments, areas, and points are decorative (aria-hidden) and never receive pointer hits.",
          "Test light and dark themes with CSS chart tokens; long category labels wrap in the HTML legend.",
        ]}
      />
    </div>
  );
}
