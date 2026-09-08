import { AreaChart } from "@kamod-ch/charts/area";
import { BarChart } from "@kamod-ch/charts/bar";
import { LineChart } from "@kamod-ch/charts/line";
import { PieChart } from "@kamod-ch/charts/pie";
import { ScatterChart } from "@kamod-ch/charts/scatter";
import { DataTable } from "@kamod-ch/charts/accessibility";
import { EyeIcon, CodeIcon, AccessibilityIcon, SlidersIcon } from "@kamod-ch/icons/shadcn";
import {
  Badge,
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@kamod-ch/ui";
import { useMemo, useState } from "preact/hooks";
import type { JSX } from "preact";
import {
  chartColors,
  conversionPoints,
  halfYearMetrics,
  monthlyMetrics,
  trafficSources,
  weeklyDeployments,
} from "../../data/datasets";
import type { ChartKind } from "../../data/gallery";
import { CodePreview } from "../shared/CodePreview";

type CurveOption = "linear" | "monotoneX" | "basis" | "step" | "stepBefore" | "stepAfter";
type AreaFillOption = "solid" | "gradient";

type PlaygroundState = {
  chart: ChartKind;
  showGrid: boolean;
  showLegend: boolean;
  tooltip: boolean;
  responsive: boolean;
  connectNulls: boolean;
  stacked: boolean;
  curve: CurveOption;
  showPoints: "auto" | "true" | "false";
  areaFill: AreaFillOption;
  height: number;
  innerRadius: number;
};

const defaults: PlaygroundState = {
  chart: "line",
  showGrid: true,
  showLegend: true,
  tooltip: true,
  responsive: true,
  connectNulls: false,
  stacked: false,
  curve: "monotoneX",
  showPoints: "auto",
  areaFill: "solid",
  height: 320,
  innerRadius: 56,
};

function showPointsValue(value: PlaygroundState["showPoints"]): boolean | "auto" {
  if (value === "true") return true;
  if (value === "false") return false;
  return "auto";
}

function generateCode(state: PlaygroundState): string {
  if (state.chart === "pie") {
    return `import { PieChart } from "@kamod-ch/charts/pie";

<PieChart
  data={data}
  valueKey="value"
  labelKey="name"
  height={${state.height}}
  initialWidth={720}
  responsive={${state.responsive}}
  innerRadius={${state.innerRadius}}
  colors={["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"]}
  title="Traffic sources"
/>`;
  }

  const importPath =
    state.chart === "line"
      ? 'import { LineChart } from "@kamod-ch/charts/line";'
      : state.chart === "area"
        ? 'import { AreaChart } from "@kamod-ch/charts/area";'
        : state.chart === "bar"
          ? 'import { BarChart } from "@kamod-ch/charts/bar";'
          : 'import { ScatterChart } from "@kamod-ch/charts/scatter";';

  const component =
    state.chart === "line"
      ? "LineChart"
      : state.chart === "area"
        ? "AreaChart"
        : state.chart === "bar"
          ? "BarChart"
          : "ScatterChart";

  const extra =
    state.chart === "line"
      ? `  curve="${state.curve}"
  connectNulls={${state.connectNulls}}
  showPoints={${JSON.stringify(showPointsValue(state.showPoints))}}
`
      : state.chart === "area"
        ? `  curve="${state.curve}"
  stacked={${state.stacked}}
  outline
  fill={${state.areaFill === "gradient" ? '{ type: "gradient" }' : '"solid"'}}
  showPoints={${JSON.stringify(showPointsValue(state.showPoints))}}
`
        : state.chart === "bar"
          ? `  stacked={${state.stacked}}
  grouped={!${state.stacked}}
  radius={4}
`
          : `  xScale="linear"
  pointSize={5}
`;

  return `${importPath}

<${component}
  data={data}
  xKey="${state.chart === "scatter" ? "visitors" : state.chart === "bar" ? "day" : "month"}"${
    state.chart === "scatter"
      ? `\n  xScale="linear"`
      : state.chart === "bar"
        ? ""
        : `\n  xScale="point"`
  }
  series={[
    { key: "${state.chart === "scatter" ? "conversion" : state.chart === "bar" ? "deploys" : "revenue"}", label: "Primary", color: "var(--chart-1)" },
    { key: "${state.chart === "scatter" ? "conversion" : state.chart === "bar" ? "failures" : "costs"}", label: "Secondary", color: "var(--chart-2)" },
  ]}
  height={${state.height}}
  initialWidth={720}
  responsive={${state.responsive}}
  showGrid={${state.showGrid}}
  showLegend={${state.showLegend}}
  tooltip={${state.tooltip}}
${extra}  title="Playground chart"
/>`;
}

export function ChartLab(): JSX.Element {
  const [state, setState] = useState<PlaygroundState>(defaults);

  const patch = (partial: Partial<PlaygroundState>) =>
    setState((current) => ({ ...current, ...partial }));

  const code = useMemo(() => generateCode(state), [state]);

  const preview = (() => {
    const shared = {
      height: state.height,
      initialWidth: 720,
      responsive: state.responsive,
      showGrid: state.showGrid,
      showLegend: state.showLegend,
      tooltip: state.tooltip,
      title: "Playground chart",
    };

    switch (state.chart) {
      case "line":
        return (
          <LineChart
            {...shared}
            data={monthlyMetrics}
            xKey="month"
            xScale="point"
            series={[
              { key: "revenue", label: "Revenue", color: chartColors.primary },
              { key: "costs", label: "Costs", color: chartColors.secondary },
            ]}
            curve={state.curve}
            connectNulls={state.connectNulls}
            showPoints={showPointsValue(state.showPoints)}
            description="Interactive line chart playground."
          />
        );
      case "area":
        return (
          <AreaChart
            {...shared}
            data={halfYearMetrics}
            xKey="month"
            xScale="point"
            series={[
              { key: "revenue", label: "Revenue", color: chartColors.primary },
              { key: "costs", label: "Costs", color: chartColors.secondary },
            ]}
            curve={state.curve}
            stacked={state.stacked}
            outline
            fill={state.areaFill === "gradient" ? { type: "gradient" } : "solid"}
            showPoints={showPointsValue(state.showPoints)}
            description="Interactive area chart playground."
          />
        );
      case "bar":
        return (
          <BarChart
            {...shared}
            data={weeklyDeployments}
            xKey="day"
            series={[
              { key: "deploys", label: "Deploys", color: chartColors.primary },
              { key: "failures", label: "Failures", color: chartColors.secondary },
            ]}
            stacked={state.stacked}
            grouped={!state.stacked}
            radius={4}
            description="Interactive bar chart playground."
          />
        );
      case "pie":
        return (
          <PieChart
            data={trafficSources}
            valueKey="value"
            labelKey="name"
            height={state.height}
            initialWidth={720}
            responsive={state.responsive}
            innerRadius={state.innerRadius}
            colors={[
              chartColors.primary,
              chartColors.secondary,
              chartColors.tertiary,
              chartColors.quaternary,
            ]}
            title="Playground chart"
            description="Interactive pie chart playground."
          />
        );
      case "scatter":
        return (
          <ScatterChart
            {...shared}
            data={conversionPoints}
            xKey="visitors"
            xScale="linear"
            series={[{ key: "conversion", label: "Conversion %", color: chartColors.primary }]}
            pointSize={5}
            description="Interactive scatter chart playground."
          />
        );
    }
  })();

  const controls = (
    <div class="space-y-5">
      <div class="space-y-2">
        <Label for="chart-kind">Chart type</Label>
        <Select value={state.chart} onValueChange={(value) => patch({ chart: value as ChartKind })}>
          <SelectTrigger id="chart-kind" class="w-full">
            <SelectValue placeholder="Select chart" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="line">Line</SelectItem>
            <SelectItem value="area">Area</SelectItem>
            <SelectItem value="bar">Bar</SelectItem>
            <SelectItem value="pie">Pie</SelectItem>
            <SelectItem value="scatter">Scatter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {state.chart !== "pie" && (
        <>
          <div class="flex items-center justify-between gap-3">
            <Label for="grid-switch">Grid</Label>
            <Switch
              id="grid-switch"
              checked={state.showGrid}
              onCheckedChange={(checked) => patch({ showGrid: Boolean(checked) })}
            />
          </div>
          <div class="flex items-center justify-between gap-3">
            <Label for="legend-switch">Legend</Label>
            <Switch
              id="legend-switch"
              checked={state.showLegend}
              onCheckedChange={(checked) => patch({ showLegend: Boolean(checked) })}
            />
          </div>
          <div class="flex items-center justify-between gap-3">
            <Label for="tooltip-switch">Tooltip</Label>
            <Switch
              id="tooltip-switch"
              checked={state.tooltip}
              onCheckedChange={(checked) => patch({ tooltip: Boolean(checked) })}
            />
          </div>
        </>
      )}

      <div class="flex items-center justify-between gap-3">
        <Label for="responsive-switch">Responsive</Label>
        <Switch
          id="responsive-switch"
          checked={state.responsive}
          onCheckedChange={(checked) => patch({ responsive: Boolean(checked) })}
        />
      </div>

      {(state.chart === "line" || state.chart === "area") && (
        <div class="space-y-2">
          <Label for="curve-select">Curve</Label>
          <Select
            value={state.curve}
            onValueChange={(value) => patch({ curve: value as CurveOption })}
          >
            <SelectTrigger id="curve-select" class="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linear">linear</SelectItem>
              <SelectItem value="monotoneX">monotoneX</SelectItem>
              <SelectItem value="basis">basis</SelectItem>
              <SelectItem value="step">step</SelectItem>
              <SelectItem value="stepBefore">stepBefore</SelectItem>
              <SelectItem value="stepAfter">stepAfter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {(state.chart === "line" || state.chart === "area") && (
        <div class="space-y-2">
          <Label for="points-select">Show points</Label>
          <Select
            value={state.showPoints}
            onValueChange={(value) => patch({ showPoints: value as PlaygroundState["showPoints"] })}
          >
            <SelectTrigger id="points-select" class="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="true">Always</SelectItem>
              <SelectItem value="false">Never</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {state.chart === "area" && (
        <div class="space-y-2">
          <Label for="area-fill-select">Fill</Label>
          <Select
            value={state.areaFill}
            onValueChange={(value) => patch({ areaFill: value as AreaFillOption })}
          >
            <SelectTrigger id="area-fill-select" class="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid</SelectItem>
              <SelectItem value="gradient">Gradient</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {state.chart === "line" && (
        <>
          <div class="flex items-center justify-between gap-3">
            <Label for="nulls-switch">Connect nulls</Label>
            <Switch
              id="nulls-switch"
              checked={state.connectNulls}
              onCheckedChange={(checked) => patch({ connectNulls: Boolean(checked) })}
            />
          </div>
        </>
      )}

      {(state.chart === "area" || state.chart === "bar") && (
        <div class="flex items-center justify-between gap-3">
          <Label for="stacked-switch">Stacked</Label>
          <Switch
            id="stacked-switch"
            checked={state.stacked}
            onCheckedChange={(checked) => patch({ stacked: Boolean(checked) })}
          />
        </div>
      )}

      {state.chart === "pie" && (
        <div class="space-y-2">
          <Label for="inner-radius">Inner radius ({state.innerRadius}px)</Label>
          <Slider
            id="inner-radius"
            min={0}
            max={90}
            step={2}
            value={[state.innerRadius]}
            onValueChange={(value) => patch({ innerRadius: value[0] ?? 0 })}
          />
        </div>
      )}

      <div class="space-y-2">
        <Label for="height-slider">Height ({state.height}px)</Label>
        <Slider
          id="height-slider"
          min={180}
          max={480}
          step={10}
          value={[state.height]}
          onValueChange={(value) => patch({ height: value[0] ?? 320 })}
        />
      </div>

      <Button
        type="button"
        class="w-full bg-[color:var(--brand)] text-[color:var(--brand-foreground)] hover:bg-[color:var(--brand-hover)]"
        onClick={() => setState(defaults)}
      >
        Reset
      </Button>
    </div>
  );

  const a11y = (
    <div class="space-y-4 text-sm text-muted-foreground">
      <p>
        High-level charts expose <code>title</code> and <code>description</code> for SVG
        accessibility. Line, scatter, and pie charts support keyboard navigation when focused.
      </p>
      <ul class="list-disc space-y-2 pl-5">
        <li>Focus the chart surface, then use arrow keys where supported.</li>
        <li>Tooltips use a polite live region for pointer/keyboard updates.</li>
        <li>Prefer a data table summary for critical dashboards.</li>
      </ul>
      {state.chart !== "pie" && state.chart !== "scatter" ? (
        <DataTable
          caption="Playground data sample"
          columns={[
            { id: "month", header: "Month", accessor: "month" },
            { id: "revenue", header: "Revenue", accessor: "revenue" },
            { id: "customers", header: "Customers", accessor: "customers" },
          ]}
          data={halfYearMetrics}
        />
      ) : null}
      <div class="flex flex-wrap gap-2">
        <Badge variant="outline">Keyboard ready</Badge>
        <Badge variant="outline">SVG</Badge>
        <Badge variant="outline">0 React deps</Badge>
      </div>
    </div>
  );

  return (
    <div class="mx-auto w-full max-w-[90rem] space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header class="space-y-2">
        <div class="flex flex-wrap items-center gap-2">
          <h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Chart Lab</h1>
          <Badge class="bg-[color:var(--brand)] text-[color:var(--brand-foreground)]">
            Interactive
          </Badge>
        </div>
        <p class="max-w-2xl text-sm text-muted-foreground sm:text-base">
          Tune supported props, inspect generated code, and verify accessibility without executing
          arbitrary user scripts.
        </p>
      </header>

      <div class="hidden gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div class="space-y-4">
          <div class="docs-chart-frame overflow-visible rounded-xl border border-border bg-card p-4">
            {preview}
          </div>
          <Tabs defaultValue="code">
            <TabsList>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="a11y">A11y</TabsTrigger>
            </TabsList>
            <TabsContent value="code" class="mt-3">
              <CodePreview code={code} />
            </TabsContent>
            <TabsContent value="a11y" class="mt-3 rounded-xl border border-border p-4">
              {a11y}
            </TabsContent>
          </Tabs>
        </div>
        <aside class="rounded-xl border border-border bg-card p-4">{controls}</aside>
      </div>

      <div class="lg:hidden">
        <Tabs defaultValue="preview">
          <TabsList class="grid w-full grid-cols-4">
            <TabsTrigger value="preview" class="gap-1 text-xs sm:text-sm">
              <EyeIcon class="size-3.5" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="controls" class="gap-1 text-xs sm:text-sm">
              <SlidersIcon class="size-3.5" />
              Props
            </TabsTrigger>
            <TabsTrigger value="code" class="gap-1 text-xs sm:text-sm">
              <CodeIcon class="size-3.5" />
              Code
            </TabsTrigger>
            <TabsTrigger value="a11y" class="gap-1 text-xs sm:text-sm">
              <AccessibilityIcon class="size-3.5" />
              A11y
            </TabsTrigger>
          </TabsList>
          <TabsContent value="preview" class="mt-4">
            <div class="docs-chart-frame overflow-visible rounded-xl border border-border bg-card p-3">
              {preview}
            </div>
          </TabsContent>
          <TabsContent value="controls" class="mt-4 rounded-xl border border-border bg-card p-4">
            {controls}
          </TabsContent>
          <TabsContent value="code" class="mt-4">
            <CodePreview code={code} />
          </TabsContent>
          <TabsContent value="a11y" class="mt-4 rounded-xl border border-border p-4">
            {a11y}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
