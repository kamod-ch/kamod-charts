import { useState } from "preact/hooks";
import type { LineSeriesConfig } from "@kamod-ch/charts";
import { LineChart } from "@kamod-ch/charts/line";

type Row = { month: string; revenue: number; costs: number };

const data: Row[] = [
  { month: "Jan", revenue: 12, costs: 8 },
  { month: "Feb", revenue: 18, costs: 9 },
  { month: "Mar", revenue: 15, costs: 11 },
];

const series: LineSeriesConfig<Row>[] = [
  { key: "revenue", id: "revenue", label: "Revenue", color: "var(--chart-1)" },
  { key: "costs", id: "costs", label: "Costs", color: "var(--chart-2)" },
];

export const ExternalLegendExample = () => {
  const [hidden, setHidden] = useState<readonly string[]>([]);

  return (
    <div class="not-prose space-y-3 rounded-xl border border-border p-4">
      <div class="flex flex-wrap gap-2" role="group" aria-label="Series visibility">
        {series.map((entry) => {
          const seriesId = entry.id ?? String(entry.key);
          const isHidden = hidden.includes(seriesId);
          return (
            <button
              key={seriesId}
              type="button"
              class="rounded-full border border-border px-3 py-1 text-sm"
              aria-pressed={isHidden}
              onClick={() =>
                setHidden((current) =>
                  current.includes(seriesId)
                    ? current.filter((id) => id !== seriesId)
                    : [...current, seriesId],
                )
              }
            >
              <span
                class="mr-2 inline-block size-2 rounded-full"
                style={{ background: entry.color }}
                aria-hidden="true"
              />
              {entry.label}
            </button>
          );
        })}
      </div>
      <LineChart
        data={data}
        xKey="month"
        height={220}
        width={520}
        tooltip
        showLegend={false}
        hiddenSeriesIds={hidden}
        onHiddenSeriesChange={setHidden}
        series={series}
      />
    </div>
  );
};
