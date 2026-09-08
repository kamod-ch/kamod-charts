import { AreaChart } from "@kamod-ch/charts/area";
import { BarChart } from "@kamod-ch/charts/bar";
import { LineChart } from "@kamod-ch/charts/line";
import { PieChart } from "@kamod-ch/charts/pie";
import { ScatterChart } from "@kamod-ch/charts/scatter";
import { AccessibilityIcon, ComponentIcon, LineChartIcon } from "@kamod-ch/icons/shadcn";
import { Badge, Button, Input } from "@kamod-ch/ui";
import { cn } from "@kamod-ch/ui/lib/utils";
import { useMemo, useState } from "preact/hooks";
import type { JSX } from "preact";
import {
  chartColors,
  conversionPoints,
  emptyMetrics,
  halfYearMetrics,
  monthlyMetrics,
  trafficSources,
  weeklyDeployments,
} from "../../data/datasets";
import { carrierCapacityMix, regionalParcelVolumes } from "../../data/pie-datasets";
import { type ChartKind, galleryExamples } from "../../data/gallery";
import { ChartCard } from "../shared/ChartCard";

const filters: Array<{ id: "all" | ChartKind; label: string }> = [
  { id: "all", label: "All" },
  { id: "line", label: "Line" },
  { id: "area", label: "Area" },
  { id: "bar", label: "Bar" },
  { id: "pie", label: "Pie" },
  { id: "scatter", label: "Scatter" },
];

const palette = [
  chartColors.primary,
  chartColors.secondary,
  chartColors.tertiary,
  chartColors.quaternary,
];

function GalleryPreview({ id }: { id: string }): JSX.Element {
  switch (id) {
    case "line-basic":
      return (
        <LineChart
          data={halfYearMetrics}
          xKey="month"
          xScale="point"
          series={[{ key: "revenue", label: "Revenue", color: chartColors.primary }]}
          height={180}
          initialWidth={420}
          responsive
          showGrid
          tooltip
          title="Revenue over time"
        />
      );
    case "line-multi":
      return (
        <LineChart
          data={halfYearMetrics}
          xKey="month"
          xScale="point"
          series={[
            { key: "revenue", label: "Revenue", color: chartColors.primary },
            { key: "costs", label: "Costs", color: chartColors.secondary },
          ]}
          height={180}
          initialWidth={420}
          responsive
          showGrid
          showLegend
          tooltip
          curve="monotoneX"
          title="Revenue vs costs"
        />
      );
    case "area-basic":
      return (
        <AreaChart
          data={monthlyMetrics.slice(0, 8)}
          xKey="month"
          xScale="point"
          series={[{ key: "revenue", label: "Revenue", color: chartColors.primary }]}
          height={180}
          initialWidth={420}
          responsive
          showGrid
          outline
          opacity={0.28}
          curve="monotoneX"
          title="Usage area"
        />
      );
    case "area-stacked":
      return (
        <AreaChart
          data={halfYearMetrics}
          xKey="month"
          xScale="point"
          series={[
            { key: "revenue", label: "Revenue", color: chartColors.primary },
            { key: "costs", label: "Costs", color: chartColors.secondary },
          ]}
          height={180}
          initialWidth={420}
          responsive
          showGrid
          stacked
          outline
          tooltip
          title="Stacked costs"
        />
      );
    case "area-gradient":
      return (
        <AreaChart
          data={monthlyMetrics.slice(0, 8)}
          xKey="month"
          xScale="point"
          series={[{ key: "revenue", label: "Revenue", color: chartColors.primary }]}
          height={180}
          initialWidth={420}
          responsive
          fill={{ type: "gradient", fromOpacity: 0.4, toOpacity: 0 }}
          title="Gradient fill"
        />
      );
    case "area-markers":
      return (
        <AreaChart
          data={halfYearMetrics}
          xKey="month"
          xScale="point"
          series={[{ key: "revenue", label: "Revenue", color: chartColors.primary }]}
          height={180}
          initialWidth={420}
          responsive
          showPoints
          outline
          tooltip
          title="Markers on"
        />
      );
    case "bar-basic":
      return (
        <BarChart
          data={weeklyDeployments}
          xKey="day"
          series={[{ key: "deploys", label: "Deploys", color: chartColors.primary }]}
          height={180}
          initialWidth={420}
          responsive
          showGrid
          radius={4}
          title="Weekly deploys"
        />
      );
    case "bar-grouped":
      return (
        <BarChart
          data={weeklyDeployments}
          xKey="day"
          series={[
            { key: "deploys", label: "Deploys", color: chartColors.primary },
            { key: "failures", label: "Failures", color: chartColors.secondary },
          ]}
          height={180}
          initialWidth={420}
          responsive
          showGrid
          showLegend
          grouped
          radius={4}
          title="Deploys vs failures"
        />
      );
    case "pie-basic":
      return (
        <PieChart
          data={trafficSources}
          valueKey="value"
          labelKey="name"
          height={180}
          initialWidth={420}
          responsive
          colors={palette}
          showLegend
          tooltip
          title="Regional parcel share"
        />
      );
    case "pie-donut":
      return (
        <PieChart
          data={trafficSources}
          valueKey="value"
          labelKey="name"
          height={180}
          initialWidth={420}
          responsive
          colors={palette}
          innerRadius={42}
          labels="outside"
          title="Acquisition mix"
        />
      );
    case "pie-rose":
      return (
        <PieChart
          data={regionalParcelVolumes}
          valueKey="value"
          labelKey="name"
          height={180}
          initialWidth={420}
          responsive
          colors={palette}
          rose
          labels="outside"
          title="Regional volumes"
        />
      );
    case "pie-carrier":
      return (
        <PieChart
          data={carrierCapacityMix}
          valueKey="parcels"
          labelKey="lane"
          height={180}
          initialWidth={420}
          responsive
          colors={[chartColors.primary, chartColors.tertiary, chartColors.secondary]}
          innerRadius={36}
          labels="none"
          showLegend
          title="Hub capacity"
          centerContent={<span class="text-xs font-semibold">79%</span>}
        />
      );
    case "scatter-basic":
      return (
        <ScatterChart
          data={conversionPoints}
          xKey="visitors"
          xScale="linear"
          series={[{ key: "conversion", label: "Conversion", color: chartColors.primary }]}
          height={180}
          initialWidth={420}
          responsive
          showGrid
          tooltip
          title="Conversion scatter"
        />
      );
    case "line-empty":
      return (
        <LineChart
          data={emptyMetrics}
          xKey="month"
          xScale="point"
          series={[{ key: "revenue", label: "Revenue" }]}
          height={180}
          initialWidth={420}
          responsive
          title="Empty state"
        />
      );
    case "line-responsive":
      return (
        <LineChart
          data={halfYearMetrics}
          xKey="month"
          xScale="point"
          series={[{ key: "revenue", label: "Revenue", color: chartColors.primary }]}
          height={180}
          initialWidth={420}
          responsive
          showGrid
          tooltip
          title="Responsive line"
        />
      );
    case "bar-colors":
      return (
        <BarChart
          data={weeklyDeployments}
          xKey="day"
          series={[
            { key: "deploys", label: "Deploys", color: chartColors.primary },
            { key: "failures", label: "Failures", color: chartColors.quaternary },
          ]}
          height={180}
          initialWidth={420}
          responsive
          showGrid
          showLegend
          radius={4}
          title="Custom palette"
        />
      );
    default:
      return <div class="text-sm text-muted-foreground">Preview unavailable.</div>;
  }
}

export function GalleryPage(): JSX.Element {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | ChartKind>("all");

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return galleryExamples.filter((example) => {
      const matchesFilter = filter === "all" || example.kind === filter;
      const matchesQuery =
        !normalized ||
        example.title.toLowerCase().includes(normalized) ||
        example.description.toLowerCase().includes(normalized) ||
        example.kind.includes(normalized) ||
        example.tags.some((tag) => tag.includes(normalized));
      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  return (
    <div class="mx-auto w-full max-w-[var(--docs-gallery-max)] space-y-10 px-4 py-8 sm:px-6 lg:px-8">
      <section class="space-y-5">
        <p class="text-xs font-semibold tracking-[0.14em] text-[color:var(--chart-2)] uppercase">
          Kitchen sink
        </p>
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div class="space-y-3">
            <h1 class="max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Every chart. Every state.
            </h1>
            <p class="max-w-2xl text-base text-muted-foreground sm:text-lg">
              Explore the complete @kamod-ch/charts surface in one place — Preact-native, SVG-first,
              and built for accessible dashboards.
            </p>
            <div class="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                class="bg-[color:var(--brand)] text-[color:var(--brand-foreground)] hover:bg-[color:var(--brand-hover)]"
              >
                <a href="/getting-started/">Get started</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/playground/">Open playground</a>
              </Button>
            </div>
          </div>
          <div class="rounded-xl border border-border bg-muted/40 px-4 py-3 font-mono text-sm">
            <span class="text-[color:var(--brand)]">pnpm add @kamod-ch/charts</span>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-3 sm:grid-cols-3">
          <div class="flex items-center gap-2 px-2 py-1 text-sm">
            <LineChartIcon class="size-4 text-[color:var(--brand)]" />
            <span>5 charts</span>
          </div>
          <div class="flex items-center gap-2 border-border px-2 py-1 text-sm sm:border-l">
            <ComponentIcon class="size-4 text-[color:var(--brand)]" />
            <span>Composable</span>
          </div>
          <div class="flex items-center gap-2 border-border px-2 py-1 text-sm sm:border-l">
            <AccessibilityIcon class="size-4 text-[color:var(--brand)]" />
            <span>Accessible</span>
          </div>
        </div>
      </section>

      <section class="space-y-4" aria-label="Gallery filters">
        <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Input
            value={query}
            onInput={(event) => setQuery((event.currentTarget as HTMLInputElement).value)}
            placeholder="Filter examples..."
            aria-label="Filter examples"
            class="max-w-md"
          />
          <div class="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                class={cn(
                  "hit-target inline-flex items-center rounded-full border px-3 text-sm font-medium transition-colors",
                  filter === item.id
                    ? "border-transparent bg-[color:var(--brand)] text-[color:var(--brand-foreground)]"
                    : "border-border bg-background text-foreground hover:bg-muted",
                )}
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm text-muted-foreground">
            Showing {visible.length} example{visible.length === 1 ? "" : "s"}
          </p>
          <Badge variant="outline">{galleryExamples.length} total</Badge>
        </div>
      </section>

      <section
        class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        aria-label="Chart gallery"
      >
        {visible.map((example) => (
          <ChartCard
            key={example.id}
            title={example.title}
            description={example.description}
            kind={example.kind}
            href={example.href}
          >
            <GalleryPreview id={example.id} />
          </ChartCard>
        ))}
      </section>
    </div>
  );
}
