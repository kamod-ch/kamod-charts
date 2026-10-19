import { useMemo, useState } from "preact/hooks";
import { useSynchronizedCartesianSelection } from "@kamod-ch/charts";
import { BarChart } from "@kamod-ch/charts/bar";
import { LineChart } from "@kamod-ch/charts/line";

/** Synthetic fixture — not production Devjobs.ch tracking data. */
const traffic = Array.from({ length: 14 }, (_, day) => ({
  date: new Date(Date.UTC(2024, 0, day + 1)),
  views: 800 + day * 40 + (day % 3) * 120,
  prior: 700 + day * 35,
}));

const sources = [
  { source: "Organic", clicks: 420 },
  { source: "Newsletter", clicks: 180 },
  { source: "Social", clicks: 95 },
];

const hourlyClicks = [
  { t: new Date(Date.UTC(2024, 0, 7, 9)), ext: 4 },
  { t: new Date(Date.UTC(2024, 0, 7, 14)), ext: 11 },
  { t: new Date(Date.UTC(2024, 0, 7, 18)), ext: 7 },
];

export const DevjobsDashboard = () => {
  const [range, setRange] = useState<"7d" | "14d">("14d");
  const slice = useMemo(() => (range === "7d" ? traffic.slice(-7) : traffic), [range]);
  const sync = useSynchronizedCartesianSelection({ maxDeltaMs: 12 * 60 * 60 * 1000 });
  const trafficHandlers = useMemo(
    () => sync.createChartHandlers({ data: slice, xKey: "date", xScale: "time" }),
    [slice, sync],
  );
  const clickHandlers = useMemo(
    () => sync.createChartHandlers({ data: hourlyClicks, xKey: "t", xScale: "time" }),
    [sync],
  );

  return (
    <div class="not-prose space-y-6 rounded-2xl border border-border bg-card p-4 text-foreground">
      <header class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold">Devjobs.ch analytics (synthetic)</h2>
          <p class="text-sm text-muted-foreground">
            Page views, job detail views proxy, and external application clicks (not verified
            applications).
          </p>
        </div>
        <label class="text-sm">
          Range
          <select
            class="ml-2 rounded-md border border-border bg-background px-2 py-1"
            value={range}
            onChange={(event) =>
              setRange((event.currentTarget as HTMLSelectElement).value as "7d" | "14d")
            }
          >
            <option value="7d">7 days</option>
            <option value="14d">14 days</option>
          </select>
        </label>
      </header>
      <div class="grid gap-3 sm:grid-cols-3">
        <div class="rounded-xl border border-border p-3">
          <p class="text-xs text-muted-foreground">Page views (period)</p>
          <p class="text-2xl font-semibold tabular-nums">
            {slice.reduce((sum, row) => sum + row.views, 0).toLocaleString("de-CH")}
          </p>
        </div>
        <div class="rounded-xl border border-border p-3">
          <p class="text-xs text-muted-foreground">External application clicks</p>
          <p class="text-2xl font-semibold tabular-nums">
            {hourlyClicks.reduce((sum, row) => sum + row.ext, 0).toLocaleString("de-CH")}
          </p>
        </div>
        <div class="rounded-xl border border-border p-3">
          <p class="text-xs text-muted-foreground">Click / view (fixture)</p>
          <p class="text-2xl font-semibold tabular-nums">—</p>
        </div>
      </div>
      <LineChart
        data={slice}
        xKey="date"
        xScale="time"
        height={260}
        responsive
        yDomain={[0, 2000]}
        format={{ locale: "de-CH", timeZone: "Europe/Zurich" }}
        tooltip
        showGrid
        series={[
          { key: "views", label: "Views", color: "var(--chart-1)" },
          { key: "prior", label: "Prior period", color: "var(--chart-3)" },
        ]}
        activeIndex={trafficHandlers.activeIndex}
        onActiveChange={trafficHandlers.onActiveChange}
      />
      <BarChart
        data={sources}
        xKey="source"
        height={220}
        responsive
        tooltip
        series={[{ key: "clicks", label: "Clicks", color: "var(--chart-2)" }]}
      />
      <LineChart
        data={hourlyClicks}
        xKey="t"
        xScale="time"
        height={200}
        responsive
        format={{ locale: "de-CH", timeZone: "Europe/Zurich" }}
        tooltip
        title="External clicks (sparse)"
        series={[{ key: "ext", label: "External clicks", color: "var(--chart-4)" }]}
        activeIndex={clickHandlers.activeIndex}
        onActiveChange={clickHandlers.onActiveChange}
      />
    </div>
  );
};
