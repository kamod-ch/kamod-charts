import { useMemo } from "preact/hooks";
import type { JSX } from "preact";
import { BarChart, computeHistogramBins, histogramBinsToBarData } from "@kamod-ch/charts";

/** Synthetic API latency sample (milliseconds). */
const LATENCY_MS = [
  12,
  18,
  22,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  38,
  40,
  42,
  44,
  48,
  52,
  58,
  64,
  72,
  85,
  95,
  110,
  130,
  180,
  220,
  310,
  420,
  18,
  26,
  33,
  41,
  null,
  Number.NaN,
  29,
  31,
  150,
  240,
];

export function HistogramLatencyExample(): JSX.Element {
  const histogram = useMemo(() => computeHistogramBins(LATENCY_MS, { binCount: 8 }), []);
  const barData = useMemo(() => histogramBinsToBarData(histogram), [histogram]);

  return (
    <div class="space-y-3" data-kamod-histogram-recipe="">
      <p class="text-sm text-muted-foreground">
        Count-based histogram (not density). Tooltip shows the interval label and request count.
      </p>
      <BarChart
        data={barData}
        xKey="bin"
        series={[{ key: "count", id: "count", label: "Requests" }]}
        height={260}
        initialWidth={720}
        responsive
        showGrid
        tooltip
        title="API latency distribution"
        description="Synthetic response times in milliseconds"
      />
      <p class="text-xs text-muted-foreground">
        Assigned {histogram.assignedCount} samples · skipped {histogram.skippedCount} invalid values
      </p>
    </div>
  );
}
