import { useEffect, useMemo, useState } from "preact/hooks";
import { BarChart } from "@kamod-ch/charts/bar-chart";
import { LineChart } from "@kamod-ch/charts/line-chart";
import { ScatterChart } from "@kamod-ch/charts/scatter-chart";
import { buildBenchSeries, type BenchKind } from "./bench-data";

declare global {
  interface Window {
    __KAMOD_BENCH__?: {
      markReady: () => void;
      markUpdated: () => void;
      getMarks: () => { ready: number[]; updated: number[] };
    };
  }
}

const parseKind = (value: string | null): BenchKind => {
  if (value === "stacked-line" || value === "bar" || value === "scatter") {
    return value;
  }
  return "line";
};

export const BenchmarkFixture = ({ kind, pointCount }: { kind: BenchKind; pointCount: number }) => {
  const [data, setData] = useState(() => buildBenchSeries(pointCount));
  const rows = useMemo(() => data, [data]);

  useEffect(() => {
    const ready: number[] = [];
    const updated: number[] = [];
    window.__KAMOD_BENCH__ = {
      markReady: () => ready.push(performance.now()),
      markUpdated: () => updated.push(performance.now()),
      getMarks: () => ({ ready, updated }),
    };
    requestAnimationFrame(() => window.__KAMOD_BENCH__?.markReady());
  }, [kind, pointCount]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setData(buildBenchSeries(pointCount, 99));
      window.__KAMOD_BENCH__?.markUpdated();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pointCount]);

  const common = {
    data: rows,
    xKey: "t" as const,
    xScale: "time" as const,
    height: 320,
    width: 960,
    tooltip: true,
    title: `Benchmark ${kind}`,
    description: `${pointCount} points (synthetic)`,
  };

  if (kind === "bar") {
    const barData = rows.filter(
      (_, index) => index % Math.max(1, Math.floor(rows.length / 24)) === 0,
    );
    return (
      <BarChart
        {...common}
        data={barData}
        xKey="t"
        series={[{ key: "a", label: "A", color: "var(--chart-1)" }]}
      />
    );
  }

  if (kind === "scatter") {
    return (
      <ScatterChart
        {...common}
        series={[
          { key: "a", label: "A", color: "var(--chart-1)" },
          { key: "c", label: "C", color: "var(--chart-2)" },
        ]}
      />
    );
  }

  if (kind === "stacked-line") {
    return (
      <LineChart
        {...common}
        stacked
        series={[
          { key: "a", label: "A", color: "var(--chart-1)" },
          { key: "c", label: "C", color: "var(--chart-2)" },
        ]}
      />
    );
  }

  return (
    <LineChart
      {...common}
      series={[
        { key: "a", label: "A", color: "var(--chart-1)" },
        { key: "c", label: "C", color: "var(--chart-2)" },
      ]}
    />
  );
};

export const parseBenchmarkParams = (search: string) => {
  const params = new URLSearchParams(search);
  return {
    bench: parseKind(params.get("bench")),
    points: Math.max(1, Number(params.get("points") ?? "500") || 500),
  };
};
