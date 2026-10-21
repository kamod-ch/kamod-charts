import { useMemo, useState } from "preact/hooks";
import { LineChart } from "@kamod-ch/charts/line";
import { createTrailingTimeWindowDomain, inferContinuousXDomainFromData } from "@kamod-ch/charts";
import type { JSX } from "preact";

const buildSeries = () =>
  Array.from({ length: 180 }, (_, index) => ({
    t: new Date(Date.UTC(2024, 0, 1, 0, index)),
    cpu: 35 + Math.sin(index / 6) * 12 + (index % 17 === 0 ? 8 : 0),
  }));

const WINDOW_MINUTES = {
  short: 5,
  medium: 15,
  long: 60,
} as const;

export function LineViewportDemo(): JSX.Element {
  const data = useMemo(() => buildSeries(), []);
  const extents = useMemo(
    () => inferContinuousXDomainFromData(data, (row) => row.t, "time")!,
    [data],
  );
  const [minutes, setMinutes] = useState<number>(WINDOW_MINUTES.medium);
  const xDomain = useMemo(
    () =>
      createTrailingTimeWindowDomain(extents[1] as Date, minutes * 60_000, extents as [Date, Date]),
    [extents, minutes],
  );

  return (
    <div class="space-y-3">
      <div class="flex flex-wrap gap-2">
        {(Object.entries(WINDOW_MINUTES) as [string, number][]).map(([label, value]) => (
          <button
            key={label}
            type="button"
            class="rounded-md border border-[var(--chart-axis)] px-3 py-1 text-sm"
            aria-pressed={minutes === value}
            onClick={() => setMinutes(value)}
          >
            {value} min
          </button>
        ))}
      </div>
      <LineChart
        data={data}
        xKey="t"
        xScale="time"
        xDomain={xDomain}
        xViewportInteraction={{ wheelZoom: "modifier" }}
        yAutoscale="visible"
        series={[{ key: "cpu", label: "CPU %", id: "cpu" }]}
        height={260}
        initialWidth={720}
        responsive
        showGrid
        tooltip
        title="CPU (synthetic)"
        description="Controlled trailing window via xDomain; buttons switch 5/15/60 minutes."
      />
    </div>
  );
}
