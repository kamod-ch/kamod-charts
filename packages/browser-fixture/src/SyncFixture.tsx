import { useMemo } from "preact/hooks";
import { LineChart } from "@kamod-ch/charts/line-chart";
import { useSynchronizedCartesianSelection } from "@kamod-ch/charts";

const hourly = Array.from({ length: 12 }, (_, hour) => ({
  t: Date.UTC(2024, 5, 1, hour),
  views: 40 + hour * 3,
}));

const clicks = [
  { t: Date.UTC(2024, 5, 1, 0, 30), clicks: 2 },
  { t: Date.UTC(2024, 5, 1, 2, 15), clicks: 5 },
  { t: Date.UTC(2024, 5, 1, 5, 45), clicks: 8 },
  { t: Date.UTC(2024, 5, 1, 9, 10), clicks: 3 },
];

export const SyncFixture = () => {
  const { xValue, createChartHandlers } = useSynchronizedCartesianSelection({
    maxDeltaMs: 90 * 60 * 1000,
  });
  const trafficHandlers = useMemo(
    () => createChartHandlers({ data: hourly, xKey: "t", xScale: "time" }),
    [createChartHandlers, hourly],
  );
  const clickHandlers = useMemo(
    () => createChartHandlers({ data: clicks, xKey: "t", xScale: "time" }),
    [clicks, createChartHandlers],
  );

  return (
    <div data-testid="sync-fixture">
      <p data-testid="sync-x-value">{String(xValue ?? "")}</p>
      <LineChart
        data={hourly}
        xKey="t"
        xScale="time"
        height={200}
        width={480}
        tooltip
        title="Hourly traffic"
        series={[{ key: "views", label: "Views", color: "var(--chart-1)" }]}
        onActiveChange={trafficHandlers.onActiveChange}
      />
      <LineChart
        data={clicks}
        xKey="t"
        xScale="time"
        height={200}
        width={480}
        tooltip
        title="Application clicks"
        series={[{ key: "clicks", label: "Clicks", color: "var(--chart-2)" }]}
        activeIndex={clickHandlers.activeIndex}
        onActiveChange={clickHandlers.onActiveChange}
      />
    </div>
  );
};
